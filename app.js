let config = null;

const STORAGE_KEY = 'anniversary-lucky-box';
const USED_KEYWORDS_KEY = 'anniversary-used-keywords';

let openedMappings = [];
let usedKeywords = []; 

// ใส่คำลับที่ต้องการได้ที่นี่
const VALID_KEYWORDS = ['swim', 'kisskiss', 'lottery']; 

// ======================
// ELEMENTS
// ======================

const welcomeModal = document.getElementById('welcomeModal');
const rewardModal = document.getElementById('rewardModal');
const systemModal = document.getElementById('systemModal');
const boxContainer = document.getElementById('boxContainer');
const pageTitle = document.getElementById('pageTitle');

const secretInputArea = document.getElementById('secretInputArea');
const secretKeywordInput = document.getElementById('secretKeywordInput');
const submitSecretBtn = document.getElementById('submitSecretBtn');

// ======================
// STORAGE
// ======================

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(openedMappings));
  localStorage.setItem(USED_KEYWORDS_KEY, JSON.stringify(usedKeywords));
}

function loadLocalState() {
  const savedBoxes = localStorage.getItem(STORAGE_KEY);
  const savedKeywords = localStorage.getItem(USED_KEYWORDS_KEY);

  if (savedBoxes) {
    try { openedMappings = JSON.parse(savedBoxes); } catch(e) { console.error(e); }
  }
  if (savedKeywords) {
    try { usedKeywords = JSON.parse(savedKeywords); } catch(e) { console.error(e); }
  }
  return !!savedBoxes;
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USED_KEYWORDS_KEY);
  location.reload();
}

function exportLuckyBox() {
  console.log('Copy this to config.json -> openedMappings');
  console.log(JSON.stringify(openedMappings, null, 2));
}

// ======================
// MODALS
// ======================

document.getElementById('closeWelcomeBtn').addEventListener('click', () => {
  welcomeModal.classList.add('hidden');
});

document.getElementById('closeRewardBtn').addEventListener('click', () => {
  rewardModal.classList.add('hidden');
});

document.getElementById('closeSystemBtn').addEventListener('click', () => {
  systemModal.classList.add('hidden');
  secretInputArea.classList.add('hidden');
});

function showModal({
  type = 'info',
  icon = null,
  title = 'Notice',
  message = '',
  showInput = false
}) {
  const iconMap = {
    success: '🎉', warning: '⚠️', error: '❌', lock: '🔒',
    gift: '🎁', love: '💜', secret: '🗝️', info: '🎀'
  };

  document.getElementById('systemModalIcon').textContent = icon || iconMap[type] || '🎀';
  document.getElementById('systemModalTitle').textContent = title;
  document.getElementById('systemModalMessage').textContent = message;

  if (showInput) {
    secretInputArea.classList.remove('hidden');
    secretKeywordInput.value = '';
    setTimeout(() => secretKeywordInput.focus(), 100);
  } else {
    secretInputArea.classList.add('hidden');
  }

  systemModal.classList.remove('hidden');
}

// ======================
// LOAD CONFIG
// ======================

async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    config = await response.json();
    openedMappings = config.openedMappings || [];
    loadLocalState();
    updateStatusText();
    renderBoxes();
  } catch (error) {
    console.error(error);
    showModal({ type: 'error', title: 'โหลดข้อมูลไม่สำเร็จ', message: 'ไม่สามารถโหลด config.json ได้' });
  }
}

// ======================
// STATUS & MAX ALLOWED
// ======================

function getMaxOpenAllowed() {
  const baseAllowed = config ? config.maxOpenAllowed : 1;
  return baseAllowed + usedKeywords.length;
}

function updateStatusText() {
  const total = config.boxes.length;
  const opened = openedMappings.length;
  const currentMax = getMaxOpenAllowed();
  const availableToOpen = currentMax - opened;

  if (opened === total) {
    document.getElementById('remainingText').textContent = `ยินดีด้วย! คุณเปิดครบทั้ง ${total} กล่องเรียบร้อยแล้ว ✨`;
  } else if (availableToOpen > 0) {
    document.getElementById('remainingText').textContent = `เปิดแล้ว ${opened}/${total} กล่อง • เปิดได้อีก ${availableToOpen} ครั้ง 🎁`;
  } else {
    document.getElementById('remainingText').textContent = `เปิดแล้ว ${opened}/${total} กล่อง • สิทธิ์หมดแล้ว 🔒`;
  }
}

// ======================
// OPEN BOX
// ======================

