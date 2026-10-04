package com.passpilot.app;

import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import javax.net.ssl.HttpsURLConnection;

/** Reads product metadata only. No page scripts, images, offers or personal product data. */
final class ProductCatalog {
    interface Listener { void result(Map<String,String> fields, String source, boolean complete); }
    interface Fetcher { String get(String address, String accept) throws Exception; }
    static final class Hit {
        final String source;
        final Map<String,String> fields = new LinkedHashMap<>();
        Hit(String source, String name, String brand, String model, String category) {
            this.source = source;
            put("name",name,120);put("brand",brand,80);put("model",model,100);put("categoryText",category,3000);
        }
        private void put(String key,String value,int limit) {
            String text = value == null ? "" : value.replaceAll("[\\p{Cntrl}]+"," ").replaceAll("\\s+"," ").trim();
            if (!text.isEmpty()) fields.put(key,text.substring(0,Math.min(limit,text.length())));
        }
        boolean usable() { return fields.containsKey("name"); }
    }

    static boolean validGtin(String value) {
        if (value == null || !value.matches("(?:[0-9]{8}|[0-9]{12}|[0-9]{13}|[0-9]{14})")) return false;
        int sum=0,weight=3;
        for (int i=value.length()-2;i>=0;i--) { sum+=(value.charAt(i)-'0')*weight;weight=4-weight; }
        return (10-sum%10)%10 == value.charAt(value.length()-1)-'0';
    }
    static String canonical(String value) {
        if (!validGtin(value)) return "";
        return String.format(Locale.ROOT,"%14s",value).replace(' ','0');
    }
    static boolean sameCode(String a,String b) { return validGtin(a) && canonical(a).equals(canonical(b)); }
    static String queryCode(String code) {
        // A zero-padded GTIN-14/GTIN-13 identifies the same retail item as its EAN/UPC.
        while (code.length()>12 && code.startsWith("0")) code=code.substring(1);
        return code;
    }

    static void lookup(String code, Listener listener) {
        lookup(code,ProductCatalog::get,listener);
    }
    static void lookup(String code, Fetcher fetcher, Listener listener) {
        if (!validGtin(code)) return;
        String query=queryCode(code);
        ExecutorService pool=Executors.newFixedThreadPool(4);
        CompletionService<Hit> completion=new ExecutorCompletionService<>(pool);
        List<Future<Hit>> requests=new ArrayList<>();
        requests.add(completion.submit(() -> parseGoUpc(fetcher.get("https://go-upc.com/search?q="+query,"text/html"),code)));
        requests.add(completion.submit(() -> parseBarcodeLookup(fetcher.get("https://www.barcodelookup.com/"+query,"text/html"),code)));
        requests.add(completion.submit(() -> parseUpc(new JSONObject(fetcher.get("https://api.upcitemdb.com/prod/trial/lookup?upc="+query,"application/json")),code)));
        requests.add(completion.submit(() -> facts(query,code,fetcher)));
        Map<String,String> fields=new LinkedHashMap<>();
        List<String> sources=new ArrayList<>();
        long end=System.nanoTime()+TimeUnit.SECONDS.toNanos(12);
        try {
            for (int remaining=requests.size();remaining>0;remaining--) {
                long time=end-System.nanoTime();if(time<=0)break;
                Future<Hit> request=completion.poll(time,TimeUnit.NANOSECONDS);if(request==null)break;
                Hit hit;
                try { hit=request.get(); } catch (Exception unavailable) { continue; }
                if (hit!=null && hit.usable() && merge(fields,hit)) {
                    sources.add(hit.source);
                    listener.result(new LinkedHashMap<>(fields),joinSources(sources),false);
                }
            }
            listener.result(new LinkedHashMap<>(fields),joinSources(sources),true);
        } catch (InterruptedException cancelled) { Thread.currentThread().interrupt(); }
        finally { for(Future<Hit> request:requests)request.cancel(true);pool.shutdownNow(); }
    }

    private static String joinSources(List<String> sources) {
        StringBuilder text=new StringBuilder();
        for(String source:sources){if(text.length()>0)text.append(", ");text.append(source);}
        return text.toString();
    }

