(function(){
  const cfg = window.APP_CONFIG||{};
  const LS_KEY = 'scb_leads_v1';
  function saveLocal(rows){ try{ localStorage.setItem(LS_KEY, JSON.stringify(rows)); }catch(e){} }
  function loadLocal(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch(e){ return []; } }
  function recordLocal(payload){ const arr = loadLocal(); arr.unshift(payload); saveLocal(arr); }
  async function recordRemote(payload){
    const url = (cfg.LEADS_ENDPOINT||'').trim();
    if(!url) return {ok:false, reason:'NO_ENDPOINT'};
    try{
      const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ secret: cfg.LEADS_SECRET||'', data: payload })
      });
      if(!res.ok) throw new Error('HTTP '+res.status);
      return {ok:true};
    }catch(err){ console.warn(err); return {ok:false, reason:String(err)}; }
  }
  function wamsg(payload){
    const number = (cfg.WHATSAPP_NUMBER||'').replace(/[^\d]/g,'');
    const t = (cfg.WHATSAPP_GREETING||'').replace('{name}', payload.name||'').replace('{amount}', payload.amount||'').replace('{country}', payload.country||'');
    const text = encodeURIComponent(t || 'Hello, I just submitted a case.');
    return number ? `https://wa.me/${number}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
  }
  function handleSubmit(formId){
    const form = document.getElementById(formId);
    if(!form) return;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const payload = {
        ts: new Date().toISOString(),
        name: (data.name||'').trim(),
        email: (data.email||'').trim(),
        phone: (data.phone||'').trim(),
        country: (data.country||'').trim(),
        amount: (data.amount||'').trim(),
        desc: (data.desc||'').trim(),
        source: location.href
      };
      recordLocal(payload);
      await recordRemote(payload);
      location.href = wamsg(payload);
    });
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
    handleSubmit('lead-form'); handleSubmit('cta-form');
  });
  window.__LEADS_LOCAL__ = {load: loadLocal, save: saveLocal};
})();