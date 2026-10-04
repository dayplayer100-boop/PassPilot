package com.passpilot.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import android.webkit.WebView;
import androidx.core.content.FileProvider;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

final class ProductScanHelper {
    private static final int SCAN_REQUEST = 7002;
    private static final int LIVE_SCAN_REQUEST = 7003;
    private final Activity activity;
    private final WebView webView;
    private final ExecutorService imageWorker = Executors.newSingleThreadExecutor();
    private final ExecutorService catalogWorker = Executors.newSingleThreadExecutor();
    private String pendingScan;
    private Future<?> pendingCatalog;
    private Uri cameraUri;
    private File cameraFile;
    private boolean destroyed;

    ProductScanHelper(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
    }

    boolean isLocalApp() {
        String source = webView.getUrl();
        return !destroyed && !activity.isFinishing() && !activity.isDestroyed() && source != null
                && (source.equals("file:///android_asset/app/index.html") || source.startsWith("file:///android_asset/app/index.html#"));
    }

    void startScan(String requestId) { startLiveScan(requestId,false); }
    void startLabelScan(String requestId) { startLiveScan(requestId,true); }
    private void startLiveScan(String requestId,boolean labelMode) {
        if (!isLocalApp() || requestId == null || requestId.length() > 100) return;
        if (pendingScan != null) { sendScan(requestId,"error","Es läuft bereits ein Scan.","",new JSONArray());return; }
        pendingScan = requestId;
        try { activity.startActivityForResult(new Intent(activity,BarcodeScanActivity.class).putExtra(BarcodeScanActivity.LABEL_MODE,labelMode),LIVE_SCAN_REQUEST); }
        catch (RuntimeException failure) { pendingScan=null;sendScan(requestId,"error","Live-Scanner konnte nicht geöffnet werden.","",new JSONArray()); }
    }