function openBox(position, card) {
  // ล็อกเวลา
  const targetTime = new Date('2026-06-09T18:40:00+07:00');
  const currentTime = new Date();

  if (currentTime < targetTime) {
    showModal({
      type: 'lock',
      title: 'ยังไม่ถึงเวลาเปิด',
      message: 'กล่องนำโชคยังไม่พร้อมทำงาน ไว้มาเปิดตอนเย็นบนรถนะจ๊ะ! ⏳💜'
    });
    return;
  }

  if (openedMappings.length >= getMaxOpenAllowed()) {
    showModal({
      type: 'lock',
      title: 'ยังเปิดไม่ได้',
      message: 'สิทธิ์ของคุณหมดแล้ว ลองอ้อนขอแฟนคุณ เพื่อปลดล็อกสิทธิ์เพิ่มอีก 1 ครั้ง 💜'
    });
    return;
  }

  const openCount = openedMappings.length;
  const rewardId = config.rewardSequence[openCount];
  const reward = config.boxes.find(b => b.id === rewardId);

  card.classList.add('box-opening');
  createSparkles();

  setTimeout(() => {
    openedMappings.push({ position, rewardId });
    saveState();
    renderBoxes();
    updateStatusText();
    showReward(reward);
    if (openedMappings.length === config.boxes.length) {
      setTimeout(() => showModal({ type: 'success', title: 'Congratulations!', message: 'คุณค้นพบของขวัญทั้งหมดแล้ว 🎉' }), 1000);
    }
  }, 800);
}

// ======================
// RENDER & HELPERS
// ======================

function renderBoxes() {
  boxContainer.innerHTML = '';
  config.boxes.forEach(positionBox => {
    const openedData = openedMappings.find(item => item.position === positionBox.id);
    let imageSrc = openedData ? config.boxes.find(b => b.id === openedData.rewardId).giftImage : 'images/gift-box.png';

    const card = document.createElement('div');
    card.className = 'box-card';
    card.innerHTML = `<img src="${imageSrc}" alt="gift">${openedData ? `<div class="opened-badge">OPENED</div>` : ''}`;
    card.addEventListener('click', () => openedData ? showReward(config.boxes.find(b => b.id === openedData.rewardId)) : openBox(positionBox.id, card));
    boxContainer.appendChild(card);
  });
}

function showReward(reward) {
  document.getElementById('rewardImage').src = reward.giftImage;
  document.getElementById('rewardTitle').textContent = reward.title;
  document.getElementById('rewardDesc').textContent = reward.description;
  rewardModal.classList.remove('hidden');
}

function createSparkles() {
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.innerHTML = '✨';
    s.style.left = (window.innerWidth / 2 - 60 + Math.random() * 120) + 'px';
    s.style.top = (window.innerHeight / 2 - 60 + Math.random() * 120) + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

// ======================
// SECRET KEYWORD
// ======================

function openSecretUnlockModal() {
  showModal({ type: 'secret', title: 'ปลดล็อกสิทธิ์ลับ', message: 'กรอก Keyword รหัสลับเพื่อรับสิทธิ์เปิดกล่องเพิ่มอีก 1 ครั้ง', showInput: true });
}

submitSecretBtn.addEventListener('click', () => {
  const inputVal = secretKeywordInput.value.trim();
  if (usedKeywords.includes(inputVal)) {
    showModal({ type: 'warning', title: 'ใช้ซ้ำแล้ว', message: 'รหัสลับนี้ถูกใช้งานไปแล้วนะ!' });
  } else if (VALID_KEYWORDS.includes(inputVal)) {
    usedKeywords.push(inputVal);
    saveState();
    updateStatusText();
    showModal({ type: 'success', title: 'สำเร็จ!', message: 'ได้รับสิทธิ์เปิดกล่องเพิ่มอีก 1 ครั้งแล้ว! 🎁' });
  } else {
    showModal({ type: 'error', title: 'รหัสไม่ถูกต้อง', message: 'คีย์เวิร์ดนี้ไม่ใช่รหัสลับที่ถูกต้อง' });
  }
});

secretKeywordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitSecretBtn.click(); });

pageTitle.addEventListener('dblclick', openSecretUnlockModal);

let lastTap = 0;
pageTitle.addEventListener('touchstart', (e) => {
  const now = new Date().getTime();
  if (now - lastTap < 300) openSecretUnlockModal();
  lastTap = now;
});

// DEBUG
window.resetLuckyBox = resetState;
window.exportLuckyBox = exportLuckyBox;

loadConfig();
