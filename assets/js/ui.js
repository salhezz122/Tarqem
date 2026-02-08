export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

export function toast(msg, ms=3200){
  const el = qs('#toast');
  if(!el){ alert(msg); return; }
  el.textContent = msg;
  el.classList.add('show');
  window.clearTimeout(el._t);
  el._t = window.setTimeout(()=> el.classList.remove('show'), ms);
}

export function setActiveNav(){
  const path = location.pathname.split('/').pop();
  qsa('.nav a').forEach(a=>{
    const href = a.getAttribute('href') || '';
    a.classList.toggle('active', href.endsWith(path));
  });
}

export function fmtDate(ts){
  try{
    const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
    return d.toLocaleString();
  }catch(e){ return '-'; }
}

export function badgeForStatus(status, verdict){
  if(status === 'pending') return '<span class="badge badge-pending">⏳ قيد المعاينة</span>';
  if(status === 'archived'){
    if(verdict === true) return '<span class="badge badge-true">✅ صحيح</span>';
    if(verdict === false) return '<span class="badge badge-false">❌ خاطئ</span>';
    return '<span class="badge">📦 مؤرشف</span>';
  }
  return '<span class="badge">—</span>';
}