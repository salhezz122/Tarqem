import { requireAdmin, doLogout } from "./auth-helpers.js";
import { db } from "./firebase.js";
import { toast, qs, fmtDate, setActiveNav } from "./ui.js";
import {
  collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

requireAdmin();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

const pBody = qs('#pendingTable tbody');
const aBody = qs('#activeTable tbody');

async function loadUsers(){
  pBody.innerHTML = '<tr><td colspan="5">... تحميل</td></tr>';
  aBody.innerHTML = '<tr><td colspan="5">... تحميل</td></tr>';

  const pendingQ = query(collection(db,'users'), where('approved','==',false), where('disabled','==',false), orderBy('createdAt','desc'));
  const activeQ = query(collection(db,'users'), where('approved','==',true), orderBy('createdAt','desc'));

  try{
    const [ps, as] = await Promise.all([getDocs(pendingQ), getDocs(activeQ)]);

    // pending
    if(ps.empty){
      pBody.innerHTML = '<tr><td colspan="5">لا يوجد طلبات تسجيل حالياً ✅</td></tr>';
    }else{
      pBody.innerHTML = '';
      ps.forEach(d=>{
        const u = d.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${esc(u.name||'—')}</b></td>
          <td>${esc(u.dept||'—')}</td>
          <td>${esc(u.email||'—')}</td>
          <td>${fmtDate(u.createdAt)}</td>
          <td style="display:flex; gap:8px; flex-wrap:wrap">
            <button class="btn btn-success" data-act="approve" data-id="${d.id}">موافقة</button>
            <button class="btn btn-danger" data-act="deny" data-id="${d.id}">رفض</button>
          </td>
        `;
        pBody.appendChild(tr);
      });
    }

    // active
    if(as.empty){
      aBody.innerHTML = '<tr><td colspan="5">لا يوجد مستخدمون.</td></tr>';
    }else{
      aBody.innerHTML = '';
      as.forEach(d=>{
        const u = d.data();
        const status = u.disabled ? '<span class="badge badge-false">معطّل</span>' : '<span class="badge badge-true">نشط</span>';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${esc(u.name||'—')}</b></td>
          <td>${esc(u.dept||'—')}</td>
          <td>${esc(u.email||'—')}</td>
          <td>${status}</td>
          <td style="display:flex; gap:8px; flex-wrap:wrap">
            <button class="btn btn-ghost" data-act="toggle" data-id="${d.id}">${u.disabled?'تفعيل':'تعطيل'}</button>
            <button class="btn btn-danger" data-act="deldata" data-id="${d.id}">حذف بياناته</button>
          </td>
        `;
        aBody.appendChild(tr);
      });
    }

  }catch(err){
    toast("خطأ في تحميل المستخدمين: " + (err?.message||err));
  }
}

function esc(s=''){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }

pBody.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button[data-act]');
  if(!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  try{
    if(act === 'approve'){
      await updateDoc(doc(db,'users',id), {approved:true});
      toast("تمت الموافقة ✅");
    }
    if(act === 'deny'){
      // we delete only the user profile doc (Auth account still exists; user can't login because doc missing/disabled)
      await deleteDoc(doc(db,'users',id));
      toast("تم الرفض وحذف ملف المستخدم.");
    }
    await loadUsers();
  }catch(err){
    toast("تعذر تنفيذ العملية: " + (err?.message||err));
  }
});

aBody.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button[data-act]');
  if(!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;

  try{
    if(act === 'toggle'){
      const row = btn.closest('tr');
      const isDisabled = btn.textContent.includes('تفعيل');
      await updateDoc(doc(db,'users',id), {disabled: !isDisabled});
      toast(isDisabled ? "تم تفعيل الحساب ✅" : "تم تعطيل الحساب ⛔");
    }

    if(act === 'deldata'){
      if(!confirm("متأكد؟ سيحذف هذا أخبار المستخدم من قاعدة البيانات (لا يحذف حساب Auth).")) return;
      const batch = writeBatch(db);
      // delete user doc
      batch.delete(doc(db,'users',id));
      // delete their news
      const qNews = query(collection(db,'news'), where('userId','==',id));
      const snap = await getDocs(qNews);
      snap.forEach(n=> batch.delete(doc(db,'news', n.id)));
      await batch.commit();
      toast("تم حذف بيانات المستخدم ✅");
    }

    await loadUsers();
  }catch(err){
    toast("خطأ: " + (err?.message||err));
  }
});

qs('#refreshBtn').addEventListener('click', loadUsers);

await loadUsers();