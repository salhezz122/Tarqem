import { auth, db } from "./firebase.js";
import { toast, qs } from "./ui.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const ADMIN_PASSWORD = "SS4625ss";

const loginForm = qs('#loginForm');
const registerForm = qs('#registerForm');

function setTab(tab){
  if(tab === 'login'){
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  }else{
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
  // button styles
  [...qs('#authTabs').querySelectorAll('button')].forEach(b=>{
    const active = b.dataset.tab === tab;
    b.className = 'btn ' + (active ? 'btn-primary' : 'btn-ghost');
  });
}

qs('#authTabs').addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-tab]');
  if(!btn) return;
  setTab(btn.dataset.tab);
});
qs('#toRegister').addEventListener('click', ()=> setTab('register'));
qs('#toLogin').addEventListener('click', ()=> setTab('login'));

loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = qs('#loginEmail').value.trim();
  const pass = qs('#loginPass').value;

  try{
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    // ensure approved
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const data = snap.exists() ? snap.data() : null;

    if(!data || data.disabled === true){
      await signOut(auth);
      toast("حسابك غير متاح حالياً.");
      return;
    }

    if(data.approved !== true){
      await signOut(auth);
      toast("بانتظار موافقة الأدمن على حسابك.");
      return;
    }

    location.href = "user/home.html";
  }catch(err){
    toast("خطأ في الدخول: " + (err?.message || err));
  }
});

registerForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = qs('#regName').value.trim();
  const dept = qs('#regDept').value.trim();
  const email = qs('#regEmail').value.trim();
  const pass = qs('#regPass').value;

  try{
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      dept,
      email,
      role: "user",
      approved: false,
      disabled: false,
      createdAt: serverTimestamp()
    });
    await signOut(auth);
    setTab('login');
    toast("تم إنشاء الحساب ✅ بانتظار موافقة الأدمن.");
  }catch(err){
    toast("تعذر إنشاء الحساب: " + (err?.message || err));
  }
});

// Admin modal
const modal = qs('#adminModal');
qs('#btnAdmin').addEventListener('click', ()=> modal.classList.add('show'));
qs('#closeAdmin').addEventListener('click', ()=> modal.classList.remove('show'));
modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('show'); });

qs('#adminLogin').addEventListener('click', ()=>{
  const pass = qs('#adminPass').value;
  if(pass === ADMIN_PASSWORD){
    sessionStorage.setItem('isAdmin', '1');
    location.href = "admin/dashboard.html";
  }else{
    toast("كلمة مرور الأدمن غير صحيحة.");
  }
});

setTab('login');