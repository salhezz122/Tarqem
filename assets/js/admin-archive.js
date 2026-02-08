import { requireAdmin, doLogout } from "./auth-helpers.js";
import { db } from "./firebase.js";
import { toast, qs, fmtDate, setActiveNav } from "./ui.js";
import {
  collection, query, where, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

requireAdmin();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

const body = qs('#archTable tbody');

function esc(s=''){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }

async function load(){
  body.innerHTML = '<tr><td colspan="6">... تحميل</td></tr>';

  const filter = qs('#filterVerdict').value;
  const search = qs('#searchTitle').value.trim().toLowerCase();

  try{
    let qy = query(collection(db,'news'), where('status','==','archived'), orderBy('checkedAt','desc'));
    if(filter === 'true') qy = query(collection(db,'news'), where('status','==','archived'), where('verdict','==',true), orderBy('checkedAt','desc'));
    if(filter === 'false') qy = query(collection(db,'news'), where('status','==','archived'), where('verdict','==',false), orderBy('checkedAt','desc'));

    const snap = await getDocs(qy);
    if(snap.empty){
      body.innerHTML = '<tr><td colspan="6">الأرشيف فارغ.</td></tr>';
      return;
    }
    body.innerHTML = '';
    snap.forEach(d=>{
      const n = d.data();
      if(search && !(n.title||'').toLowerCase().includes(search)) return;
      const verdict = n.verdict === true ? '✅ صحيح' : (n.verdict === false ? '❌ خاطئ' : '—');
      const file = n.fileURL ? `<a href="${n.fileURL}" target="_blank" rel="noreferrer">فتح</a>` : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${esc(n.title||'—')}</b></td>
        <td>${esc(n.userName||'—')}<div class="muted small">${esc(n.userEmail||'')}</div></td>
        <td>${verdict}</td>
        <td>${fmtDate(n.checkedAt)}</td>
        <td>${esc(n.adminNote||'—')}</td>
        <td>${file}</td>
      `;
      body.appendChild(tr);
    });
    if(!body.children.length){
      body.innerHTML = '<tr><td colspan="6">لا نتائج مطابقة للفلتر/البحث.</td></tr>';
    }
  }catch(err){
    toast("خطأ: " + (err?.message||err));
    body.innerHTML = '<tr><td colspan="6">حدث خطأ.</td></tr>';
  }
}

qs('#applyBtn').addEventListener('click', load);
qs('#resetBtn').addEventListener('click', ()=>{
  qs('#filterVerdict').value = 'all';
  qs('#searchTitle').value = '';
  load();
});

await load();