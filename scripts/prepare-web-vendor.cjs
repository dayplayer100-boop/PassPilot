'use strict';
// Rebuild the browser dependencies from exact package versions and checked data.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),zlib=require('node:zlib'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'web/vendor-manifest.json'),'utf8')),temp=fs.mkdtempSync(path.join(os.tmpdir(),'passpilot-web-dependencies-')),dest=path.join(root,'web/vendor');
try{
 const npmArgs=['install','--prefix',temp,...Object.entries(manifest.packages).map(([name,version])=>name+'@'+version)];
 // npm is a .cmd file on Windows. Running its JavaScript entry point with
 // Node avoids a shell and also works when Node is installed in a spaced path.
 const npmCli=process.env.npm_execpath;
 if(npmCli&&fs.existsSync(npmCli))execFileSync(process.execPath,[npmCli,...npmArgs],{stdio:'inherit'});
 else if(process.platform==='win32')throw Error('Bitte npm run prepare:vendor verwenden, damit der npm-Pfad gesetzt ist.');
 else execFileSync('npm',npmArgs,{stdio:'inherit'});
 const source=path.join(temp,'node_modules');fs.mkdirSync(dest,{recursive:true});
 for(const [from,to]of [['html2canvas/dist/html2canvas.min.js','html2canvas.min.js'],['tesseract.js/dist/tesseract.min.js','ocr/tesseract.min.js'],['tesseract.js/dist/worker.min.js','ocr/worker.min.js'],['tesseract.js-core/tesseract-core-lstm.wasm.js','ocr/core/tesseract-core-lstm.wasm.js'],['tesseract.js-core/tesseract-core-simd-lstm.wasm.js','ocr/core/tesseract-core-simd-lstm.wasm.js'],['pdf-lib/dist/pdf-lib.min.js','pdf-lib.min.js'],['@zxing/browser/umd/zxing-browser.min.js','zxing-browser.min.js'],['pdfjs-dist/build/pdf.mjs','pdf/pdf.mjs'],['pdfjs-dist/build/pdf.worker.mjs','pdf/pdf.worker.mjs']]){const file=path.join(dest,to);fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(path.join(source,from),file);}
 fs.mkdirSync(path.join(dest,'licenses'),{recursive:true});
 for(const name of ['html2canvas','tesseract.js','tesseract.js-core','pdf-lib','pdfjs-dist','@zxing/browser','@zxing/library'])for(const license of ['LICENSE','LICENSE.md','LICENSE.txt']){const file=path.join(source,name,license);if(fs.existsSync(file)){fs.copyFileSync(file,path.join(dest,'licenses',name.replaceAll('/','-')+'-'+license));break;}}
 for(const [language,expected]of Object.entries(manifest.languageSha256)){const file=path.join(temp,language+'.traineddata');execFileSync('curl',['-fL','https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/'+language+'.traineddata','-o',file],{stdio:'inherit'});const data=fs.readFileSync(file);if(crypto.createHash('sha256').update(data).digest('hex')!==expected)throw Error('OCR-Sprachdaten geändert: '+language+'. Quelle prüfen, nicht ungeprüft übernehmen.');fs.mkdirSync(path.join(dest,'ocr/lang'),{recursive:true});fs.writeFileSync(path.join(dest,'ocr/lang',language+'.traineddata.gz'),zlib.gzipSync(data,{level:9}));}
 execFileSync('curl',['-fL','https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/LICENSE','-o',path.join(dest,'licenses/tessdata-fast-LICENSE')],{stdio:'inherit'});
 console.log('Lokale Browser-Erkennungsdateien vorbereitet.');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
