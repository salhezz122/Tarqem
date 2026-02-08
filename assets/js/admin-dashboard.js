import { requireAdmin, doLogout } from "./auth-helpers.js";
import { db } from "./firebase.js";
import { toast, qs, fmtDate, badgeForStatus, setActiveNav } from "./ui.js";
import {
  collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

requireAdmin();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

const tbody = qs('#newsTable tbody');
const refreshBtn = qs('#refreshBtn');

let currentId = null;

async function loadKPIs(){
  try{
    const qPending = query(collection(db,'news'), where('status','==','pending'));
    const qArchTrue = query(collection(db,'news'), where('status','==','archived'), where('verdict','==',true));
    const qArchFalse = query(collection(db,'news'), where('status','==','archived'), where('verdict','==',false));
    const qUsers = query(collection(db,'users'), where('approved','==',true), where('disabled','==',false));
    const [a,b,c,d] = await Promise.all([getDocs(qPending), getDocs(qArchTrue), getDocs(qArchFalse), getDocs(qUsers)]);
    qs('#kpiPending').textContent = a.size;
    qs('#kpiTrue').textContent = b.size;
    qs('#kpiFalse').textContent = c.size;
    qs('#kpiUsers').textContent = d.size;
  }catch(e){}
}

async function loadPending(){
  tbody.innerHTML = '<tr><td colspan="5">... جاري التحميل</td></tr>';
  try{
    const qy = query(collection(db,'news'), where('status','==','pending'), orderBy('createdAt','desc'));
    const snap = await getDocs(qy);
    if(snap.empty){
      tbody.innerHTML = '<tr><td colspan="5">لا يوجد أخبار قيد المعاينة حالياً ✅</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    snap.forEach(docu=>{
      const n = docu.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${escapeHtml(n.title || '—')}</b><div class="muted small">${escapeHtml((n.body||'').slice(0,70))}${(n.body||'').length>70?'…':''}</div></td>
        <td>${escapeHtml(n.userName || '—')}<div class="muted small">${escapeHtml(n.userEmail||'')}</div></td>
        <td>${fmtDate(n.createdAt)}</td>
        <td>${badgeForStatus(n.status, n.verdict)}</td>
        <td><button class="btn btn-primary" data-id="${docu.id}">مراجعة</button></td>
      `;
      tbody.appendChild(tr);
    });
  }catch(err){
    tbody.innerHTML = '<tr><td colspan="5">حدث خطأ في التحميل</td></tr>';
    toast("خطأ: " + (err?.message||err));
  }
}

function escapeHtml(s=''){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }

tbody.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button[data-id]');
  if(!btn) return;
  const id = btn.dataset.id;
  currentId = id;
  await openReview(id);
});

const modal = qs('#reviewModal');
qs('#closeReview').addEventListener('click', ()=> modal.classList.remove('show'));
modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('show'); });

async function openReview(id){
  try{
    const snap = await getDoc(doc(db,'news', id));
    if(!snap.exists()){ toast('الخبر غير موجود'); return; }
    const n = snap.data();
    qs('#reviewMeta').textContent = `مرسل: ${n.userName||'—'} • ${n.userEmail||''} • ${fmtDate(n.createdAt)}`;
    qs('#rvTitle').value = n.title || '';
    qs('#rvBody').value = n.body || '';
    qs('#rvNote').value = n.adminNote || '';
    const box = qs('#rvAttachmentBox');
    if(n.fileURL){
      box.style.display = 'block';
      box.innerHTML = `📎 مرفق: <a href="${n.fileURL}" target="_blank" rel="noreferrer">فتح الملف</a>
        <div class="small">${escapeHtml(n.fileName||'')}</div>`;
    }else{
      box.style.display = 'none';
    }
    modal.classList.add('show');
  }catch(err){
    toast("خطأ: " + (err?.message||err));
  }
}

async function saveUpdate(extra={}){
  if(!currentId) return;
  const payload = {
    title: qs('#rvTitle').value.trim(),
    body: qs('#rvBody').value.trim(),
    adminNote: qs('#rvNote').value.trim(),
    ...extra
  };
  await updateDoc(doc(db,'news', currentId), payload);
}

qs('#saveOnly').addEventListener('click', async ()=>{
  try{
    await saveUpdate({updatedAt: serverTimestamp()});
    toast("تم حفظ التعديل ✅");
    modal.classList.remove('show');
    await loadKPIs();
    await loadPending();
  }catch(err){
    toast("تعذر الحفظ: " + (err?.message||err));
  }
});

qs('#markTrue').addEventListener('click', async ()=>{
  try{
    await saveUpdate({status:'archived', verdict:true, checkedAt: serverTimestamp(), updatedAt: serverTimestamp()});
    toast("تم اعتماد الخبر: صحيح ✅");
    modal.classList.remove('show');
    await loadKPIs();
    await loadPending();
  }catch(err){
    toast("تعذر الاعتماد: " + (err?.message||err));
  }
});

qs('#markFalse').addEventListener('click', async ()=>{
  try{
    await saveUpdate({status:'archived', verdict:false, checkedAt: serverTimestamp(), updatedAt: serverTimestamp()});
    toast("تم اعتماد الخبر: خاطئ ❌");
    modal.classList.remove('show');
    await loadKPIs();
    await loadPending();
  }catch(err){
    toast("تعذر الاعتماد: " + (err?.message||err));
  }
});

refreshBtn.addEventListener('click', async ()=>{
  await loadKPIs();
  await loadPending();
});

await loadKPIs();
await loadPending();