    void startPhotoScan(String requestId) {
        if (!isLocalApp() || requestId == null || requestId.length() > 100) return;
        if (pendingScan != null) { sendScan(requestId, "error", "Es läuft bereits ein Scan.", "", new JSONArray()); return; }
        pendingScan = requestId;
        Intent select = new Intent(Intent.ACTION_GET_CONTENT);
        select.addCategory(Intent.CATEGORY_OPENABLE);
        select.setType("image/*");
        Intent chooser = Intent.createChooser(select, "Etikett oder Barcode fotografieren / Foto auswählen");
        Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (camera.resolveActivity(activity.getPackageManager()) != null) {
            try {
                File folder = new File(activity.getCacheDir(), "camera");
                if (!folder.exists()) folder.mkdirs();
                cameraFile = File.createTempFile("passpilot_scan_", ".jpg", folder);
                cameraUri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", cameraFile);
                camera.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                camera.setClipData(ClipData.newRawUri("PassPilot scan", cameraUri));
                camera.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{camera});
            } catch (Exception ignored) { cleanupCamera(); }
        }
        try { activity.startActivityForResult(chooser, SCAN_REQUEST); }
        catch (RuntimeException failure) { pendingScan = null; cleanupCamera(); sendScan(requestId, "error", "Keine Kamera oder Fotoauswahl verfügbar.", "", new JSONArray()); }
    }

    boolean onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == LIVE_SCAN_REQUEST) {
            String requestId = pendingScan;pendingScan = null;
            if (requestId == null) return true;
            if (resultCode != Activity.RESULT_OK || data == null) {
                sendScan(requestId,"cancelled","Scan abgebrochen.","",new JSONArray());return true;
            }
            try {
                String encoded = data.getStringExtra(BarcodeScanActivity.RESULT_CODES);
                if (encoded == null || encoded.length()>120000) throw new IllegalArgumentException("Invalid scan result");
                String labelText = data.getStringExtra(BarcodeScanActivity.RESULT_TEXT);
                if(labelText==null)labelText="";
                sendScan(requestId,"success","",labelText.substring(0,Math.min(10000,labelText.length())),new JSONArray(encoded));
            } catch(Exception failure) { sendScan(requestId,"error","Barcode konnte nicht übernommen werden. Bitte erneut scannen.","",new JSONArray()); }
            return true;
        }
        if (requestCode != SCAN_REQUEST) return false;
        final String requestId = pendingScan;
        if (requestId == null) return true;
        if (resultCode != Activity.RESULT_OK) {
            pendingScan = null; cleanupCamera(); sendScan(requestId, "cancelled", "Scan abgebrochen.", "", new JSONArray()); return true;
        }
        final Uri photo = data != null && data.getData() != null ? data.getData() : cameraUri;
        if (photo == null) { pendingScan = null; cleanupCamera(); sendScan(requestId, "error", "Kein Foto ausgewählt.", "", new JSONArray()); return true; }
        imageWorker.execute(() -> recognize(photo, requestId));
        return true;
    }

    private void recognize(Uri photo, String requestId) {
        try {
            InputImage image = InputImage.fromFilePath(activity, photo);
            BarcodeScanner scanner = BarcodeScanning.getClient();
            TextRecognizer recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
            Task<List<Barcode>> barcodeTask = scanner.process(image);
            Task<Text> textTask = recognizer.process(image);
            Tasks.whenAllComplete(barcodeTask, textTask).addOnCompleteListener(done -> {
                JSONArray codes = new JSONArray();
                try {
                    if (barcodeTask.isSuccessful()) for (Barcode barcode : barcodeTask.getResult()) {
                        String raw = barcode.getRawValue();
                        if (raw != null && raw.length() <= 10000) codes.put(new JSONObject().put("rawValue", raw).put("format", barcode.getFormat()));
                    }
                    String text = textTask.isSuccessful() ? textTask.getResult().getText() : "";
                    if (text.length() > 10000) text = text.substring(0, 10000);
                    boolean success = barcodeTask.isSuccessful() || textTask.isSuccessful();
                    sendScan(requestId, success ? "success" : "error", success ? "" : "Foto konnte nicht gelesen werden. Bitte erneut fotografieren.", text, codes);
                } catch (Exception failure) { sendScan(requestId, "error", "Foto konnte nicht ausgewertet werden.", "", new JSONArray()); }
                finally { scanner.close(); recognizer.close(); pendingScan = null; cleanupCamera(); }
            });
        } catch (Exception failure) {
            activity.runOnUiThread(() -> { pendingScan = null; cleanupCamera(); sendScan(requestId, "error", "Foto konnte nicht geöffnet werden.", "", new JSONArray()); });
        }
    }

    private void sendScan(String requestId, String status, String message, String text, JSONArray codes) {
        try { send("receiveNativeResult", requestId, new JSONObject().put("status",status).put("message",message).put("text",text).put("barcodes",codes)); }
        catch (Exception ignored) { }
    }

    void lookupBarcode(String code, String requestId) {
        if (!isLocalApp() || requestId == null || requestId.length() > 100 || !ProductCatalog.validGtin(code)) return;
        if (pendingCatalog != null) pendingCatalog.cancel(true);
        pendingCatalog = catalogWorker.submit(() -> ProductCatalog.lookup(code, (fields,source,complete) -> {
            if (Thread.currentThread().isInterrupted()) return;
            try {
                send("receiveCatalogResult",requestId,new JSONObject().put("code",code)
                        .put("status",fields.isEmpty()?"unavailable":"success").put("source",source)
                        .put("complete",complete).put("fields",new JSONObject(fields)));
            } catch (Exception ignored) { }
        }));
    }

    private void send(String method, String requestId, JSONObject payload) {
        activity.runOnUiThread(() -> {
            if (isLocalApp()) webView.evaluateJavascript("window.PassPilotScan && window.PassPilotScan."+method+"("+JSONObject.quote(requestId)+","+payload+");",null);
        });
    }
    void openBarcodeSearch(String code) {
        if (!isLocalApp() || !ProductCatalog.validGtin(code)) return;
        try { activity.startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse("https://www.google.com/search?q="+code))); }
        catch (RuntimeException failure) { android.widget.Toast.makeText(activity,"Kein Browser verfügbar.",android.widget.Toast.LENGTH_SHORT).show(); }
    }
    private void cleanupCamera() { if (cameraFile != null) cameraFile.delete(); cameraFile = null; cameraUri = null; }
    void close() { destroyed = true; imageWorker.shutdownNow(); catalogWorker.shutdownNow(); cleanupCamera(); }
}
