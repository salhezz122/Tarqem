import { auth, db } from "./firebase.js";
import { requireUser, doLogout, COMPANY_NAME } from "./auth-helpers.js";
import { toast, qs, fmtDate, badgeForStatus, setActiveNav } from "./ui.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

requireUser();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

const tbody = qs('#myTable tbody');

function esc(s=''){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }

async function load(){
  const user = auth.currentUser;
  if(!user) return;

  tbody.innerHTML = '<tr><td colspan="5">... تحميل</td></tr>';
  try{
    const qy = query(collection(db,'news'),
      where('userId','==', user.uid),
      orderBy('createdAt','desc')
    );
    const snap = await getDocs(qy);
    if(snap.empty){
      tbody.innerHTML = '<tr><td colspan="5">لا يوجد أخبار مرسلة بعد.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    snap.forEach(d=>{
      const n = d.data();
      const file = n.fileURL ? `<a href="${n.fileURL}" target="_blank" rel="noreferrer">فتح</a>` : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${esc(n.title||'—')}</b><div class="muted small">${esc((n.body||'').slice(0,60))}${(n.body||'').length>60?'…':''}</div></td>
        <td>${fmtDate(n.createdAt)}</td>
        <td>${badgeForStatus(n.status, n.verdict)}</td>
        <td>${esc(n.adminNote||'—')}</td>
        <td>${file}</td>
      `;
      tbody.appendChild(tr);
    });
  }catch(err){
    toast("خطأ: " + (err?.message||err));
    tbody.innerHTML = '<tr><td colspan="5">حدث خطأ.</td></tr>';
  }
}

qs('#refreshBtn').addEventListener('click', load);

onAuthStateChanged(auth, async (user)=>{
  if(!user) return;
  const snap = await getDoc(doc(db,'users', user.uid));
  const u = snap.exists() ? snap.data() : {};
  qs('#whoami').textContent = `${COMPANY_NAME} • ${u.name||user.email}`;
  await load();
});