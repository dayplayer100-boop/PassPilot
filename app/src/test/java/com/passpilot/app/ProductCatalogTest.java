package com.passpilot.app;

import org.junit.Test;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import static org.junit.Assert.*;

public class ProductCatalogTest {
    private static final String SONY="4548736132580";
    private String fixture(String name) throws Exception {
        try(InputStream input=getClass().getResourceAsStream("/catalog/"+name);ByteArrayOutputStream output=new ByteArrayOutputStream()) {
            assertNotNull(input);byte[] buffer=new byte[2048];int size;
            while((size=input.read(buffer))!=-1)output.write(buffer,0,size);
            return output.toString("UTF-8");
        }
    }
    @Test public void actualElectronicsPagesYieldProductMetadata() throws Exception {
        ProductCatalog.Hit go=ProductCatalog.parseGoUpc(fixture("go-upc-sony.html"),SONY);
        assertNotNull(go);assertEquals("Sony",go.fields.get("brand"));assertEquals("Headphones",go.fields.get("categoryText"));
        assertEquals("Sony Wireless Noise Cancelling Headphones WH-1000XM5 Black",go.fields.get("name"));
        ProductCatalog.Hit barcode=ProductCatalog.parseBarcodeLookup(fixture("barcode-lookup-sony.html"),SONY);
        assertNotNull(barcode);assertEquals("WH-1000XM5",barcode.fields.get("model"));assertEquals("Sony",barcode.fields.get("brand"));
        assertEquals(4,barcode.fields.size());
        assertFalse(barcode.fields.containsKey("price"));assertFalse(barcode.fields.containsKey("serial"));
        assertNull(ProductCatalog.parseGoUpc(fixture("go-upc-sony.html"),"3017620422003"));
        assertNull(ProductCatalog.parseBarcodeLookup(fixture("barcode-lookup-sony.html"),"3017620422003"));
        assertNull(ProductCatalog.parseGoUpc("<h1>Not found</h1><script>product()</script>",SONY));
        assertNull(ProductCatalog.parseBarcodeLookup("<h4>Sony headphones</h4>",SONY));
    }
    @Test public void zeroPaddedRetailCodesMatchWithoutChangingTheScannedCode() throws Exception {
        assertTrue(ProductCatalog.sameCode("0"+SONY,SONY));
        assertEquals(SONY,ProductCatalog.queryCode("0"+SONY));
        assertEquals("036000291452",ProductCatalog.queryCode("00036000291452"));
        assertNotNull(ProductCatalog.parseGoUpc(fixture("go-upc-sony.html"),"0"+SONY));
        assertFalse(ProductCatalog.sameCode("4548736132581",SONY));
        assertFalse(ProductCatalog.sameCode("",SONY));
    }
    @Test public void jsonCatalogsMustMatchTheIdentifierAndNeverImportPurchaseDetails() throws Exception {
        JSONObject upc=new JSONObject("{items:[{ean:'3017620422003',title:'Wrong product'},{ean:'4548736132580',title:'Sony WH-1000XM5',brand:'Sony',model:'WH-1000XM5',category:'Headphones',price:299,serial:'PRIVATE'}]}");
        assertEquals("Sony WH-1000XM5",ProductCatalog.parseUpc(upc,SONY).fields.get("name"));
        assertNull(ProductCatalog.parseUpc(new JSONObject("{items:[{title:'Unverified Sony'}]}"),SONY));
        JSONObject food=new JSONObject("{code:'3017620422003',status:1,product:{code:'3017620422003',product_name:'Nutella',product_name_de:'Nutella',brands:'Nutella, Ferrero',quantity:'400 g e',categories_tags:['en:spreads'],purchaseDate:'2020-01-01',price:4}}");
        ProductCatalog.Hit hit=ProductCatalog.parseFacts(food,"3017620422003","Open Food Facts");
        assertEquals("Nutella",hit.fields.get("name"));assertEquals("Nutella, Ferrero",hit.fields.get("brand"));
        assertEquals(3,hit.fields.size());assertNull(ProductCatalog.parseFacts(food,SONY,"Open Food Facts"));
        JSONObject book=new JSONObject("{'ISBN:9783551551672':{title:'Harry Potter und der Stein der Weisen',identifiers:{isbn_13:['9783551551672']},publish_date:'1998'}}");
        assertEquals("Harry Potter und der Stein der Weisen",ProductCatalog.parseBook(book,"9783551551672").fields.get("name"));
        assertFalse(ProductCatalog.parseBook(book,"9783551551672").fields.containsKey("purchaseDate"));
        book.getJSONObject("ISBN:9783551551672").getJSONObject("identifiers").remove("isbn_13");
        assertNull(ProductCatalog.parseBook(book,"9783551551672"));
    }
    @Test public void partialHitsAreComplementedWithoutMixingConflictingProducts() {
        Map<String,String> fields=new LinkedHashMap<>();
        assertTrue(ProductCatalog.merge(fields,new ProductCatalog.Hit("A","Sony headphones","Sony","","")));
        assertTrue(ProductCatalog.merge(fields,new ProductCatalog.Hit("B","Sony Wireless Headphones","Sony","WH-1000XM5","Headphones")));
        assertEquals("Sony headphones",fields.get("name"));assertEquals("WH-1000XM5",fields.get("model"));
        assertFalse(ProductCatalog.merge(fields,new ProductCatalog.Hit("C","Wrong","Bosch","GSR18V","Drills")));
        assertFalse(ProductCatalog.merge(fields,new ProductCatalog.Hit("D","Wrong","Sony","WH-1000XM4","Headphones")));
        assertEquals("WH-1000XM5",fields.get("model"));
    }
    @Test public void rateLimitsAndMissingFactsDoNotPreventAutomaticElectronicsLookup() throws Exception {
        String go=fixture("go-upc-sony.html"),barcode=fixture("barcode-lookup-sony.html");
        List<Map<String,String>> updates=new ArrayList<>();List<Boolean> completed=new ArrayList<>();
        ProductCatalog.lookup(SONY,(url,accept)->{
            if(url.startsWith("https://go-upc.com/"))return go;
            if(url.startsWith("https://www.barcodelookup.com/"))return barcode;
            if(url.startsWith("https://api.upcitemdb.com/"))throw new java.io.IOException("429");
            return "{status:0}";
        },(fields,source,complete)->{updates.add(fields);completed.add(complete);});
        assertTrue(updates.size()>=2);assertFalse(completed.get(0));assertTrue(completed.get(completed.size()-1));
        Map<String,String> finalFields=updates.get(updates.size()-1);
        assertEquals("Sony",finalFields.get("brand"));assertEquals("WH-1000XM5",finalFields.get("model"));
        assertTrue(finalFields.get("name").contains("Sony"));assertTrue(finalFields.get("categoryText").contains("Headphones"));
    }
    @Test public void aNewScanCanCancelSlowNetworkLookups() throws Exception {
        CountDownLatch started=new CountDownLatch(1);List<Boolean> callbacks=new ArrayList<>();
        Thread thread=new Thread(()->ProductCatalog.lookup(SONY,(url,accept)->{started.countDown();new CountDownLatch(1).await();return "";},(fields,source,complete)->callbacks.add(complete)));
        thread.start();assertTrue(started.await(2,TimeUnit.SECONDS));thread.interrupt();thread.join(2000);
        assertFalse(thread.isAlive());assertTrue(callbacks.isEmpty());
    }
}
