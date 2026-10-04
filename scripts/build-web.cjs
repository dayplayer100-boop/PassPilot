'use strict';
// node scripts/build-web.cjs [path/to/public-firebase-config.json]
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let config = null;
const configPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'public-firebase-config.json');
if (process.argv[2] || fs.existsSync(configPath)) {
  const input = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!/^[a-z][a-z0-9-]{4,29}$/.test(input.projectId || '') || !/^[A-Za-z0-9_-]{20,100}$/.test(input.apiKey || '')) throw Error('Projekt-ID oder öffentlicher Web-API-Key fehlt / ist ungültig.');
  // Copy ONLY public values, never arbitrary secrets from the input file.
  config = {projectId: input.projectId, apiKey: input.apiKey};
}
const dist = path.join(root, 'web-dist');
fs.rmSync(dist, {recursive:true, force:true});
fs.cpSync(path.join(root, 'app/src/main/assets/app'), dist, {recursive:true});
fs.cpSync(path.join(root, 'public-viewer'), path.join(dist, 'pass'), {recursive:true});
const viewerPath=path.join(dist,'pass/index.html');fs.writeFileSync(viewerPath,fs.readFileSync(viewerPath,'utf8').replace('<html lang="de">','<html lang="de" data-app-root="../">'));
fs.cpSync(path.join(root, 'web/vendor'), path.join(dist, 'vendor'), {recursive:true});
for (const file of ['web-entry.js', 'web-runtime.js', 'web-tools.js', 'web.css']) fs.copyFileSync(path.join(root, 'web', file), path.join(dist, file));
fs.writeFileSync(path.join(dist, 'deployment-config.js'), 'window.PassPilotWebConfig = ' + JSON.stringify(config) + ';\n');
const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace('<script src="qrcode-lite.js" defer>', '<script src="web-entry.js"></script>\n  <script src="deployment-config.js" defer></script>\n  <script src="qrcode-lite.js" defer>');
html = html.replace('<script src="app.js" defer>', '<script src="vendor/zxing-browser.min.js" defer></script>\n  <script src="web-tools.js" defer></script>\n  <script src="web-runtime.js" defer></script>\n  <script src="app.js" defer>');
html = html.replace('<link rel="stylesheet" href="styles.css">', '<meta name="referrer" content="no-referrer">\n  <link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="web.css">');
fs.writeFileSync(indexPath, html);
const appPath = path.join(dist, 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/^const PUBLIC_VIEWER_URL = .*;$/m, "const PUBLIC_VIEWER_URL = new URL('./pass/', location.href).href;");
fs.writeFileSync(appPath, app);
const swPath = path.join(dist, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8').replace("const ASSETS=[", "const ASSETS=['./pass/','./pass/index.html','./pass/public-pass.js','./pass/viewer.js','./pass/firebase-viewer.js','./pass/asset-viewer.js','./pass/styles.css','./pass/favicon.png','./web-tools.js','./vendor/zxing-browser.min.js','./web-entry.js','./web-runtime.js','./web.css','./deployment-config.js',");
const optional=[];function list(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())list(file);else if(!file.includes(path.sep+'licenses'+path.sep))optional.push('./'+path.relative(dist,file).split(path.sep).join('/'));}}list(path.join(dist,'vendor'));
fs.writeFileSync(swPath, sw.replace('const OPTIONAL=[];', 'const OPTIONAL='+JSON.stringify(optional)+';'));
console.log('Web-Version erstellt: web-dist (vollständige App + /pass/ Leseseite).');
console.log(config ? 'Öffentliche Firebase-Projektkonfiguration eingebunden.' : 'Ohne Projektkonfiguration: lokal nutzbar; Firebase unter Einstellungen verbinden.');

const version=fs.readFileSync(path.join(root,'app/src/main/assets/app/app.js'),'utf8').match(/const APP_VERSION = '([^']+)'/)[1];
fs.writeFileSync(path.join(dist,'app-version.json'),JSON.stringify({version}));
fs.writeFileSync(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /pass/\nSitemap: https://passpilot-app.web.app/sitemap.xml\n');
fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://passpilot-app.web.app/</loc></url></urlset>');

if(process.env.PASSPILOT_MINIFY==='1'){
 const exec=require('node:child_process').execFileSync;
 const terser=path.join(root,'node_modules/.bin/terser');
 if(!fs.existsSync(terser))throw Error('Release-Build: zuerst npm ci ausführen.');
 const ownScripts=[...fs.readdirSync(dist).filter(name=>name.endsWith('.js')),...fs.readdirSync(path.join(dist,'pass')).filter(name=>name.endsWith('.js')).map(name=>'pass/'+name)];
 for(const name of ownScripts.filter(name=>name.endsWith('.js')&&!['sw.js','qrcode-lite.js','project-config.js','deployment-config.js','legal-config.js','assistant-config.js'].includes(name))){
  const file=path.join(dist,name);exec(terser,[file,'--compress','--mangle','--comments','/^!/','--output',file]);
 }
 for(const name of ownScripts.filter(name=>!['qrcode-lite.js'].includes(name))){const file=path.join(dist,name);fs.writeFileSync(file,'/*! © 2026 PassPilot – eigene schutzfähige Beiträge. Drittanbieterrechte vorbehalten. */\n'+fs.readFileSync(file,'utf8'));}
 console.log('Öffentliche Projekt-Skripte komprimiert, ohne Source-Maps. Drittanbieter-Hinweise erhalten.');
}
