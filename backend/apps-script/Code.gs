/**
 * Google Apps Script backend to store leads into a Google Sheet.
 * Steps:
 * 1) Create a Google Sheet with header: ts,name,email,phone,country,amount,desc,source
 * 2) Extensions → Apps Script: paste this code.
 * 3) Set SHEET_ID and SECRET; Deploy → New deployment → Web app; Exec as you; Who has access: anyone. Copy the /exec URL.
 * 4) Put the /exec URL into front-end config.js (LEADS_ENDPOINT) with same SECRET.
 */
const SHEET_ID = 'PUT_YOUR_SHEET_ID_HERE';
const SECRET = 'changeme';

function sheet(){ return SpreadsheetApp.openById(SHEET_ID).getActiveSheet(); }

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents);
    if((body.secret||'') !== SECRET) return json_({ok:false,error:'BAD_SECRET'});
    const d = body.data||{};
    sheet().appendRow([d.ts||new Date().toISOString(), d.name||'', d.email||'', d.phone||'', d.country||'', d.amount||'', d.desc||'', d.source||'']);
    return json_({ok:true});
  }catch(err){ return json_({ok:false,error:String(err)}); }
}
function doGet(e){
  const mode = (e.parameter.mode||'').toLowerCase();
  const secret = e.parameter.secret||'';
  if(secret !== SECRET) return json_({ok:false,error:'BAD_SECRET'});
  if(mode === 'list'){
    const values = sheet().getDataRange().getValues();
    const head = values.shift() || ['ts','name','email','phone','country','amount','desc','source'];
    const idx = {}; head.forEach((h,i)=>idx[h]=i);
    const rows = values.map(r=>({
      ts:r[idx.ts]||'', name:r[idx.name]||'', email:r[idx.email]||'', phone:r[idx.phone]||'',
      country:r[idx.country]||'', amount:r[idx.amount]||'', desc:r[idx.desc]||'', source:r[idx.source]||''
    }));
    return json_({ok:true, rows});
  }
  return json_({ok:true, ping:'ok'});
}
function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
