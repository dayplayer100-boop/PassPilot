package com.passpilot.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.media.Image;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Size;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.activity.ComponentActivity;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ExperimentalGetImage;
import androidx.camera.core.FocusMeteringAction;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/** In-app camera preview: analyze transient frames, return only decoded codes. */
public final class BarcodeScanActivity extends ComponentActivity {
    static final String RESULT_CODES = "passpilot_barcode_results";
    static final String RESULT_TEXT = "passpilot_label_text";
    static final String LABEL_MODE = "passpilot_label_mode";
    private static final int CAMERA_PERMISSION = 7101;
    private final ExecutorService analyzer = Executors.newSingleThreadExecutor();
    private BarcodeScanner scanner;
    private TextRecognizer recognizer;
    private boolean labelMode;
    private String latestText="";
    private JSONArray latestCodes=new JSONArray();
    private Button acceptLabel;
    private ProcessCameraProvider provider;
    private ImageAnalysis analysis;
    private Preview preview;
    private PreviewView previewView;
    private TextView status;
    private Button retry, torchButton;
    private Camera camera;
    private boolean cameraStarting, permissionRequested, torch;
    private volatile boolean completed, destroyed;
    private String lastCodes = "";
    private int stableFrames;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setResult(RESULT_CANCELED);
        permissionRequested = savedInstanceState != null && savedInstanceState.getBoolean("permissionRequested");
        scanner = BarcodeScanning.getClient();
        labelMode=getIntent().getBooleanExtra(LABEL_MODE,false);
        recognizer=TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        previewView = new PreviewView(this);
        previewView.setImplementationMode(PreviewView.ImplementationMode.COMPATIBLE);
        previewView.setContentDescription(labelMode?"Live-Kamera für Produktetiketten":"Live-Kamera für Produkt-Barcodes");
        root.addView(previewView, new FrameLayout.LayoutParams(-1,-1));
        root.addView(new ScanGuide(), new FrameLayout.LayoutParams(-1,-1));

        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(16),dp(12),dp(16),dp(12));
        header.setBackgroundColor(0xB8000000);
        TextView title = text(labelMode?"Etikett lesen":"Barcode scannen",21);
        header.addView(title,new LinearLayout.LayoutParams(0,-2,1));
        Button cancel = new Button(this);
        cancel.setText("Abbrechen");
        cancel.setOnClickListener(view -> finish());
        header.addView(cancel);
        root.addView(header,new FrameLayout.LayoutParams(-1,-2,Gravity.TOP));

        LinearLayout footer = new LinearLayout(this);
        footer.setOrientation(LinearLayout.VERTICAL);
        footer.setGravity(Gravity.CENTER_HORIZONTAL);
        footer.setPadding(dp(20),dp(16),dp(20),dp(20));
        footer.setBackgroundColor(0xCC000000);
        status = text("Barcode in den Rahmen halten.\nDer Code wird automatisch übernommen.",16);
        status.setGravity(Gravity.CENTER);
        status.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);
        footer.addView(status,new LinearLayout.LayoutParams(-1,-2));
        if(labelMode){
            acceptLabel=new Button(this);acceptLabel.setText("Angaben übernehmen");acceptLabel.setEnabled(false);
            acceptLabel.setOnClickListener(view->{
                if(completed||destroyed||latestText.isEmpty())return;
                completed=true;
                setResult(RESULT_OK,new Intent().putExtra(RESULT_CODES,latestCodes.toString()).putExtra(RESULT_TEXT,latestText));
                finish();
            });
            footer.addView(acceptLabel);
        }
        torchButton = new Button(this);
        torchButton.setText("Licht einschalten");
        torchButton.setVisibility(View.GONE);
        torchButton.setOnClickListener(view -> {
            if(camera != null) {
                torch = !torch;
                camera.getCameraControl().enableTorch(torch);
                torchButton.setText(torch ? "Licht ausschalten" : "Licht einschalten");
            }
        });
        footer.addView(torchButton);
        retry = new Button(this);
        retry.setVisibility(View.GONE);
        retry.setOnClickListener(view -> {
            if(hasPermission()) startCamera();
            else if(permissionRequested && !ActivityCompat.shouldShowRequestPermissionRationale(this,Manifest.permission.CAMERA)) {
                startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+getPackageName())));
            } else requestCamera();
        });
        footer.addView(retry);
        root.addView(footer,new FrameLayout.LayoutParams(-1,-2,Gravity.BOTTOM));
        setContentView(root);
        ViewCompat.requestApplyInsets(root);
        previewView.setOnTouchListener((view,event) -> {
            if(event.getAction()==MotionEvent.ACTION_UP && camera != null) {
                FocusMeteringAction focus = new FocusMeteringAction.Builder(previewView.getMeteringPointFactory().createPoint(event.getX(),event.getY()))
                        .setAutoCancelDuration(3,TimeUnit.SECONDS).build();
                camera.getCameraControl().startFocusAndMetering(focus);
                view.performClick();
            }
            return true;
        });
        if(hasPermission()) startCamera(); else requestCamera();
    }

    private TextView text(String value,int size) {
        TextView view=new TextView(this);view.setText(value);view.setTextColor(Color.WHITE);view.setTextSize(size);return view;
    }
    private int dp(int value) { return Math.round(value*getResources().getDisplayMetrics().density); }
    private boolean hasPermission() { return ContextCompat.checkSelfPermission(this,Manifest.permission.CAMERA)==PackageManager.PERMISSION_GRANTED; }
    private void requestCamera() {
        permissionRequested=true;
        ActivityCompat.requestPermissions(this,new String[]{Manifest.permission.CAMERA},CAMERA_PERMISSION);
    }
    @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results) {
        super.onRequestPermissionsResult(code,permissions,results);
        if(code != CAMERA_PERMISSION) return;
        if(hasPermission()) startCamera();
        else showError("Zum Live-Scannen bitte den Kamerazugriff erlauben.",
                ActivityCompat.shouldShowRequestPermissionRationale(this,Manifest.permission.CAMERA) ? "Kamera erlauben" : "Einstellungen öffnen");
    }
    @Override protected void onResume() {
        super.onResume();
        if(previewView != null && hasPermission() && camera == null) startCamera();
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        state.putBoolean("permissionRequested",permissionRequested);
        super.onSaveInstanceState(state);
    }
    private void startCamera() {
        if(cameraStarting || destroyed || completed || !hasPermission()) return;
        cameraStarting=true;retry.setVisibility(View.GONE);
        status.setText("Kamera wird geöffnet …");
        ListenableFuture<ProcessCameraProvider> future=ProcessCameraProvider.getInstance(this);
        future.addListener(() -> {
            cameraStarting=false;
            if(destroyed || completed || isFinishing()) return;
            try {
                provider=future.get();
                CameraSelector selector=provider.hasCamera(CameraSelector.DEFAULT_BACK_CAMERA) ? CameraSelector.DEFAULT_BACK_CAMERA : CameraSelector.DEFAULT_FRONT_CAMERA;
                if(!provider.hasCamera(selector)) { showError("Auf diesem Gerät ist keine Kamera verfügbar.","Erneut versuchen");return; }
                preview=new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());
                analysis=new ImageAnalysis.Builder().setTargetResolution(labelMode?new Size(1920,1080):new Size(1280,720))
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build();
                analysis.setAnalyzer(analyzer,this::analyze);
                provider.unbindAll();
                camera=provider.bindToLifecycle(this,selector,preview,analysis);
                torchButton.setVisibility(camera.getCameraInfo().hasFlashUnit() ? View.VISIBLE : View.GONE);
                status.setText(labelMode?"Produktetikett ruhig in den Rahmen halten.\nText erkennen lassen und Angaben übernehmen.":"Barcode in den Rahmen halten.\nDer Code wird automatisch übernommen.");
            } catch(Exception failure) {
                camera=null;
                showError("Kamera konnte nicht geöffnet werden. Schließe andere Kamera-Apps und versuche es erneut.","Erneut versuchen");
            }
        },ContextCompat.getMainExecutor(this));
    }

    @androidx.annotation.OptIn(markerClass=ExperimentalGetImage.class)
    private void analyze(ImageProxy frame) {
        if(completed || destroyed) { frame.close();return; }
        Image image=frame.getImage();
        if(image==null) { frame.close();return; }
        try {
            if(recognizer!=null){
                InputImage input=InputImage.fromMediaImage(image,frame.getImageInfo().getRotationDegrees());
                Task<List<Barcode>> codes=scanner.process(input);
                Task<Text> text=recognizer.process(input);
                Tasks.whenAllComplete(codes,text).addOnCompleteListener(done->{
                    try {
                        if(completed||destroyed||isFinishing())return;
                        latestText=text.isSuccessful()?text.getResult().getText():"";
                        latestText=latestText.substring(0,Math.min(10000,latestText.length()));
                        latestCodes=new JSONArray();
                        if(codes.isSuccessful())for(Barcode code:codes.getResult()){
                            String raw=code.getRawValue();
                            if(raw!=null&&raw.length()<=10000&&latestCodes.length()<10)latestCodes.put(new JSONObject().put("rawValue",raw).put("format",code.getFormat()));
                        }
                        boolean shipping=java.util.regex.Pattern.compile("(?im)(?:^|\\n)\\s*(?:GLS|DHL|DPD|FedEx|Hermes)\\b|\\b(?:parcel|tracking\\s*(?:number|id|code)|paketnummer|sendungsnummer|shipping label)\\b").matcher(latestText).find();
                        if(!labelMode){
                            if(shipping){lastCodes="";stableFrames=0;status.setText("Versandetikett erkannt. Bitte das Etikett direkt am Produkt scannen.");}
                            else acceptCodes(codes.isSuccessful()?codes.getResult():Collections.emptyList(),latestText);
                            return;
                        }
                        acceptLabel.setEnabled(!shipping&&latestText.trim().length()>2);
                        if(shipping)status.setText("Versandetikett erkannt. Bitte das Typenschild direkt am Produkt lesen.");
                        else if(latestText.isEmpty())status.setText("Text noch nicht lesbar. Näher herangehen, ruhig halten oder Licht einschalten.");
                        else status.setText("Erkannter Text – bitte prüfen:\n"+latestText.substring(0,Math.min(220,latestText.length())));
                    }catch(Exception failure){if(!destroyed&&!completed){if(acceptLabel!=null)acceptLabel.setEnabled(false);status.setText("Etikett noch nicht lesbar. Bitte erneut ausrichten.");}}
                    finally{frame.close();}
                });
                return;
            }
            scanner.process(InputImage.fromMediaImage(image,frame.getImageInfo().getRotationDegrees()))
                    .addOnSuccessListener(codes->acceptCodes(codes,""))
                    .addOnFailureListener(failure -> {
                        if(!destroyed && !completed) status.setText("Barcode noch nicht lesbar. Ruhig halten, näher herangehen oder Licht einschalten.");
                    }).addOnCompleteListener(result -> frame.close());
        } catch(RuntimeException failure) { frame.close(); }
    }
    private void acceptCodes(List<Barcode> barcodes,String labelText) {
        if(completed || destroyed || isFinishing()) return;
        JSONArray codes=new JSONArray();List<String> signature=new ArrayList<>();
        for(Barcode barcode:barcodes) {
            String raw=barcode.getRawValue();
            if(raw==null || raw.isEmpty() || raw.length()>10000 || codes.length()>=10) continue;
            try { codes.put(new JSONObject().put("rawValue",raw).put("format",barcode.getFormat()));signature.add(raw); }
            catch(Exception ignored) { }
        }
        if(codes.length()==0) { lastCodes="";stableFrames=0;return; }
        Collections.sort(signature);String current=new JSONArray(signature).toString();
        stableFrames=current.equals(lastCodes) ? stableFrames+1 : 1;lastCodes=current;
        if(stableFrames<2) return;
        completed=true;
        setResult(RESULT_OK,new Intent().putExtra(RESULT_CODES,codes.toString()).putExtra(RESULT_TEXT,labelText));
        finish();
    }
    private void showError(String message,String button) {
        status.setText(message);retry.setText(button);retry.setVisibility(View.VISIBLE);torchButton.setVisibility(View.GONE);
    }
    @Override public void onConfigurationChanged(Configuration config) {
        super.onConfigurationChanged(config);
        if(previewView.getDisplay() != null) {
            int rotation=previewView.getDisplay().getRotation();
            if(preview != null) preview.setTargetRotation(rotation);
            if(analysis != null) analysis.setTargetRotation(rotation);
        }
    }
    @Override protected void onDestroy() {
        destroyed=true;
        if(analysis != null) analysis.clearAnalyzer();
        if(provider != null) provider.unbindAll();
        if(scanner != null) scanner.close();
        if(recognizer != null)recognizer.close();
        analyzer.shutdown();
        super.onDestroy();
    }
    private final class ScanGuide extends View {
        private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);
        ScanGuide() { super(BarcodeScanActivity.this);setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO); }
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);float width=getWidth()*.82f,height=Math.min(getHeight()*(labelMode?.45f:.28f),dp(labelMode?340:220));
            RectF rect=new RectF((getWidth()-width)/2,(getHeight()-height)/2,(getWidth()+width)/2,(getHeight()+height)/2);
            paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(dp(3));paint.setColor(0xFF84BBFF);
            canvas.drawRoundRect(rect,dp(18),dp(18),paint);
        }
    }
}
