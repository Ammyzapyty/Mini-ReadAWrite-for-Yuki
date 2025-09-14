// -----------------------------
// ข้อมูลตัวละคร
// -----------------------------
const characters = {
  "刃": { avatar: "https://i.pinimg.com/736x/29/f8/01/29f8017c4aa1f99f3ab1da8e80a36921.jpg" },
  "k": { avatar: "https://i.pinimg.com/736x/ae/b2/7e/aeb27e52a25d88ffce816317e537485f.jpg" },
  "sun": { avatar: "https://i.pinimg.com/736x/c0/64/51/c064519e007178cf1dead7608882b9ed.jpg" },
  "h": { avatar: "https://i.pinimg.com/1200x/d8/57/4e/d8574e852d4c2136d94bf623ca28136d.jpg" },
  "ten": { avatar: "https://i.pinimg.com/736x/60/23/49/602349979dd51f0fda603b705168d06d.jpg" },
  "ワサン": { avatar: "https://i.pinimg.com/1200x/82/26/81/822681859232799c936399ee8ae80cce.jpg" }
};

// -----------------------------
// ตัวแปรเก็บสถานะเรื่อง
// -----------------------------
let story = [];
let currentIndex = 0;
let typingTimeout = null;
let typingTextDiv = null;

// -----------------------------
// อ้างอิง element
// -----------------------------
const chatContainer = document.getElementById("chat-container");
const nextBtn = document.getElementById("next-btn");
const chapterTitleDiv = document.getElementById("chapter-title");
const backBtn = document.getElementById("back-btn");
const readAllBtn = document.getElementById("read-all-btn");

// -----------------------------
// รายการ chapters
// -----------------------------
const chapters = [
  "stories/chapter1.json",
  "stories/chapter2.json",
  "stories/chapter3.json"
];

// -----------------------------
// โหลดตอนที่เลือก
// -----------------------------
let selectedChapter = localStorage.getItem("selectedChapter") || chapters[0];
let chapterIndex = chapters.indexOf(selectedChapter);
chapterTitleDiv.textContent = `チャプター ${chapterIndex + 1}`;

// -----------------------------
// ปุ่มกลับหน้าหลัก
// -----------------------------
backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// -----------------------------
// โหลด JSON ตอน
// -----------------------------
fetch(selectedChapter)
  .then(res => res.json())
  .then(data => {
    story = data;

    // โหลด progress ตอนเริ่มต้น
    const savedProgress = localStorage.getItem(`chapterProgress_${selectedChapter}`);
    if (savedProgress) {
      currentIndex = parseInt(savedProgress, 10);
      for (let i = 0; i < currentIndex; i++) {
        addMessage({ ...story[i], typing: false });
      }
    }
  })
  .catch(err => console.error("โหลด story ไม่ได้:", err));

// -----------------------------
// ฟังก์ชันเพิ่มข้อความ
// -----------------------------
function addMessage(msg) {
  if (msg.type === "center") {
    const centerDiv = document.createElement("div");
    centerDiv.classList.add("center-message");
    centerDiv.innerHTML = msg.text.replace(/\n/g, "<br>").replace(/---/g, "<hr>");
    chatContainer.appendChild(centerDiv);
    centerDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    return;
  }

  if (msg.type === "twitter") {
    const card = document.createElement("div");
    card.classList.add("twitter-card");
    card.innerHTML = `
      <div class="twitter-header">
        <img src="https://store-images.s-microsoft.com/image/apps.26737.9007199266244427.c75d2ced-a383-40dc-babd-1ad2ceb13c86.ed1d047e-03d9-4cd8-a342-c4ade1e58951" class="twitter-logo">
        <span>twitter</span>
      </div>
      <div class="twitter-body">
        <img src="${msg.avatar}" class="twitter-avatar">
        <div class="twitter-user">${msg.user}</div>
      </div>
      <div class="twitter-text">${msg.text}</div>
      <div class="twitter-footer">
        <b>${msg.retweets}</b> Retweets &nbsp;&nbsp; <b>${msg.likes}</b> Likes
      </div>
    `;
    chatContainer.appendChild(card);
    card.scrollIntoView({ behavior: "smooth", block: "end" });
    return;
  }

  const char = characters[msg.name] || {};
  const align = msg.align || "left";

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (align === "right") messageDiv.classList.add("right");

  const avatarImg = document.createElement("img");
  avatarImg.src = char.avatar || "https://i.imgur.com/default.png";
  avatarImg.classList.add("avatar");

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("bubble");

  const nameDiv = document.createElement("div");
  nameDiv.classList.add("name");
  nameDiv.textContent = msg.name;

  const textDiv = document.createElement("div");

  bubbleDiv.appendChild(nameDiv);
  bubbleDiv.appendChild(textDiv);

  // ✅ ถ้ามีภาพ ส่งเข้ามา
  if (msg.image) {
    const imgEl = document.createElement("img");
    imgEl.src = msg.image;
    imgEl.classList.add("message-img");
    bubbleDiv.appendChild(imgEl);
  }

  messageDiv.appendChild(avatarImg);
  messageDiv.appendChild(bubbleDiv);
  chatContainer.appendChild(messageDiv);

  if (msg.typing) {
    textDiv.textContent = "…";
    typingTextDiv = textDiv;
    const typingDelay = Math.max(msg.text.length * 50, 500);

    typingTimeout = setTimeout(() => {
      textDiv.textContent = msg.text;
      typingTimeout = null;
      typingTextDiv = null;
      messageDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    }, typingDelay);
  } else {
    textDiv.textContent = msg.text;
    messageDiv.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  if (align === "right") bubbleDiv.classList.add("right-bubble");
}


// -----------------------------
// ปุ่มถัดไป
// -----------------------------
nextBtn.addEventListener("click", () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    if (typingTextDiv) typingTextDiv.textContent = story[currentIndex].text;
    typingTimeout = null;
    typingTextDiv = null;
  } else if (currentIndex < story.length) {
    addMessage(story[currentIndex]);
    currentIndex++;
    localStorage.setItem(`chapterProgress_${selectedChapter}`, currentIndex);

    if (currentIndex >= story.length) {
      if (chapterIndex < chapters.length - 1) {
        nextBtn.textContent = "次の話を読む";
        nextBtn.onclick = goNextChapter;
      } else {
        nextBtn.textContent = "おしまい";
        nextBtn.disabled = true;
      }
    }
  }
});

// -----------------------------
// ปุ่มอ่านทั้งหมด
// -----------------------------
readAllBtn.addEventListener("click", () => {
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTextDiv = null;

  chatContainer.innerHTML = "";
  story.forEach(msg => addMessage({ ...msg, typing: false }));
  currentIndex = story.length;
  localStorage.setItem(`chapterProgress_${selectedChapter}`, currentIndex);

  if (chapterIndex < chapters.length - 1) {
    nextBtn.disabled = false;
    nextBtn.textContent = "次の話を読む";
    nextBtn.onclick = goNextChapter;
  } else {
    nextBtn.disabled = true;
    nextBtn.textContent = "おしまい";
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
});

// -----------------------------
// ไปตอนต่อไป
// -----------------------------
function goNextChapter() {
  chapterIndex++;
  selectedChapter = chapters[chapterIndex];
  localStorage.setItem("selectedChapter", selectedChapter);
  window.location.reload();
}
