  // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deletDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDfelrhkfpkFl_VFIW47Zcs1gA-txTMlrs",
    authDomain: "my-memo7026.firebaseapp.com",
    projectId: "my-memo7026",
    storageBucket: "my-memo7026.firebasestorage.app",
    messagingSenderId: "122969511514",
    appId: "1:122969511514:web:2e1063072c8f5b5445aa63",
    measurementId: "G-2HJ5DFXBY8"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
	const loadLogs = async () => {
	const snapshot = await getDocs(collection(db, "logs"));

	logs = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	}));

	renderLogs();
};

loadLogs();
	// DOM要素の取得
	const postDate = document.getElementById("postDate");
	const postText = document.getElementById("postText");
	const imageInput = document.getElementById("imageInput");
	const imagePreviewContainer = document.getElementById("imagePreviewContainer");
	const imagePreview = document.getElementById("imagePreview");
	const removeImageBtn = document.getElementById("removeImageBtn");
	const tagInput = document.getElementById("tagInput");
	const moodSelect = document.getElementById("mood");
	const favoriteCheckbox = document.getElementById("favorite");
	const saveButton = document.getElementById("saveButton");
	const searchInput = document.getElementById("searchInput");
	const postList = document.getElementById("postList");

	// 一時保存用画像データ(Base64)
	let currentBase64Image = "";

	// ローカルストレージからデータ取得（なければ空配列）
	let logs = [];

	// ------------------------------------
	// 本日の日付文字列取得 (YYYY-MM-DD フォーマット)
	// ------------------------------------
	const getTodayYMD = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// 初期表示時に日付ピッカーへ今日の日付を設定
	if (postDate) {
		postDate.value = getTodayYMD();
	}

	// ------------------------------------
	// 画像ファイル選択＆圧縮・プレビュー処理
	// ------------------------------------
	if (imageInput) {
		imageInput.addEventListener("change", (e) => {
			const file = e.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				const img = new Image();
				img.onload = () => {
					// 容量節約のため最大幅/高さを800pxに自動リサイズ
					const canvas = document.createElement("canvas");
					const maxDimension = 600;
					let width = img.width;
					let height = img.height;

					if (width > height) {
						if (width > maxDimension) {
							height = Math.round((height * maxDimension) / width);
							width = maxDimension;
						}
					} else {
						if (height > maxDimension) {
							width = Math.round((width * maxDimension) / height);
							height = maxDimension;
						}
					}

					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, width, height);

					currentBase64Image = canvas.toDataURL("image/jpeg", 0.5);
					if (imagePreview) imagePreview.src = currentBase64Image;
					if (imagePreviewContainer) imagePreviewContainer.style.display = "inline-block";
				};
				img.src = event.target.result;
			};
			reader.readAsDataURL(file);
		});
	}

	// プレビュー画像の取り消し
	if (removeImageBtn) {
		removeImageBtn.addEventListener("click", () => {
			currentBase64Image = "";
			if (imageInput) imageInput.value = "";
			if (imagePreview) imagePreview.src = "";
			if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
		});
	}

	// ------------------------------------
	// データの保存
	// ------------------------------------
	const saveLogs = () => {
		try {
			localStorage.setItem("love_logs", JSON.stringify(logs));
		} catch (error) {
			alert("保存容量の上限に達しました。不要な思い出や画像を整理してください。");
		}
	};

	// ------------------------------------
// バックアップ書き出し
// ------------------------------------
const exportButton = document.getElementById("exportButton");

if (exportButton) {
	exportButton.addEventListener("click", () => {
		const data = localStorage.getItem("love_logs");

		if (!data) {
			alert("バックアップするデータがありません。");
			return;
		}

		const blob = new Blob([data], {
			type: "application/json"
		});

		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = `love_log_backup_${new Date().toISOString().slice(0,10)}.json`;
		a.click();

		URL.revokeObjectURL(url);
	});
}

// ------------------------------------
// バックアップ復元
// ------------------------------------
const importButton = document.getElementById("importButton");
const importFile = document.getElementById("importFile");

