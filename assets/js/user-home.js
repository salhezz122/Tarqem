import { auth, db } from "./firebase.js";
import { requireUser, doLogout, COMPANY_NAME } from "./auth-helpers.js";
import { qs, setActiveNav } from "./ui.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

requireUser();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

onAuthStateChanged(auth, async (user)=>{
  if(!user) return;
  const snap = await getDoc(doc(db,'users', user.uid));
  const u = snap.exists() ? snap.data() : {};
  qs('#whoami').textContent = `${COMPANY_NAME} • ${u.name||user.email}`;
  qs('#hello').textContent = `أهلاً ${u.name || ''} 👋`;

  // KPIs (user-specific)
  const qPending = query(collection(db,'news'), where('userId','==', user.uid), where('status','==','pending'));
  const qTrue = query(collection(db,'news'), where('userId','==', user.uid), where('status','==','archived'), where('verdict','==', true));
  const qFalse = query(collection(db,'news'), where('userId','==', user.uid), where('status','==','archived'), where('verdict','==', false));
  const [a,b,c] = await Promise.all([getDocs(qPending), getDocs(qTrue), getDocs(qFalse)]);
  qs('#kPending').textContent = a.size;
  qs('#kTrue').textContent = b.size;
  qs('#kFalse').textContent = c.size;
});