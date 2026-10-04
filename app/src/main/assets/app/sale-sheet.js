(function(global){
  'use strict';
  const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  function build(input,url,qrImage,createdAt=new Date()){
    const data=PassPilotPublic.normalize(input);const link=new URL(url);
    if(!data||data.purpose!=='sale'||link.protocol!=='https:'||link.username||link.password||!link.hash.startsWith('#pass='))throw new Error('Ungültiger Verkaufspass');
    const linkedData=PassPilotPublic.decode(link.hash.slice(6));
    if(JSON.stringify(data)!==JSON.stringify(linkedData))throw new Error('QR-Link und Verkaufsangaben stimmen nicht überein');
    if(!/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(qrImage))throw new Error('Ungültiges QR-Bild');
    const container=document.createElement('div');container.innerHTML=PassPilotPublic.render(data);
    const product=container.querySelector('section');product.remove();
    const date=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(createdAt);
    const css=`
      @page{size:A4;margin:12mm}*{box-sizing:border-box}html{background:#eef1f5}body{margin:0;color:#111;font:10.5pt/1.4 Arial,sans-serif;background:white;padding:12mm;overflow-wrap:anywhere}
      .sheet-header{display:flex;justify-content:space-between;gap:8mm;align-items:flex-start;border-bottom:1px solid #bbb;padding-bottom:4mm;margin-bottom:6mm}.sheet-brand{font-size:16pt;font-weight:bold}.sheet-subtitle,.sheet-date{font-size:9pt;color:#555}.sheet-top{display:grid;grid-template-columns:minmax(0,1fr) 70mm;gap:8mm;align-items:start}
      .card{margin:0 0 5mm}.card h1{font-size:23pt;line-height:1.12;margin:2mm 0 4mm}.card h2{font-size:13pt;margin:4mm 0 2mm}.card h3{font-size:11pt;margin:0}.card p{margin:2mm 0}.eyebrow{font-size:8pt;letter-spacing:.05em;text-transform:uppercase;color:#555}.sale-status{font-weight:bold}.public-fields{margin:4mm 0}.public-fields>div{display:grid;grid-template-columns:42% minmax(0,1fr);gap:3mm;padding:1.8mm 0;border-bottom:1px solid #ddd;break-inside:avoid}.public-fields dt{color:#555}.public-fields dd{margin:0}.public-description{white-space:pre-wrap}
      .sheet-qr{text-align:center;break-inside:avoid;border:1px solid #ccc;padding:3mm}.sheet-qr img{width:64mm;height:64mm;display:block;max-width:100%;margin:auto}.sheet-qr h2{font-size:12pt;margin:2mm 0}.sheet-qr p{font-size:9pt;margin:2mm 0}.sheet-qr a{color:#111;font-size:8.5pt;text-decoration:none}.public-history{border-top:1px solid #ddd;padding:2.5mm 0;break-inside:avoid}.public-history p{margin:1.5mm 0}.public-history small{font-size:8.5pt;color:#555}.public-footnote{font-size:8.5pt;color:#555;border-top:1px solid #ccc;padding-top:3mm;margin-top:4mm}
      @media(max-width:550px){body{padding:6mm}.sheet-top{grid-template-columns:1fr}.sheet-qr{max-width:76mm;margin:0 auto 6mm}.sheet-header{flex-wrap:wrap}.card h1{font-size:20pt}}
      @media print{html,body{background:#fff}body{padding:0}.sheet-top{grid-template-columns:minmax(0,1fr) 70mm}.sheet-qr{max-width:none;margin:0}.sheet-header{flex-wrap:nowrap}.card h1{font-size:23pt}a{color:#111}}
    `;
    const body=`<header class="sheet-header"><div><div class="sheet-brand">PassPilot</div><div class="sheet-subtitle">Produktinformationen zum Beilegen</div></div><div class="sheet-date">Erstellt am ${escape(date)}</div></header><main><div class="sheet-top"><div>${product.outerHTML}</div><aside class="sheet-qr"><img id="saleSheetQr" src="${qrImage}" alt="QR-Code für die freigegebenen Produktinformationen"><h2>Produktinfos digital öffnen</h2><p>Mit der Handykamera scannen.<br>Mit oder ohne PassPilot-App lesbar.</p><a href="${escape(link.href)}" rel="noreferrer">${escape(link.hostname)}</a></aside></div>${container.innerHTML}</main>`;
    const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>${escape(data.title)} – Verkaufszettel</title><style>${css}</style></head><body>${body}</body></html>`;
    return {html,title:`PassPilot – ${data.title}`,url:link.href};
  }
  global.PassPilotSaleSheet={build};
})(window);
