package com.passpilot.app;

import android.app.Activity;
import android.content.Context;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.webkit.ValueCallback;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import android.graphics.Color;

import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 7001;
    private static final int CAMERA_FILE_REQUEST = 7002;
    private Intent pendingCameraIntent;
    private WebView webView;
    private ProductScanHelper productScanner;
    private AppTools tools; private android.widget.Button lockOverlay;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;
    private final List<WebView> printViews = new ArrayList<>();
    private android.window.OnBackInvokedCallback backCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 15 draws target-SDK-35 apps behind the system bars.
        // Pad the native container so the entire WebView stays in the safe area.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(Color.rgb(244, 246, 248));
        webView = new WebView(this);
        container.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        ViewCompat.setOnApplyWindowInsetsListener(container, (view, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        lockOverlay=new android.widget.Button(this);lockOverlay.setText("PassPilot entsperren");lockOverlay.setVisibility(android.view.View.GONE);container.addView(lockOverlay,new FrameLayout.LayoutParams(-1,-1));lockOverlay.setOnClickListener(v->tools.authenticate());
        setContentView(container);
        ViewCompat.requestApplyInsets(container);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setBuiltInZoomControls(false);
        settings.setSupportZoom(false);
        settings.setDisplayZoomControls(false);
        productScanner = new ProductScanHelper(this, webView);
        tools = new AppTools(this, webView);
        if(tools.prefs().getBoolean("lock",false))setLocked(true);
        webView.addJavascriptInterface(new AppBridge(), "PassPilotAndroid");

        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest request) {
                return routeNavigation(request.getUrl().toString());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String address) {
                return routeNavigation(address);
            }
            private void viewRoot(String address) { webView.loadUrl(address.replace("file:///android_asset/app/", "file:///android_asset/app/index.html")); }
            private boolean routeNavigation(String address) {
                if (address.matches("^file:///android_asset/app/(?:[?#].*)?$")) {
                    viewRoot(address); return true;
                }
                if (address.startsWith("file:///android_asset/app/") && !address.contains("..") && !address.toLowerCase(java.util.Locale.ROOT).contains("%2e")) return false;
                try {
                    java.net.URI uri=new java.net.URI(address);
                    if ("https".equalsIgnoreCase(uri.getScheme()) && uri.getHost()!=null && uri.getUserInfo()==null)
                        startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(address)));
                } catch (Exception ignored) { }
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;

                Intent contentIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentIntent.setType("*/*");
                String[] accepts=params.getAcceptTypes();if(accepts!=null){java.util.List<String> mimeTypes=new java.util.ArrayList<>();for(String accept:accepts)if(accept.contains("/"))mimeTypes.add(accept);if(!mimeTypes.isEmpty())contentIntent.putExtra(Intent.EXTRA_MIME_TYPES,mimeTypes.toArray(new String[0]));}
                contentIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,params.getMode()==FileChooserParams.MODE_OPEN_MULTIPLE);

                Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                if (cameraIntent.resolveActivity(getPackageManager()) != null) {
                    try {
                        File dir = new File(getCacheDir(), "camera");
                        if (!dir.exists()) dir.mkdirs();
                        File photo = File.createTempFile("passpilot_", ".jpg", dir);
                        cameraUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", photo);
                        cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                        cameraIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    } catch (IOException e) {
                        cameraIntent = null;
                    }
                } else {
                    cameraIntent = null;
                }

                Intent chooser = new Intent(Intent.ACTION_CHOOSER);
                chooser.putExtra(Intent.EXTRA_INTENT, contentIntent);
                chooser.putExtra(Intent.EXTRA_TITLE, "Foto oder Dokument auswählen");
                if (params.isCaptureEnabled() && cameraIntent != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});

                try {
                    if (params.isCaptureEnabled() && cameraIntent != null && checkSelfPermission(android.Manifest.permission.CAMERA) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                        pendingCameraIntent=cameraIntent;
                        requestPermissions(new String[]{android.Manifest.permission.CAMERA},CAMERA_FILE_REQUEST);
                        return true;
                    }
                    startActivityForResult(params.isCaptureEnabled() && cameraIntent != null ? cameraIntent : chooser, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "Keine passende App zum Auswählen gefunden", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        webView.loadUrl("file:///android_asset/app/index.html");
        if (android.os.Build.VERSION.SDK_INT >= 33) {
            backCallback = this::handleBack;
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, backCallback);
        }
    }

    private final class AppBridge {
        @JavascriptInterface public String getAppDownloadUrl(){return "https://passpilot-app.web.app/download/"+(java.util.Arrays.asList(android.os.Build.SUPPORTED_ABIS).contains("arm64-v8a")?"PassPilot-Test.apk":"PassPilot-Test-32bit.apk");}
        @JavascriptInterface public void captureScreen(String request){local(()->tools.captureScreen(request));}
        @JavascriptInterface public void googleSignIn(String request,String clientId){local(()->tools.googleSignIn(request,clientId));}
        @JavascriptInterface public void composeHandoffEmail(String email,String subject,String body){local(()->{if(email.length()>254||!email.matches("^[^\\s@,;]+@[^\\s@,;]+\\.[^\\s@,;]+$")||subject.length()>120||body.length()>6000)return;try{startActivity(new Intent(Intent.ACTION_SENDTO,Uri.parse("mailto:"+Uri.encode(email))).putExtra(Intent.EXTRA_SUBJECT,subject).putExtra(Intent.EXTRA_TEXT,body));}catch(Exception e){Toast.makeText(MainActivity.this,"Keine E-Mail-App gefunden. Link kopieren und selbst senden.",Toast.LENGTH_LONG).show();}});}
        @JavascriptInterface public void documentRequest(String id,String payload,String token){local(()->tools.documentRequest(id,payload,token));}
        @JavascriptInterface public void assistantRequest(String id,String question,String token){local(()->tools.assistantRequest(id,question,token));}
        @JavascriptInterface public void checkAppUpdate(String id) { tools.checkAppUpdate(id); }
        private void local(Runnable action){runOnUiThread(()->{if(tools.local())action.run();});}
        @JavascriptInterface public void beginFile(String request,String id,String name,String mime,String mode){local(()->tools.begin(request,id,name,mime,mode));}
        @JavascriptInterface public void appendFile(String id,String data){local(()->tools.append(id,data));}
        @JavascriptInterface public void cancelFile(String id){local(()->tools.cancel(id));}
        @JavascriptInterface public void finishFile(String request,String id){local(()->tools.finish(request,id));}
        @JavascriptInterface public void chooseBackupFolder(String request){local(()->tools.chooseFolder(request));}
        @JavascriptInterface public void disableBackup(String request){local(()->{tools.prefs().edit().remove("backupTree").apply();tools.worker.execute(()->new File(getFilesDir(),"latest-backup.json").delete());BackupReminderReceiver.schedule(MainActivity.this);tools.ok(request);});}
        @JavascriptInterface public void toolsStatus(String request){local(()->tools.status(request));}
        @JavascriptInterface public void setLock(String request,boolean enabled){local(()->tools.setLock(request,enabled));}
        @JavascriptInterface public void setReminders(String request,boolean enabled){local(()->tools.setReminders(request,enabled));}
        @JavascriptInterface public void setReminderData(String data){if(data!=null&&data.length()<1000000)local(()->tools.prefs().edit().putString("reminderData",data).apply());}
        @JavascriptInterface public void readProductImage(String request,String data){local(()->tools.readProductImage(request,data));}
        @JavascriptInterface public void readReceipt(String request,String data){local(()->tools.readReceipt(request,data));}
        @JavascriptInterface public void createPdf(String request,String data){local(()->tools.createPdf(request,data));}
        @JavascriptInterface public void checkLink(String request,String url){local(()->tools.checkLink(request,url));}
        @JavascriptInterface public void writeNfc(String request,String url){local(()->tools.writeNfc(request,url));}
        @JavascriptInterface public void firebaseRequest(String request,String url,String method,String body,String token){local(()->tools.firebaseRequest(request,url,method,body,token));}
        @JavascriptInterface public void resetLocalData(){local(()->{tools.prefs().edit().clear().apply();tools.worker.execute(()->new File(getFilesDir(),"latest-backup.json").delete());BackupReminderReceiver.schedule(MainActivity.this);((android.app.NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE)).cancel(110);tools.unlocked=true;setLocked(false);});}
        @JavascriptInterface public void composeEmail(String title,String body){local(()->{try{Intent intent=new Intent(Intent.ACTION_SENDTO,Uri.parse("mailto:"));intent.putExtra(Intent.EXTRA_SUBJECT,title);intent.putExtra(Intent.EXTRA_TEXT,body);startActivity(intent);}catch(Exception failure){Toast.makeText(MainActivity.this,"Keine E-Mail-App verfügbar. Text kopieren verwenden.",Toast.LENGTH_SHORT).show();}});}
        @JavascriptInterface public void findManual(String request,String brand,String model){local(()->tools.searches.execute(()->tools.reply(request,AppTools.json("ok",true,"results",ManualFinder.search(brand,model)))));}
        @JavascriptInterface public void downloadPdf(String request,String url){local(()->tools.downloadPdf(request,url));}

        @JavascriptInterface
        public void scanProduct(String requestId) {
            runOnUiThread(() -> productScanner.startScan(requestId));
        }

        @JavascriptInterface
        public void scanProductLabel(String requestId) {
            runOnUiThread(() -> productScanner.startLabelScan(requestId));
        }

        @JavascriptInterface
        public void scanProductPhoto(String requestId) {
            runOnUiThread(() -> productScanner.startPhotoScan(requestId));
        }

        @JavascriptInterface
        public void searchBarcodeOnline(String code) {
            runOnUiThread(() -> productScanner.openBarcodeSearch(code));
        }

        @JavascriptInterface
        public void lookupBarcode(String code, String requestId) {
            runOnUiThread(() -> productScanner.lookupBarcode(code, requestId));
        }

        @JavascriptInterface
        public void openExternalLink(String address) {
            if(address==null||address.length()>2048)return;
            runOnUiThread(()->{
                if(!productScanner.isLocalApp())return;
                try{
                    java.net.URI url=new java.net.URI(address);
                    if(!"https".equalsIgnoreCase(url.getScheme())||url.getHost()==null||url.getUserInfo()!=null)return;
                    startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url.toASCIIString())));
                }catch(Exception failure){Toast.makeText(MainActivity.this,"Link konnte nicht geöffnet werden",Toast.LENGTH_SHORT).show();}
            });
        }

        @JavascriptInterface
        public void printHtml(String html, String title) {
            if (html == null || html.isEmpty() || html.length() > 1500000) return;
            runOnUiThread(() -> {
                if (isFinishing() || isDestroyed()) return;
                String source = webView.getUrl();
                // Only the bundled app may request printing. Remote pages cannot use this bridge.
                if (source == null || !(source.equals("file:///android_asset/app/index.html")
                        || source.startsWith("file:///android_asset/app/index.html#"))) return;
                startPrint(html, title);
            });
        }
    }

    private void startPrint(String html, String title) {
        if (!printViews.isEmpty()) {
            Toast.makeText(this, "Bitte den aktuellen Druckdialog zuerst schließen", Toast.LENGTH_SHORT).show();
            return;
        }
        PrintManager manager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
        if (manager == null) {
            Toast.makeText(this, "Drucken ist auf diesem Gerät nicht verfügbar", Toast.LENGTH_SHORT).show();
            return;
        }
        String jobName = title == null || title.trim().isEmpty() ? "PassPilot Verkaufszettel"
                : title.substring(0, Math.min(title.length(), 140));
        final WebView printView = new WebView(this);
        printViews.add(printView);
        printView.getSettings().setJavaScriptEnabled(false);
        printView.getSettings().setAllowFileAccess(false);
        printView.getSettings().setAllowContentAccess(false);
        printView.getSettings().setBlockNetworkLoads(true);
        printView.setWebViewClient(new WebViewClient() {
            private boolean started;

            @Override
            public void onPageFinished(WebView view, String url) {
                if (started || isFinishing() || isDestroyed()) return;
                started = true;
                PrintDocumentAdapter delegate = printView.createPrintDocumentAdapter(jobName);
                PrintDocumentAdapter adapter = new PrintDocumentAdapter() {
                    @Override
                    public void onStart() { delegate.onStart(); }

                    @Override
                    public void onLayout(PrintAttributes oldAttributes, PrintAttributes newAttributes,
                                         CancellationSignal signal, LayoutResultCallback callback, Bundle extras) {
                        delegate.onLayout(oldAttributes, newAttributes, signal, callback, extras);
                    }

                    @Override
                    public void onWrite(PageRange[] pages, ParcelFileDescriptor destination,
                                        CancellationSignal signal, WriteResultCallback callback) {
                        delegate.onWrite(pages, destination, signal, callback);
                    }

                    @Override
                    public void onFinish() {
                        delegate.onFinish();
                        if (printViews.remove(printView)) printView.destroy();
                    }
                };
                try {
                    manager.print(jobName, adapter, new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                            .setColorMode(PrintAttributes.COLOR_MODE_MONOCHROME)
                            .setMinMargins(new PrintAttributes.Margins(472, 472, 472, 472))
                            .build());
                } catch (RuntimeException error) {
                    if (printViews.remove(printView)) printView.destroy();
                    Toast.makeText(MainActivity.this, "Druckdialog konnte nicht geöffnet werden", Toast.LENGTH_SHORT).show();
                }
            }
        });
        printView.loadDataWithBaseURL("https://passpilot.local/print/", html, "text/html", "UTF-8", null);
    }

    @Override
    protected void onDestroy() {
        if (android.os.Build.VERSION.SDK_INT >= 33 && backCallback != null)
            getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backCallback);
        if (productScanner != null) productScanner.close();
        if(tools!=null)tools.close();
        for (WebView printView : printViews) printView.destroy();
        printViews.clear();
        super.onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(tools.result(requestCode,resultCode,data))return;
        if (productScanner != null && productScanner.onActivityResult(requestCode, resultCode, data)) return;
        if (requestCode != FILE_CHOOSER_REQUEST || fileCallback == null) return;

        Uri[] results = null;
        if (resultCode == RESULT_OK) {
            if(data!=null&&data.getClipData()!=null){results=new Uri[data.getClipData().getItemCount()];for(int i=0;i<results.length;i++)results[i]=data.getClipData().getItemAt(i).getUri();} else if (data == null || data.getData() == null) {
                if (cameraUri != null) results = new Uri[]{cameraUri};
            } else {
                results = new Uri[]{data.getData()};
            }
        }
        fileCallback.onReceiveValue(results);
        fileCallback = null;
        cameraUri = null;
    }

    void setLocked(boolean locked){lockOverlay.setVisibility(locked?android.view.View.VISIBLE:android.view.View.GONE);webView.setVisibility(locked?android.view.View.INVISIBLE:android.view.View.VISIBLE);if(locked)getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);else getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);}
    @Override protected void onResume(){super.onResume();if(tools!=null)tools.resume();}
    @Override protected void onPause(){if(tools!=null)tools.paused();super.onPause();}
    @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results){super.onRequestPermissionsResult(code,permissions,results);
        if(code==CAMERA_FILE_REQUEST){
            Intent camera=pendingCameraIntent;pendingCameraIntent=null;
            if(results.length>0&&results[0]==android.content.pm.PackageManager.PERMISSION_GRANTED&&camera!=null&&fileCallback!=null){
                try{startActivityForResult(camera,FILE_CHOOSER_REQUEST);return;}catch(Exception ignored){}
            }
            if(fileCallback!=null){fileCallback.onReceiveValue(null);fileCallback=null;}
            cameraUri=null;
            android.widget.Toast.makeText(this,"Kamera nicht verfügbar oder Zugriff nicht erlaubt. Du kannst ein Foto aus der Galerie auswählen.",android.widget.Toast.LENGTH_LONG).show();return;
        }
        tools.permission(code,results);}
    @Override
    public void onBackPressed() {
        handleBack();
    }

    private void handleBack() {
        if (webView == null || isFinishing() || isDestroyed()) return;
        if (lockOverlay != null && lockOverlay.getVisibility() == android.view.View.VISIBLE) return;
        if (tools != null && tools.local()) {
            webView.evaluateJavascript("window.PassPilotNavigation&&PassPilotNavigation.back();", null);
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            webView.loadUrl("file:///android_asset/app/index.html");
        }
    }
}
