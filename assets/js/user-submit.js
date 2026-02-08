import { auth, db, storage } from "./firebase.js";
import { requireUser, doLogout, COMPANY_NAME } from "./auth-helpers.js";
import { toast, qs, setActiveNav } from "./ui.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  collection, addDoc, serverTimestamp, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  ref, uploadBytesResumable, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

requireUser();
setActiveNav();
qs('#logoutBtn').addEventListener('click', doLogout);

let me = null;

onAuthStateChanged(auth, async (user)=>{
  if(!user) return;
  const snap = await getDoc(doc(db,'users', user.uid));
  me = snap.exists() ? snap.data() : {};
  qs('#whoami').textContent = `${COMPANY_NAME} • ${me.name||user.email}`;
});

qs('#submitForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const user = auth.currentUser;
  if(!user){ toast("يجب تسجيل الدخول"); return; }

  const title = qs('#title').value.trim();
  const body = qs('#body').value.trim();
  const file = qs('#file').files[0] || null;

  qs('#sendBtn').disabled = true;
  qs('#progress').textContent = "جاري الإرسال...";

  try{
    // create doc first
    const docRef = await addDoc(collection(db,'news'), {
      title, body,
      status: 'pending',
      verdict: null,
      adminNote: '',
      userId: user.uid,
      userName: me?.name || '',
      userEmail: user.email || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      fileURL: '',
      fileName: ''
    });

    if(file){
      const storageRef = ref(storage, `submissions/${user.uid}/${docRef.id}/${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject)=>{
        task.on('state_changed', (snap)=>{
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          qs('#progress').textContent = `رفع الملف: ${pct}%`;
        }, reject, resolve);
      });
      const url = await getDownloadURL(task.snapshot.ref);
      await updateDoc(doc(db,'news', docRef.id), { fileURL: url, fileName: file.name, updatedAt: serverTimestamp() });
    }

    qs('#submitForm').reset();
    toast("تم إرسال الخبر للأدمن ✅");
    qs('#progress').textContent = "";
  }catch(err){
    toast("تعذر الإرسال: " + (err?.message||err));
  }finally{
    qs('#sendBtn').disabled = false;
  }
});