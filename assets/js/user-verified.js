import { auth, db } from "./firebase.js";
import { requireUser, doLogout, COMPANY_NAME } from "./auth-helpers.js";
import { toast, qs, fmtDate, setActiveNav } from "./ui.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

requireUser();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

const tbody = qs('#verTable tbody');
let mode = 'all';

function esc(s=''){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }

function setMode(m){
  mode = m;
  qs('#tabAll').className = 'btn ' + (m==='all'?'btn-primary':'btn-ghost');
  qs('#tabMine').className = 'btn ' + (m==='mine'?'btn-primary':'btn-ghost');
  load();
}

async function load(){
  const user = auth.currentUser;
  if(!user) return;
  tbody.innerHTML = '<tr><td colspan="5">... تحميل</td></tr>';

  try{
    let qy = query(collection(db,'news'),
      where('status','==','archived'),
      where('verdict','==', true),
      orderBy('checkedAt','desc')
    );
    if(mode === 'mine'){
      qy = query(collection(db,'news'),
        where('status','==','archived'),
        where('verdict','==', true),
        where('userId','==', user.uid),
        orderBy('checkedAt','desc')
      );
    }
    const snap = await getDocs(qy);
    if(snap.empty){
      tbody.innerHTML = '<tr><td colspan="5">لا يوجد أخبار صحيحة حالياً.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    snap.forEach(d=>{
      const n = d.data();
      const file = n.fileURL ? `<a href="${n.fileURL}" target="_blank" rel="noreferrer">فتح</a>` : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${esc(n.title||'—')}</b><div class="muted small">${esc((n.body||'').slice(0,60))}${(n.body||'').length>60?'…':''}</div></td>
        <td>${esc(n.userName||'—')}</td>
        <td>${fmtDate(n.checkedAt)}</td>
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

qs('#tabAll').addEventListener('click', ()=> setMode('all'));
qs('#tabMine').addEventListener('click', ()=> setMode('mine'));

onAuthStateChanged(auth, async (user)=>{
  if(!user) return;
  const snap = await getDoc(doc(db,'users', user.uid));
  const u = snap.exists() ? snap.data() : {};
  qs('#whoami').textContent = `${COMPANY_NAME} • ${u.name||user.email}`;
  setMode('all');
});