    static boolean merge(Map<String,String> fields,Hit hit) {
        // Complement partial hits, but never mix conflicting brands or explicit models.
        if (conflicts(fields.get("brand"),hit.fields.get("brand"),true)
                || conflicts(fields.get("model"),hit.fields.get("model"),false)) return false;
        boolean changed=false;
        for(Map.Entry<String,String> entry:hit.fields.entrySet()) if(!fields.containsKey(entry.getKey())) {
            fields.put(entry.getKey(),entry.getValue());changed=true;
        }
        return changed;
    }
    private static boolean conflicts(String a,String b,boolean brands) {
        if (a==null || b==null) return false;
        String left=a.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N},]",""),right=b.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N},]","");
        if(left.equals(right))return false;
        if(brands)for(String x:left.split(","))for(String y:right.split(","))if(!x.isEmpty()&&x.equals(y))return false;
        return true;
    }

    static Hit parseGoUpc(String html,String code) {
        Document document=Jsoup.parse(html);
        Element name=document.selectFirst("h1.product-name");
        if(name==null)return null;
        Map<String,String> metadata=new LinkedHashMap<>();boolean matched=false;
        for(Element row:document.select("table tr")) {
            List<Element> cells=row.select("td");if(cells.size()!=2)continue;
            String key=cells.get(0).text().trim().toLowerCase(Locale.ROOT),value=cells.get(1).text().trim();
            if(key.matches("ean|upc|gtin|jan"))matched|=sameCode(value,code);
            if(key.matches("brand|category|model"))metadata.put(key,value);
        }
        return matched?new Hit("Go-UPC",name.text(),metadata.get("brand"),metadata.get("model"),metadata.get("category")):null;
    }
    static Hit parseBarcodeLookup(String html,String code) {
        Document document=Jsoup.parse(html);
        Element details=document.selectFirst(".product-details");if(details==null)return null;
        Element heading=details.selectFirst("h1"),name=details.selectFirst("h4");
        if(heading==null || name==null || !heading.text().matches("(?i)(?:EAN|UPC|GTIN|JAN)\\s+\\d{8,14}"))return null;
        String number=heading.text().replaceAll("[^0-9]","");if(!sameCode(number,code))return null;
        Map<String,String> metadata=new LinkedHashMap<>();
        for(Element row:details.select(".product-text-label")) {
            String label=row.ownText().replace(":","").trim().toLowerCase(Locale.ROOT);
            Element value=row.selectFirst("span.product-text");
            if(value!=null && label.matches("category|manufacturer|brand"))metadata.put(label,value.text());
        }
        String model="";
        for(Element row:document.select("#product-attributes li"))if(row.text().matches("(?i)^Model:\\s*.+"))model=row.text().replaceFirst("(?i)^Model:\\s*","");
        return new Hit("Barcode Lookup",name.text(),metadata.getOrDefault("brand",metadata.get("manufacturer")),model,metadata.get("category"));
    }
    static Hit parseUpc(JSONObject response,String code) {
        JSONArray items=response.optJSONArray("items");if(items==null)return null;
        for(int i=0;i<items.length();i++) {
            JSONObject item=items.optJSONObject(i);if(item==null)continue;
            if(!sameCode(item.optString("ean"),code)&&!sameCode(item.optString("upc"),code)&&!sameCode(item.optString("gtin"),code))continue;
            Hit hit=new Hit("UPCitemdb",item.optString("title"),item.optString("brand"),item.optString("model"),item.optString("category"));
            if(hit.usable())return hit;
        }
        return null;
    }
    static Hit parseFacts(JSONObject response,String code,String source) {
        JSONObject product=response.optJSONObject("product");
        if(response.optInt("status")!=1 || product==null || !sameCode(product.optString("code",response.optString("code")),code))return null;
        String name=product.optString("product_name_de");if(name.isEmpty())name=product.optString("product_name");
        JSONArray categories=product.optJSONArray("categories_tags");
        return new Hit(source,name,product.optString("brands"),product.optString("model"),categories==null?"":categories.toString());
    }
    static Hit parseBook(JSONObject response,String code) {
        JSONObject book=response.optJSONObject("ISBN:"+queryCode(code));if(book==null)return null;
        JSONObject identifiers=book.optJSONObject("identifiers");
        JSONArray isbns=identifiers==null?null:identifiers.optJSONArray("isbn_13");boolean matched=false;
        if(isbns!=null)for(int i=0;i<isbns.length();i++)matched|=sameCode(isbns.optString(i),code);
        if(!matched)return null;
        return new Hit("Open Library",book.optString("title"),"","","Books");
    }
    private static Hit facts(String query,String code,Fetcher fetcher) {
        if(query.startsWith("978")||query.startsWith("979"))try {
            Hit book=parseBook(new JSONObject(fetcher.get("https://openlibrary.org/api/books?bibkeys=ISBN:"+query+"&format=json&jscmd=data","application/json")),code);
            if(book!=null&&book.usable())return book;
        }catch(Exception unavailable){ }
        String[][] catalogs={{"openproductsfacts","Open Products Facts"},{"openfoodfacts","Open Food Facts"},{"openbeautyfacts","Open Beauty Facts"}};
        for(String[] catalog:catalogs) {
            if(Thread.currentThread().isInterrupted())return null;
            try {
                String body=fetcher.get("https://world."+catalog[0]+".org/api/v2/product/"+query+".json?fields=product_name,product_name_de,brands,categories_tags,model,code","application/json");
                Hit hit=parseFacts(new JSONObject(body),code,catalog[1]);if(hit!=null&&hit.usable())return hit;
            }catch(Exception unavailable){ }
        }
        return null;
    }
    private static String get(String address,String accept) throws Exception {
        HttpsURLConnection connection=(HttpsURLConnection)new URL(address).openConnection();
        connection.setConnectTimeout(4000);connection.setReadTimeout(4000);connection.setInstanceFollowRedirects(false);
        connection.setRequestProperty("Accept",accept);connection.setRequestProperty("User-Agent","PassPilot/1.8 (product information lookup)");
        try {
            if(connection.getResponseCode()!=200)throw new java.io.IOException("Catalog unavailable");
            try(InputStream stream=connection.getInputStream();ByteArrayOutputStream output=new ByteArrayOutputStream()) {
                byte[] buffer=new byte[4096];int count;
                while((count=stream.read(buffer))!=-1) {
                    if(Thread.currentThread().isInterrupted()||output.size()+count>2000000)throw new java.io.IOException("Catalog response cancelled or too large");
                    output.write(buffer,0,count);
                }
                return output.toString("UTF-8");
            }
        }finally{connection.disconnect();}
    }
}
