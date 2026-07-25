import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  // あなたのFirebase設定
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function importLogs() {

  const response = await fetch(
    "./love_log_backup_2026-07-25.json"
  );

  const logs = await response.json();


  for (const log of logs) {

    await addDoc(
      collection(db, "logs"),
      log
    );

    console.log("追加しました:", log);
  }


  console.log("移行完了！");
}


importLogs();
