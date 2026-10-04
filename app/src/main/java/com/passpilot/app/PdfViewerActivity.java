package com.passpilot.app;
import android.app.Activity;
import android.os.*;
import android.graphics.*;
import android.graphics.pdf.PdfRenderer;
import android.widget.*;
import android.view.*;
import java.io.File;
public class PdfViewerActivity extends Activity {
 private PdfRenderer renderer;private ParcelFileDescriptor fd;private Bitmap bitmap;private ImageView image;private TextView counter;private int page=0;private File source;
 @Override public void onCreate(Bundle saved){super.onCreate(saved);getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE,WindowManager.LayoutParams.FLAG_SECURE);try{source=new File(getIntent().getStringExtra("path"));File allowed=new File(getCacheDir(),"documents");if(!source.getCanonicalPath().startsWith(allowed.getCanonicalPath()+File.separator))throw new Exception();fd=ParcelFileDescriptor.open(source,ParcelFileDescriptor.MODE_READ_ONLY);renderer=new PdfRenderer(fd);LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setPadding(12,35,12,35);LinearLayout nav=new LinearLayout(this);Button back=new Button(this),prev=new Button(this),next=new Button(this);back.setText("Schließen");prev.setText("‹");next.setText("›");counter=new TextView(this);counter.setGravity(Gravity.CENTER);nav.addView(back);nav.addView(prev);nav.addView(counter,new LinearLayout.LayoutParams(0,-1,1));nav.addView(next);root.addView(nav);image=new ImageView(this);image.setScaleType(ImageView.ScaleType.FIT_CENTER);root.addView(image,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);back.setOnClickListener(v->finish());prev.setOnClickListener(v->{if(page>0){page--;show();}});next.setOnClickListener(v->{if(page<renderer.getPageCount()-1){page++;show();}});if(saved!=null)page=Math.min(saved.getInt("page",0),renderer.getPageCount()-1);show();}catch(Exception e){Toast.makeText(this,"PDF konnte nicht geöffnet werden (möglicherweise geschützt oder beschädigt)",Toast.LENGTH_LONG).show();finish();}}
 private void show(){try(PdfRenderer.Page p=renderer.openPage(page)){int width=Math.min(2200,Math.max(800,getResources().getDisplayMetrics().widthPixels*2)),height=(int)((double)p.getHeight()/p.getWidth()*width);if(height>3500){width=(int)((double)width*3500/height);height=3500;}Bitmap next=Bitmap.createBitmap(width,height,Bitmap.Config.ARGB_8888);next.eraseColor(Color.WHITE);p.render(next,null,null,PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);image.setImageBitmap(next);if(bitmap!=null)bitmap.recycle();bitmap=next;counter.setText((page+1)+" / "+renderer.getPageCount());}catch(Exception e){Toast.makeText(this,"Seite konnte nicht angezeigt werden",Toast.LENGTH_SHORT).show();}}
 @Override public void onSaveInstanceState(Bundle out){out.putInt("page",page);super.onSaveInstanceState(out);}
 @Override public void onDestroy(){if(bitmap!=null)bitmap.recycle();if(renderer!=null)renderer.close();try{if(fd!=null)fd.close();}catch(Exception ignored){}if(isFinishing()&&source!=null)source.delete();super.onDestroy();}
}
