import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { toast } from "./ui.js";

export const COMPANY_NAME = "AmmanVerify";

export function requireAdmin(){
  const ok = sessionStorage.getItem('isAdmin') === '1';
  if(!ok){
    location.replace('../index.html');
  }
}

export function requireUser(){
  onAuthStateChanged(auth, async (user)=>{
    if(!user){
      location.replace('../index.html');
      return;
    }
    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.exists() ? snap.data() : null;

    if(!data || data.disabled === true){
      await signOut(auth);
      toast("حسابك غير متاح حالياً. تواصل مع الأدمن.");
      location.replace('../index.html');
      return;
    }

    if(data.approved !== true){
      await signOut(auth);
      toast("تم إنشاء الحساب. بانتظار موافقة الأدمن قبل تسجيل الدخول.");
      location.replace('../index.html');
      return;
    }
  });
}

export async function doLogout(){
  sessionStorage.removeItem('isAdmin');
  try{ await signOut(auth); }catch(e){}
  location.replace('../index.html');
}