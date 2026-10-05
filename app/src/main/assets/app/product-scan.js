(function(global){
  'use strict';
  const required=[['category','Kategorie'],['name','Produktbezeichnung'],['brand','Marke'],['model','Modell'],['serial','Seriennummer'],['purchaseDate','Kaufdatum'],['retailer','Händler'],['price','Kaufpreis']];
  const limits={name:120,brand:80,model:100,serial:100,partNumber:100,barcode:180,retailer:120};
  const brands=['Rowenta','Bosch','Siemens','Samsung','Apple','Sony','Philips','LG','Panasonic','Canon','Nikon','Fujifilm','Olympus','Leica','Makita','DeWalt','Milwaukee','Einhell','Festool','Ryobi','Miele','AEG','Beko','Whirlpool','Bauknecht','Haier','Lenovo','Dell','HP','Acer','Asus','Microsoft','Garmin','GoPro','DJI','Bose','JBL','Sennheiser','Cube','Trek','Specialized','Giant','Kalkhoff','Gazelle','Scott','Fender','Yamaha','Roland','Korg','Casio','Stihl','Husqvarna','Dyson','Nintendo','Logitech','Razer','Beyerdynamic','KitchenAid','Kenwood','DeLonghi','Smeg'];
  const CATALOG_CACHE_KEY='passpilot-catalog-v1',CACHE_DAYS=30;
  let currentScan=null,currentLookup=null,currentWebScan=null;
  const string=(value,max=1000)=>typeof value==='string'?value.slice(0,max).trim():'';
  function validGtin(code){if(!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code||''))return false;let sum=0,weight=3;for(let i=code.length-2;i>=0;i--){sum+=Number(code[i])*weight;weight=4-weight}return (10-sum%10)%10===Number(code.at(-1))}
  function expandUpce(code){if(!/^[01]\d{7}$/.test(code))return '';const d=code.slice(1,7),last=d[5];const prefix=code[0];const body='012'.includes(last)?prefix+d.slice(0,2)+last+'0000'+d.slice(2,5):last==='3'?prefix+d.slice(0,3)+'00000'+d.slice(3,5):last==='4'?prefix+d.slice(0,4)+'00000'+d[4]:prefix+d.slice(0,5)+'0000'+last;const expanded=body+code[7];return validGtin(expanded)?expanded:''}
  function inferCategory(text){const value=string(text,4000).toLowerCase();for(const [category,pattern] of [['ebike',/e[- ]?bike|fahrrad|bicycle|mountainbike|pedelec|road bike/],['camera',/kamera|camera|camcorder|objektiv|lens/],['tool',/bohr|drill|schrauber|säge|\bsaw\b|werkzeug|power tool/],['instrument',/gitarre|guitar|piano|klavier|synthesizer|keyboard instrument|saxophon|violin/],['appliance',/waschmaschine|washing machine|dishwasher|geschirrspüler|kühlschrank|refrigerator|staubsauger|vacuum cleaner|kaffeemaschine|coffee machine|toaster|microwave|mikrowelle/],['electronics',/kopfhörer|headphone|smartphone|tablet|laptop|notebook|computer|monitor|fernseher|television|\btelevis|speaker|lautsprecher|smartwatch|konsole|playstation|xbox|tastatur|keyboard|gaming mouse|computer mouse|taschenrechner|calculator/]])if(pattern.test(value))return category;return ''}
  const aliases={partNumber:'Produkt(?:nummer|[- ]?Nr\\.?)|Product\\s*(?:No\\.?|Number)|Artikel(?:nummer|[- ]?Nr\\.?)|Article\\s*(?:No\\.?|Number)|Part\\s*(?:No\\.?|Number)|P\\/N|SKU',brand:'Marke|Brand|Hersteller|Manufacturer',model:'Modell(?:[- \\s]*(?:Nr\\.?|Nummer))?|Model(?:[- \\s]*(?:No\\.?|Number))?|M\\/N|E[- ]?Nr\\.?|Typ|Type',serial:'Serien(?:nummer|[- ]?Nr\\.?)|Serial(?:[- \\s]*(?:No\\.?|Number))?|S\\/N|S\\.?N\\.?|Rahmen(?:nummer|[- ]?Nr\\.?)|Frame\\s*(?:No\\.?|Number)',name:'Produkt(?:name|bezeichnung)?|Product(?:\\s*name)?|Bezeichnung',barcode:'EAN|UPC|GTIN',purchaseDate:'Kaufdatum|Purchase\\s*date',warrantyUntil:'Garantie\\s*bis|Warranty\\s*(?:until|end)',nextMaintenance:'Nächste\\s*Wartung|Next\\s*maintenance',price:'Kaufpreis|Purchase\\s*price',retailer:'Händler|Retailer'};
  const labelAnnotation='(?:\\s*\\[[^\\]\\n]{0,60}\\])?';
  const allKeys='(?:'+Object.values(aliases).join('|')+')'+labelAnnotation;
  function labeledValue(text,key){const keyPattern='(?:'+aliases[key]+')'+labelAnnotation;const matcher=new RegExp('(?:^|\\n|\\s)(?:'+keyPattern+')\\s*[:#=]\\s*([^\\n]+?)(?=\\s+(?:'+allKeys+')\\s*[:#=]|\\n|$)','i');let match=text.match(matcher);if(match)return match[1].trim();const lines=text.split('\n').map(line=>line.trim());const standalone=new RegExp('^(?:'+keyPattern+')\\s*[:#=]?$', 'i');for(let i=0;i<lines.length-1;i++)if(standalone.test(lines[i])&&lines[i+1]&&!new RegExp('^(?:'+allKeys+')\\b','i').test(lines[i+1]))return lines[i+1];
    if(['brand','model','serial','partNumber','barcode'].includes(key)){const inline=new RegExp('^(?:'+keyPattern+')\\s+([^\\n]+)$','i');for(const line of lines){const found=line.match(inline);if(found&&!new RegExp('^(?:'+allKeys+')\\b','i').test(found[1]))return found[1].trim()}}
    return ''}

  function readDate(value){const text=string(value,80);const iso=text.match(/\b(\d{4}-\d{2}-\d{2})\b/);if(iso)return calendarDate(iso[1]);const local=text.match(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/);return local?calendarDate(`${local[3]}-${local[2].padStart(2,'0')}-${local[1].padStart(2,'0')}`):''}
  function readPrice(value){const text=string(value,80);const match=text.match(/(?:EUR|USD|€|\$)?\s*(\d+(?:[ .]\d{3})*(?:[,.]\d{1,2})?)\s*(EUR|USD|€|\$)?/i);if(!match)return null;let number=match[1].replace(/ /g,'');if(number.includes(','))number=number.replaceAll('.','').replace(',','.');else if(/^\d{1,3}(?:\.\d{3})+$/.test(number))number=number.replaceAll('.','');if(!Number.isFinite(Number(number)))return null;return{price:String(Number(number)),currency:/USD|\$/i.test(text)?'USD':'EUR'}}
  function isShippingLabel(text){return /(?:^|\n)\s*(?:GLS|DHL|DPD|FedEx|Hermes)(?:\b|$)|\b(?:parcel|tracking\s*(?:number|id|code)|paketnummer|sendungsnummer|versandetikett|shipping label)\b/i.test(string(text,10000))}
  function parseLabel(text){text=string(text,30000).replaceAll('\r','').replaceAll('：',':').replace(/\bS\s*\/\s*N\b/gi,'S/N').replace(/\bMODEL\s*(?:N0|NO\s*\.)/gi,'Model No.');if(isShippingLabel(text))return {};const fields={};for(const name of ['brand','model','serial','partNumber','name','retailer']){const value=labeledValue(text,name);if(value)fields[name]=string(value,limits[name])}
    if(!fields.brand&&/^RZ\d{2}-\d{4}/i.test(fields.model||''))fields.brand='Razer';if(!fields.brand){const lines=text.split('\n').slice(0,10);for(const brand of brands){const escaped=brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const header=lines.find(line=>new RegExp('^'+escaped+'(?:$|\\s+(?:model|modell|typ|type)\\b)','i').test(line.trim()));const modelLine=lines.map(line=>line.trim().match(new RegExp('^'+escaped+'\\s+([A-Z0-9][A-Z0-9._/-]{2,49})$','i'))).find(match=>match&&/[A-Za-z]/.test(match[1])&&/\d/.test(match[1]));if(header||modelLine){fields.brand=brand;if(!fields.model&&modelLine)fields.model=modelLine[1];break}}}
    const headerLines=text.split('\n').slice(0,40).map(line=>line.replace(/[™®]/g,'').replace(/^[^A-Za-z0-9]+/,'').trim()).filter(Boolean);
    for(const brand of brands){
      const escaped=brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const index=headerLines.findIndex(line=>new RegExp('^'+escaped+'(?:\\s|$)','i').test(line));
      if(index<0)continue;
      if(!fields.brand)fields.brand=brand;
      if(fields.brand.toLowerCase()!==brand.toLowerCase())break;
      const rest=headerLines[index].replace(new RegExp('^'+escaped+'\\s*','i'),'');
      const candidate=rest||headerLines[index+1]||'';
      if(!fields.name&&/^[A-Za-z0-9][A-Za-z0-9 .+/-]{2,79}$/.test(candidate)&&candidate.split(/\s+/).length>=2&&candidate.split(/\s+/).every(w=>w.length>1)&&!/\b(?:rating|solar|battery|made|computer co|company|ltd|inc|model|serial|product no|manufacturer|warning|address|patent|copyright|telephone)\b|[:=]/i.test(candidate))fields.name=string(brand+' '+candidate,120);
      break;
    }
    if(!fields.name&&fields.brand==='Razer'&&/\bBLACK\s*WIDOW\b/i.test(text))fields.name='Razer BlackWidow'+(/\bCHROMA\b/i.test(text)?' Chroma':'');
    if(fields.brand&&!fields.name){
      const heading=headerLines.slice(0,8).find(line=>/^[A-Z][A-Z /-]{3,79}$/.test(line)&&line.split(/\s+/).length>=2&&!/\b(?:MODEL|NUMBER|PRODUCT|RATING|SOLAR|BATTERY|MADE|COMPUTER|COMPANY|LTD|INC|WARNING|ADDRESS|PATENT|COPYRIGHT|USE|CE)\b/.test(line));
      if(heading)fields.name=string(fields.brand+' '+heading,120);
    }
    // Keep manufacturer product numbers separate from serials and retail GTINs.
    if(fields.partNumber)fields.partNumber=fields.partNumber.match(/^[A-Za-z0-9][A-Za-z0-9._/-]{1,99}/)?.[0]||'';
    if(fields.model)fields.model=fields.model.match(/^[A-Za-z0-9][A-Za-z0-9 ._/-]{0,99}/)?.[0]?.trim()||'';
    if(fields.model&&(/[^A-Za-z0-9]$/.test(fields.model)||fields.model.length<3))delete fields.model;
    if(fields.serial)fields.serial=fields.serial.match(/^[A-Za-z0-9][A-Za-z0-9._/-]{1,99}/)?.[0]||'';
    const barcode=labeledValue(text,'barcode').replace(/[\s-]/g,'');if(validGtin(barcode))fields.barcode=barcode;
    if(!fields.barcode){const codes=[...new Set(text.split('\n').map(line=>line.trim().replace(/\s/g,'')).filter(validGtin))];if(codes.length===1)fields.barcode=codes[0]}
    if(fields.barcode&&fields.serial&&fields.barcode===fields.serial)delete fields.barcode;
    for(const key of ['purchaseDate','warrantyUntil','nextMaintenance']){const date=readDate(labeledValue(text,key));if(date)fields[key]=date}
    const price=readPrice(labeledValue(text,'price'));if(price)Object.assign(fields,price);
    const category=inferCategory([fields.name,fields.model,text].filter(Boolean).join(' '))||(fields.brand&&/\b(?:rating|dc|ac)\b[^\n]{0,35}\d(?:[.,]\d+)?\s*v\b/i.test(text)?'electronics':'');if(category)fields.category=category;
    if(!fields.name&&fields.brand&&fields.model)fields.name=`${fields.brand} ${fields.model}`.slice(0,120);
    return fields;
  }
  function reconcileLabel(text,barcodes){const fields=parseLabel(text);if(fields.serial&&fields.serial.length>=6){const matches=[...new Set((barcodes||[]).filter(b=>[1,2,4,8,128,'code_128','code_39','code_93','codabar','itf'].includes(b.format)).map(b=>string(b.rawValue,100).replace(/\s/g,'')).filter(raw=>/^[A-Za-z0-9][A-Za-z0-9._/-]{5,99}$/.test(raw)&&!validGtin(raw)&&raw.startsWith(fields.serial)))];if(matches.length===1)fields.serial=matches[0];}return fields;}
  function parseBarcodes(barcodes){const fields={},gtins=[],otherCodes=[];for(const barcode of Array.isArray(barcodes)?barcodes:[]){const raw=string(typeof barcode==='string'?barcode:barcode?.rawValue,10000);if(!raw)continue;const format=barcode?.format;const numeric=raw.replace(/\s/g,'');const expanded=(format===1024||format==='upc_e')?expandUpce(numeric):numeric;if(validGtin(expanded))gtins.push(expanded);else if([1,2,4,8,128,'code_128','code_39','code_93','codabar','itf'].includes(format)&&/^[A-Za-z0-9][A-Za-z0-9._/ -]{2,179}$/.test(raw))otherCodes.push(raw);
      const gs1=raw.replace(/^\][A-Za-z0-9]{2}/,'');const gtin=gs1.match(/(?:^01|\(01\))(\d{14})/);if(gtin&&validGtin(gtin[1])){gtins.push(gtin[1]);const serial=gs1.match(/(?:\(21\)|\x1d21|^01\d{14}21)([^\x1d(]+)/);if(serial)fields.serial=string(serial[1],100)}
      if(/^https:\/\//i.test(raw)){try{const url=new URL(raw);if(url.hash.startsWith('#pass=')){const pass=PassPilotPublic.decode(url.hash.slice(6));if(pass){for(const name of ['brand','model','serial'])if(pass[name])fields[name]=string(pass[name],limits[name]);if(pass.title)fields.name=string(pass.title,120);if(pass.category&&pass.category!=='other')fields.category=pass.category}}
        const gtinPath=url.pathname.match(/\/01\/(\d{14})(?:\/|$)/);if(gtinPath&&validGtin(gtinPath[1])){gtins.push(gtinPath[1]);const serialPath=url.pathname.match(/\/21\/([^/]+)/);if(serialPath)fields.serial=string(decodeURIComponent(serialPath[1]),100)}
      }catch{}}
      if(!/^https?:\/\//i.test(raw))Object.assign(fields,parseLabel(raw));
    }
    const codes=[...new Set(gtins)];if(codes.length===1)fields.barcode=codes[0];else if(codes.length>1){delete fields.barcode;delete fields.serial}if(!codes.length&&new Set(otherCodes).size===1)fields.barcode=otherCodes[0];return{fields,codes};
  }
  function handoffCode(barcodes){const codes=[];for(const barcode of Array.isArray(barcodes)?barcodes:[]){try{const url=new URL(typeof barcode==='string'?barcode:barcode.rawValue);if(url.protocol!=='https:'||url.username||url.password)continue;const id=new URLSearchParams(url.hash.slice(1)).get('handoff');if(/^[a-z0-9]{40}$/.test(id||''))codes.push(id);}catch{}}const unique=[...new Set(codes)];return unique.length===1?unique[0]:'';}
  function missingFields(product){return required.filter(([name])=>name==='name'?!string(product.name)&&!string(product.model):name==='price'?product.price===''||product.price==null:!String(product[name]??'').trim()).map(([name,label])=>({name,label}))}
  function formValues(form){const values={};for(const [name]of required)values[name]=form.elements[name]?.value??'';return values}
  function refresh(form=document.getElementById('productForm')){if(!form)return;const missing=missingFields(formValues(form));const missingNames=new Set(missing.map(field=>field.name));for(const [name]of required){const control=form.elements[name];if(!control)continue;const field=control.closest('.field');if(!field)continue;control.id ||= `product-${name}`;const label=field.querySelector('label');if(label)label.htmlFor=control.id;let hint=field.querySelector('.completion-hint');if(!hint){hint=document.createElement('small');hint.className='completion-hint';hint.id=`completion-${name}`;field.appendChild(hint);control.setAttribute('aria-describedby',hint.id)}field.classList.toggle('field-incomplete',missingNames.has(name));hint.textContent=missingNames.has(name)?'⚠ Noch nicht angegeben (später ergänzbar)':control.dataset.scanAutofilled==='true'?'✓ Aus Scan/Katalog übernommen – bitte prüfen':'';hint.classList.toggle('scan-filled',control.dataset.scanAutofilled==='true'&&!missingNames.has(name))}
    global.PassPilotCapture?.review(form);const summary=document.getElementById('productMissingSummary');if(summary){summary.textContent=missing.length?`⚠ Noch offen: ${missing.map(field=>field.label).join(', ')}. Du kannst das Produkt bereits anlegen und später ergänzen.`:'✓ Alle wichtigen Angaben sind ausgefüllt.';summary.classList.toggle('complete',missing.length===0)}updateCodeTools(form);const quick=form.querySelector('#scanQuickSave');if(quick)quick.hidden=!(form.elements.category.value&&(form.elements.name.value.trim()||form.elements.model.value.trim()));
  }
  function panel(edit=false){return `<section class="product-scan-panel"><div class="scan-panel-head"><strong>Produkt schneller erfassen</strong><button type="button" class="soft-btn" data-action="scan-product">▥ Barcode live scannen</button></div><p class="muted">Barcode scannen für Kataloginfos. Für Marke, Modell- und Seriennummer direkt auf dem Typenschild „Etikett live lesen“ wählen.</p><label class="checkbox-row"><input type="checkbox" name="scanOnline" checked> Produktinfos online ergänzen (nur EAN/UPC wird an Produktkataloge gesendet)</label><button type="button" class="soft-btn" data-action="scan-label">Etikett live lesen</button><button type="button" class="ghost-btn" data-action="scan-photo">Etikett / Foto lesen</button><input id="productScanPhoto" type="file" accept="image/*" capture="environment" hidden><p id="productScanStatus" class="scan-status" role="status">Scannen, gefundene Angaben prüfen und Produkt anlegen. Weitere Angaben kannst du später ergänzen.</p><button id="scanQuickSave" type="submit" class="soft-btn" hidden>${edit?'Änderungen speichern':'Produkt jetzt anlegen'}</button><div id="webLiveScanner" class="web-live-scanner" hidden><video id="webLiveVideo" autoplay muted playsinline></video><span class="web-scan-frame" aria-hidden="true"></span><button type="button" class="ghost-btn" data-action="scan-stop">Scanner schließen</button></div><div id="scanCodeChoices"></div><div id="scanCodeTools" hidden><p id="scanCodeSummary" class="muted"></p><button type="button" class="ghost-btn" data-action="scan-lookup">Produktinfos suchen</button><button type="button" class="ghost-btn" data-action="scan-websearch">Im Internet suchen</button><small class="muted">Die Websuche öffnet den Browser und sucht nur nach der EAN/UPC.</small></div><details><summary>Barcode oder Etiketttext manuell übernehmen</summary><label for="scanManualText" class="muted">EAN/UPC oder Text vom Etikett</label><textarea id="scanManualText" maxlength="10000" placeholder="Marke: Bosch&#10;Modell: WGG244&#10;S/N: ABC123"></textarea><button type="button" class="ghost-btn" data-action="scan-manual">Angaben aus Text übernehmen</button></details><details id="scanRecognizedDetails" hidden><summary>Erkannten Text ansehen</summary><pre id="scanRecognizedText"></pre></details></section><p id="productMissingSummary" class="product-completion" role="status"></p>`}
  function setButtons(form,busy){if(!form)return;for(const action of ['scan-product','scan-label','scan-photo']){const button=form.querySelector(`[data-action="${action}"]`);if(button)button.disabled=busy}}
  function stopLive(){const live=currentWebScan;currentWebScan=null;if(!live)return;clearTimeout(live.timer);live.controls?.stop();if(live.stream)live.stream.getTracks().forEach(track=>track.stop());if(live.video){live.video.pause();live.video.srcObject=null}const panel=live.form.querySelector('#webLiveScanner');if(panel)panel.hidden=true;setButtons(live.form,false)}
  function cleanup(){stopLive();currentScan=null;currentLookup=null}
  function initialize(){cleanup();const form=document.getElementById('productForm');if(form)refresh(form)}
  function updateCodeTools(form){const code=form.elements.barcode?.value||'';const tools=form.querySelector('#scanCodeTools');if(!tools)return;tools.hidden=!validGtin(code)||!form.elements.scanOnline.checked;const summary=form.querySelector('#scanCodeSummary');if(summary)summary.textContent=validGtin(code)?`Produktcode: ${code}`:''}
  function status(message,form=document.getElementById('productForm')){if(!form||!document.contains(form))return;const node=form.querySelector('#productScanStatus');if(node){node.textContent=message;node.dataset.state=/wird|gesucht|Suche läuft|ergänzt/i.test(message)?'loading':/übernommen/i.test(message)?'found':/Keine Katalog|Keine Produkt|kein|nicht möglich/i.test(message)?'empty':'info'}}
  function applyFields(form,fields){const filled=[];for(const [name,value]of Object.entries(fields)){const control=form.elements[name];if(!control||typeof value!=='string'||!value.trim())continue;
    if(name==='price'&&fields.currency&&form.elements.currency.dataset.scanUserEdited==='true'&&form.elements.currency.value!==fields.currency)continue;
    if(name==='currency'){if(control.dataset.scanUserEdited==='true'||!filled.includes('price'))continue}else if(control.value.trim()&&control.dataset.scanAutofilled!=='true'&&!(name==='category'&&control.value==='other'&&!form.dataset.id&&control.dataset.scanUserEdited!=='true'))continue;
    if(control instanceof HTMLSelectElement&&!Array.from(control.options).some(option=>option.value===value))continue;control.value=value;control.dataset.scanAutofilled='true';filled.push(name)}refresh(form);return filled}
  function clearPreviousScan(form,code){
    const previous=form.elements.barcode.value;
    if(!previous||previous===code||(validGtin(previous)&&validGtin(code)&&cacheKey(previous)===cacheKey(code))||form.elements.barcode.dataset.scanAutofilled!=='true')return;
    for(const control of Array.from(form.elements))if(control.name!=='barcode'&&control.dataset.scanAutofilled==='true'){control.value=control.name==='currency'?'EUR':'';delete control.dataset.scanAutofilled}
  }
  function receiveNativeResult(requestId,result){const pending=currentScan;if(!pending||pending.id!==requestId||!document.contains(pending.form))return;currentScan=null;const form=pending.form;setButtons(form,false);if(result.status!=='success'){status(result.message||'Scan konnte nicht gelesen werden.',form);return}if(PassPilotIdentity.scan(result.barcodes)){cleanup();return;}const handoff=handoffCode(result.barcodes);if(handoff&&global.PassPilotFirebase?.beginHandoff){cleanup();global.PassPilotFirebase.beginHandoff(handoff);return;}if(isShippingLabel(result.text||'')){form.querySelector('#scanRecognizedText').textContent='';form.querySelector('#scanRecognizedDetails').hidden=true;status('Versandetikett erkannt. Paketnummern und Versanddaten werden nicht als Produktdaten übernommen. Bitte das Etikett direkt am Produkt scannen.',form);return}const fields=reconcileLabel(result.text||'',result.barcodes);const productCodes=(Array.isArray(result.barcodes)?result.barcodes:[]).filter(code=>{if(!fields.serial)return true;const raw=string(typeof code==='string'?code:code?.rawValue).replace(/\s/g,'');if(raw===fields.serial.replace(/\s/g,''))return false;return !([1,2,4,'code_128','code_39','code_93'].includes(code?.format)&&/^\d{8,14}$/.test(raw))});const barcodeResult=parseBarcodes(productCodes);Object.assign(fields,barcodeResult.fields);if(barcodeResult.codes.length>1)delete fields.barcode;if(fields.barcode)clearPreviousScan(form,fields.barcode);const filled=applyFields(form,fields);const raw=form.querySelector('#scanRecognizedText');raw.textContent=string(result.text,10000);form.querySelector('#scanRecognizedDetails').hidden=!raw.textContent;const choices=form.querySelector('#scanCodeChoices');choices.innerHTML=barcodeResult.codes.length>1?`<p>Mehrere Produktcodes erkannt. Wähle den passenden:</p>${barcodeResult.codes.map(code=>`<button type="button" class="ghost-btn" data-action="scan-select-code" data-code="${code}">${code}</button>`).join('')}`:'';
    status(filled.length?'Erkannte Angaben übernommen. Bitte prüfen und markierte Lücken ergänzen.':barcodeResult.codes.length>1?'Bitte den passenden Produktcode wählen.':Array.isArray(result.barcodes)&&result.barcodes.length?'Code erkannt, aber keine sichere EAN/UPC oder Produktangabe. Produktbarcode näher scannen oder das Etikett lesen.':'Keine sicheren Produktangaben erkannt. Barcode näher scannen oder Etikett / Foto lesen.',form);
    if(fields.barcode&&form.elements.barcode.value===fields.barcode){if(validGtin(fields.barcode))lookup(fields.barcode,form);else status('Barcode übernommen. Dieser Code ist keine EAN/UPC; eine automatische Katalogsuche ist damit nicht möglich.',form)}
  }
  function start(){const form=document.getElementById('productForm');if(!form)return;cleanup();currentScan={id:uid('scan'),form};status('Live-Scanner wird geöffnet …',form);setButtons(form,true);if(global.PassPilotAndroid?.scanProduct){try{global.PassPilotAndroid.scanProduct(currentScan.id)}catch{setButtons(form,false);status('Live-Scanner konnte nicht geöffnet werden. Bitte die aktuelle Android-App installieren.',form)}}else startWebLive(currentScan)}
  function startLabel(){const form=document.getElementById('productForm');if(!form)return;cleanup();currentScan={id:uid('label'),form};status('Etikett-Live-Scanner wird geöffnet …',form);if(global.PassPilotAndroid?.scanProductLabel){setButtons(form,true);try{global.PassPilotAndroid.scanProductLabel(currentScan.id)}catch{setButtons(form,false);status('Etikett-Scanner konnte nicht geöffnet werden.',form)}}else{currentScan=null;status('Etikett-Live-Erkennung benötigt die Android-App ab 1.9. Alternativ Etikett / Foto lesen verwenden.',form)}}
  function startPhoto(){const form=document.getElementById('productForm');if(!form)return;cleanup();currentScan={id:uid('scan'),form};status('Etikettfoto auswählen oder aufnehmen …',form);if(global.PassPilotAndroid?.scanProductPhoto){setButtons(form,true);try{global.PassPilotAndroid.scanProductPhoto(currentScan.id)}catch{setButtons(form,false);status('Fotoauswahl konnte nicht geöffnet werden.',form)}}else form.querySelector('#productScanPhoto').click()}
  async function startWebLive(pending){const form=pending.form;
    if((!global.BarcodeDetector&&!global.PassPilotWebTools?.barcodeAvailable)||!navigator.mediaDevices?.getUserMedia){setButtons(form,false);status('Live-Scannen wird hier nicht unterstützt. Nutze die aktuelle Android-App oder die manuelle Eingabe.',form);return}
    const live={...pending,stream:null,video:form.querySelector('#webLiveVideo'),timer:null};currentWebScan=live;form.querySelector('#webLiveScanner').hidden=false;
    try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
      if(currentWebScan!==live||!document.contains(form)){stream.getTracks().forEach(track=>track.stop());return}live.stream=stream;live.video.srcObject=stream;await live.video.play();
      if(!global.BarcodeDetector&&global.PassPilotWebTools?.barcodeAvailable){status('Barcode in den Rahmen halten. Er wird automatisch übernommen.',form);const controls=await global.PassPilotWebTools.startLive(live.video,stream,codes=>{if(currentWebScan!==live)return;stopLive();receiveNativeResult(live.id,{status:'success',text:'',barcodes:codes});});if(currentWebScan===live)live.controls=controls;else controls.stop();return;}
      const formats=await BarcodeDetector.getSupportedFormats();if(!formats.length)throw Error('No barcode formats');const detector=new BarcodeDetector({formats});
      status('Barcode in den Rahmen halten. Er wird automatisch übernommen.',form);
      const tick=async()=>{if(currentWebScan!==live)return;if(live.video.readyState>=2){try{const codes=await detector.detect(live.video);if(currentWebScan!==live)return;if(codes.length){stopLive();receiveNativeResult(live.id,{status:'success',text:'',barcodes:codes.map(code=>({rawValue:code.rawValue,format:code.format}))});return}}catch{}}if(currentWebScan===live)live.timer=setTimeout(tick,250)};tick();
    }catch(error){if(currentWebScan!==live)return;stopLive();receiveNativeResult(live.id,{status:'error',message:error?.name==='NotAllowedError'?'Kamerazugriff wurde nicht erlaubt. Bitte in den Browser-Einstellungen freigeben.':'Live-Kamera konnte nicht geöffnet werden. Nutze die Android-App oder versuche es erneut.'})}
  }
  function cancelLive(){const pending=currentWebScan;stopLive();if(pending)receiveNativeResult(pending.id,{status:'cancelled',message:'Scan abgebrochen.'})}
  function searchWeb(){const form=document.getElementById('productForm');if(!form||!form.elements.scanOnline.checked)return;const code=form.elements.barcode.value;if(!validGtin(code))return;if(global.PassPilotAndroid?.searchBarcodeOnline)global.PassPilotAndroid.searchBarcodeOnline(code);else global.open('https://www.google.com/search?q='+code,'_blank','noopener,noreferrer')}
  async function photoChanged(file){if(!file)return;const form=document.getElementById('productForm');if(!form)return;if(global.PassPilotWebTools?.readCodeImage){currentScan={id:uid('scan'),form};const id=currentScan.id;status('Bild wird lokal gelesen …',form);try{receiveNativeResult(id,{status:'success',...await global.PassPilotWebTools.readCodeImage(file,message=>status(message,form))})}catch{receiveNativeResult(id,{status:'error',message:'Bild nicht lesbar. Bitte näher aufnehmen.'})}return;}if(!global.BarcodeDetector){status('In diesem Browser ist kein Bildscanner verfügbar. Nutze die Android-App oder die manuelle Texteingabe.',form);return}currentScan={id:uid('scan'),form};const id=currentScan.id;status('Barcode im Foto wird gelesen …',form);try{const formats=await BarcodeDetector.getSupportedFormats();const detector=new BarcodeDetector({formats});const image=await createImageBitmap(file);let codes;try{codes=await detector.detect(image)}finally{image.close()}receiveNativeResult(id,{status:'success',text:'',barcodes:codes.map(code=>({rawValue:code.rawValue,format:code.format}))})}catch{receiveNativeResult(id,{status:'error',message:'Barcode nicht lesbar. Bitte ein schärferes Foto wählen.'})}}
  function manual(){const form=document.getElementById('productForm');if(!form)return;const text=form.querySelector('#scanManualText').value;cleanup();currentScan={id:uid('scan'),form};receiveNativeResult(currentScan.id,{status:'success',text,barcodes:[{rawValue:text}]})}
  function chooseCode(code){const form=document.getElementById('productForm');if(!form||!validGtin(code))return;clearPreviousScan(form,code);form.elements.barcode.value=code;form.elements.barcode.dataset.scanAutofilled='true';refresh(form);lookup(code,form)}
  function inferModel(name){
    const family=name.match(/\b(?:EOS|Alpha|Galaxy|iPhone|iPad|MacBook|Pixel|Surface|ThinkPad|IdeaPad|Latitude|PlayStation|Xbox|GoPro|Hero)\s+[A-Za-z0-9][A-Za-z0-9+.-]*(?:\s+(?:Pro|Max|Plus|Ultra|Mini|Air))*/i);
    if(family&&/\d/.test(family[0]))return string(family[0],limits.model);
    const candidates=[...new Set((name.match(/\b[A-Za-z0-9][A-Za-z0-9._/-]{1,39}\b/g)||[]).filter(token=>/[A-Za-z]/.test(token)&&/\d/.test(token)&&!/^\d+(?:[.,]\d+)?(?:GB|TB|MB|Hz|kHz|MHz|GHz|W|V|mA|mAh|A|mm|cm|m|kg|g|ml|l|inch|in|h|pack|pcs|bit|K|D|G)$/i.test(token)&&!/^(?:USB|Bluetooth|WiFi|HDMI)\d/i.test(token)))];
    return candidates.length===1?string(candidates[0],limits.model):'';
  }
  function catalogFields(result){
    const input=result&&typeof result==='object'?result:{};const fields={};
    for(const name of ['name','brand','model'])if(typeof input[name]==='string'&&input[name].trim())fields[name]=string(input[name],limits[name]);
    if(!fields.brand&&fields.name)for(const brand of brands){const escaped=brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(new RegExp('(?:^|\\s)'+escaped+'(?:\\s|$)','i').test(fields.name)){fields.brand=brand;break}}
    if(!fields.model&&fields.name){const model=inferModel(fields.name);if(model)fields.model=model}
    if(!fields.name&&fields.brand&&fields.model)fields.name=string(fields.brand+' '+fields.model,limits.name);
    const category=inferCategory([fields.name,fields.model,string(input.categoryText,3000)].filter(Boolean).join(' '));
    const savedCategory=['ebike','camera','tool','instrument','appliance','electronics','other'].includes(input.category)?input.category:'';
    if(category||savedCategory||fields.name)fields.category=category||savedCategory||'other';
    return fields;
  }
  function cacheKey(code){return validGtin(code)?code.padStart(14,'0'):''}
  function cachedEntries(){try{const value=JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY)||'[]');return Array.isArray(value)?value.filter(entry=>entry&&validGtin(entry.code)&&typeof entry.savedAt==='number'&&entry.savedAt<=Date.now()+60000&&entry.savedAt>Date.now()-CACHE_DAYS*86400000&&entry.fields&&typeof entry.fields.name==='string').slice(-100):[]}catch{return []}}
  function cachedProduct(code){const entry=cachedEntries().find(entry=>cacheKey(entry.code)===cacheKey(code));return entry?{fields:catalogFields(entry.fields),source:string(entry.source,120)}:null}
  function cacheProduct(code,fields,source){if(!fields.name)return;const entries=cachedEntries().filter(entry=>cacheKey(entry.code)!==cacheKey(code));entries.push({code,fields:catalogFields(fields),source:string(source,120),savedAt:Date.now()});try{localStorage.setItem(CATALOG_CACHE_KEY,JSON.stringify(entries.slice(-100)))}catch{}}
  function receiveCatalogResult(requestId,result){
    const pending=currentLookup;
    if(!pending||pending.id!==requestId||result.code!==pending.code||!document.contains(pending.form)||pending.form.elements.barcode.value!==pending.code||!pending.form.elements.scanOnline.checked)return;
    const form=pending.form;
    if(result.status==='success'){
      const fields=catalogFields(result.fields);const filled=applyFields(form,fields);cacheProduct(pending.code,fields,result.source);global.PassPilotFacts?.preview(form);
      if(filled.length)status(`Produktinfos aus ${string(result.source,120)||'dem Katalog'} übernommen. Bitte prüfen. Weitere Angaben kannst du später ergänzen.`,form);
      else if(result.complete!==false)status('Keine zusätzlichen Angaben übernommen. Deine Eingaben bleiben erhalten.',form);
    }else if(result.complete!==false)status('Barcode erkannt. Keine Katalogdaten verfügbar. Du kannst im Internet suchen, das Etikett lesen oder markierte Angaben ergänzen.',form);
    if(result.complete!==false)currentLookup=null;
  }
  function catalogJson(data,code,kind){
    const matches=value=>typeof value==='string'&&validGtin(value)&&cacheKey(value)===cacheKey(code);
    if(kind==='upc'){
      const item=Array.isArray(data.items)?data.items.find(item=>item&&[item.ean,item.upc,item.gtin].some(matches)):null;
      return item?{name:item.title,brand:item.brand,model:item.model,categoryText:item.category}:null;
    }
    if(kind==='book'){
      const book=data['ISBN:'+code];
      return book&&Array.isArray(book.identifiers?.isbn_13)&&book.identifiers.isbn_13.some(matches)?{name:book.title,categoryText:'Books'}:null;
    }
    const product=data.status===1?data.product:null;
    return product&&matches(product.code||data.code)?{name:product.product_name_de||product.product_name,brand:product.brands,model:product.model,categoryText:JSON.stringify(product.categories_tags||[])}:null;
  }
  async function webLookup(code,id){
    let query=code;while(query.length>12&&query.startsWith('0'))query=query.slice(1);
    const catalogs=[['UPCitemdb',`https://api.upcitemdb.com/prod/trial/lookup?upc=${query}`,'upc'],...['openproductsfacts','openfoodfacts','openbeautyfacts'].map((catalog,index)=>[['Open Products Facts','Open Food Facts','Open Beauty Facts'][index],`https://world.${catalog}.org/api/v2/product/${query}.json?fields=product_name,product_name_de,brands,model,categories_tags,code`,'facts'])];
    if(/^97[89]/.test(query))catalogs.push(['Open Library',`https://openlibrary.org/api/books?bibkeys=ISBN:${query}&format=json&jscmd=data`,'book']);
    const fields={},sources=[];
    await Promise.allSettled(catalogs.map(async([source,url,kind])=>{
      const response=await fetch(url,{signal:AbortSignal.timeout(6000),credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)return;
      const input=catalogJson(await response.json(),query,kind);if(!input)return;const normalized=catalogFields(input);if(!normalized.name)return;
      const comparable=value=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
      for(const key of ['brand','model'])if(fields[key]&&normalized[key]&&comparable(fields[key])!==comparable(normalized[key]))return;
      let changed=false;
      for(const [key,value]of Object.entries(normalized))if(!fields[key]||(key==='category'&&fields[key]==='other'&&value!=='other')){fields[key]=value;changed=true}
      if(changed){sources.push(source);receiveCatalogResult(id,{status:'success',code,source:sources.join(', '),fields,complete:false})}
    }));
    receiveCatalogResult(id,{status:fields.name?'success':'unavailable',code,source:sources.join(', '),fields,complete:true});
  }
  function lookup(code,form=document.getElementById('productForm'),force=false){
    if(!form||!form.elements.scanOnline.checked||!validGtin(code)){if(form&&!form.elements.scanOnline.checked)status('Barcode erkannt. Online-Ergänzung ist ausgeschaltet.',form);return}
    const cached=!force?cachedProduct(code):null;
    if(cached){currentLookup=null;applyFields(form,cached.fields);status('Gespeicherte Kataloginfos übernommen. Bitte prüfen. Weitere Angaben kannst du später ergänzen.',form);return}
    currentLookup={id:uid('lookup'),form,code};status('Barcode erkannt. Produktname und weitere Angaben werden gesucht …',form);
    if(global.PassPilotAndroid?.lookupBarcode)global.PassPilotAndroid.lookupBarcode(code,currentLookup.id);else webLookup(code,currentLookup.id);
  }
  function handleInput(event){const form=event.target.closest('#productForm');if(!form)return;if(event.target.name){delete event.target.dataset.scanAutofilled;event.target.dataset.scanUserEdited='true'}refresh(form);if(event.target.name==='scanOnline'&&event.type==='change'){currentLookup=null;if(event.target.checked&&validGtin(form.elements.barcode.value))lookup(form.elements.barcode.value,form);else if(!event.target.checked)status('Online-Ergänzung ist ausgeschaltet.',form)}}
  global.PassPilotScan={handoffCode,validGtin,expandUpce,parseLabel,reconcileLabel,isShippingLabel,parseBarcodes,inferCategory,missingFields,catalogFields,catalogJson,inferModel,panel,initialize,refresh,start,startLabel,startPhoto,cancelLive,cleanup,searchWeb,photoChanged,manual,chooseCode,lookup,receiveNativeResult,receiveCatalogResult,handleInput};
  global.addEventListener('pagehide',cleanup);
})(window);
