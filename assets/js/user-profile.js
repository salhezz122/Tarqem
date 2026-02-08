import { auth, db } from "./firebase.js";
import { requireUser, doLogout, COMPANY_NAME } from "./auth-helpers.js";
import { qs, fmtDate, setActiveNav } from "./ui.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

requireUser();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

onAuthStateChanged(auth, async (user)=>{
  if(!user) return;
  const snap = await getDoc(doc(db,'users', user.uid));
  const u = snap.exists() ? snap.data() : {};
  qs('#whoami').textContent = `${COMPANY_NAME} • ${u.name||user.email}`;
  qs('#profileBox').innerHTML = `
    <div><b>الاسم:</b> ${u.name || '—'}</div>
    <div><b>القسم:</b> ${u.dept || '—'}</div>
    <div><b>الإيميل:</b> ${u.email || user.email || '—'}</div>
    <div><b>تاريخ الإنشاء:</b> ${fmtDate(u.createdAt)}</div>
    <div><b>حالة الموافقة:</b> ${u.approved ? '✅ مُعتمد' : '⏳ بانتظار'}</div>
  `;
});