if (importButton) {
	importButton.addEventListener("click", () => {

		if (!importFile.files.length) {
			alert("バックアップファイルを選択してください。");
			return;
		}

		const reader = new FileReader();

		reader.onload = (e) => {

			try {

				const importedLogs = JSON.parse(e.target.result);

				if (!Array.isArray(importedLogs)) {
					alert("バックアップファイルではありません。");
					return;
				}

				if (!confirm("現在のデータを上書きして復元しますか？")) {
					return;
				}

				localStorage.setItem(
					"love_logs",
					JSON.stringify(importedLogs)
				);

				alert("復元が完了しました！");

				location.reload();

			} catch {

				alert("ファイルを読み込めませんでした。");

			}

		};

		reader.readAsText(importFile.files[0]);

	});
}

	// ------------------------------------
	// 投稿カードの描画（思い出一覧の更新）
	// ------------------------------------
	const renderLogs = (filterKeyword = "") => {
		if (!postList) return;
		postList.innerHTML = "";

		// 検索キーワードでフィルタリング (本文またはタグに一致)
		const keyword = filterKeyword.trim().toLowerCase();
		const filteredLogs = logs.filter((log) => {
			if (!keyword) return true;
			const textMatch = log.text ? log.text.toLowerCase().includes(keyword) : false;
			const tagMatch = log.tags ? log.tags.some((tag) => tag.toLowerCase().includes(keyword)) : false;
			return textMatch || tagMatch;
		});

		if (filteredLogs.length === 0) {
			postList.innerHTML = `<p class="empty-message">${
				filterKeyword
					? "該当する思い出が見つかりませんでした 🔍"
					: "まだ思い出がありません。<br>今日の出来事を書き残してみましょう💕"
			}</p>`;
			return;
		}

		// 投稿日付が新しい順（日付降順）にソートして表示
		filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

		filteredLogs.forEach((log) => {
			const card = document.createElement("div");
			card.className = `post-card ${log.favorite ? "is-favorite" : ""}`;

			// タグHTMLの生成
			const tagsHTML = (log.tags || [])
				.map((tag) => `<span class="tag-item">#${tag}</span>`)
				.join("");

			// 画像HTMLの生成（思い出一覧に画像を表示）
			const imageHTML = log.image
				? `<div class="post-image-container"><img src="${log.image}" class="post-image" alt="思い出の写真"></div>`
				: "";

			card.innerHTML = `
				<div class="post-header">
					<span class="post-date">📅 ${log.date}</span>
					<div class="post-header-actions">
						<button class="fav-star-btn ${log.favorite ? "active" : ""}" data-id="${log.id}" title="お気に入り">⭐</button>
					</div>
				</div>
				<div class="post-body">${escapeHTML(log.text || "")}</div>
				${imageHTML}
				<div class="post-footer">
					<div class="tag-list">${tagsHTML}</div>
					<div class="post-meta">
						<span class="mood-display">${log.mood || "🥰"}</span>
						<button class="delete-btn" data-id="${log.id}">🗑️ 削除</button>
					</div>
				</div>
			`;

			postList.appendChild(card);
		});
	};

	// ------------------------------------
	// HTMLエスケープ処理（セキュリティ対策）
	// ------------------------------------
	const escapeHTML = (str) => {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	// ------------------------------------
	// 新規投稿イベント
	// ------------------------------------
	if (saveButton) {
		saveButton.addEventListener("click", async () => {
			const text = postText ? postText.value.trim() : "";

			if (!text && !currentBase64Image) {
				alert("「今日の出来事」または「写真」を追加してください💕");
				return;
			}

			// 日付が未選択の場合は今日の日付をセット
			const rawDate = postDate && postDate.value ? postDate.value : getTodayYMD();
			const selectedDate = rawDate.replace(/-/g, "/");

			// カンマ区切りのタグを配列化
			const rawTags = tagInput ? tagInput.value.split(/[,、]/) : [];
			const tags = rawTags.map((t) => t.trim()).filter((t) => t.length > 0);

			const newLog = {
				date: selectedDate,
				text: text,
				image: currentBase64Image,
				tags: tags,
				mood: moodSelect ? moodSelect.value : "🥰",
				favorite: favoriteCheckbox ? favoriteCheckbox.checked : false,
			};

			// Firestoreへ保存
			await addDoc(collection(db, "logs"), newLog);
			newlog.id = docRef.id;
			
			// 画面更新
			logs.unshift(newLog);
			renderLogs(searchInput ? searchInput.value : "");

			// フォームリセット
			if (postDate) postDate.value = getTodayYMD();
			if (postText) postText.value = "";
			if (imageInput) imageInput.value = "";
			currentBase64Image = "";
			if (imagePreview) imagePreview.src = "";
			if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
			if (tagInput) tagInput.value = "";
			if (moodSelect) moodSelect.selectedIndex = 0;
			if (favoriteCheckbox) favoriteCheckbox.checked = false;

			// リスト再描画
			renderLogs(searchInput ? searchInput.value : "");
		});
	}

	// ------------------------------------
	// リスト内のイベント（削除 & お気に入りトグル）
	// ------------------------------------
	if (postList) {
		postList.addEventListener("click", async (e) => {
			const target = e.target;

			// 削除ボタンクリック
			if (target.classList.contains("delete-btn")) {
				const id = target.dataset.id;
				if (confirm("この思い出を削除してもよろしいですか？")) {
					await deleteDoc(doc(db, "logs", id));
					logs = logs.filter((log) => log.id !== id);
					renderLogs(searchInput ? searchInput.value : "");
				}
			}

			// お気に入り⭐ボタンクリック
			if (target.classList.contains("fav-star-btn")) {
				const id = target.dataset.id;
				const targetLog = logs.find((log) => log.id === id);
				if (targetLog) {
					targetLog.favorite = !targetLog.favorite;
					await updateDoc(doc(db, "logs", id), {
						favorite: targetLog.favorite
					});
					renderLogs(searchInput ? searchInput.value : "");
				}
			}
		});
	}

	// ------------------------------------
	// リアルタイム検索イベント
	// ------------------------------------
	if (searchInput) {
		searchInput.addEventListener("input", (e) => {
			renderLogs(e.target.value);
		});
	}

	// 初期描画
	renderLogs();
});
