let config = null;

const STORAGE_KEY = 'anniversary-lucky-box';
const USED_KEYWORDS_KEY = 'anniversary-used-keywords'; // คีย์ของพาร์ทคำลับ

let openedMappings = [];
let usedKeywords = []; // เก็บ keyword ที่ผู้ใช้พิมพ์ถูกและใช้ไปแล้ว

// คำลับที่คุณต้องการให้เปิดกล่องเพิ่ม (เปลี่ยนข้อความในนี้ได้เลยครับ)
const VALID_KEYWORDS = ['love1', 'love2', 'love3']; 

// ======================
// ELEMENTS
// ======================

const welcomeModal = document.getElementById('welcomeModal');
const rewardModal = document.getElementById('rewardModal');
const systemModal = document.getElementById('systemModal');
const boxContainer = document.getElementById('boxContainer');
const pageTitle = document.getElementById('pageTitle');

// ส่วนของ Secret Input ใน System Modal
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
  secretInputArea.classList.add('hidden'); // ซ่อนส่วน input ทุกครั้งเมื่อปิด modal
});

// ======================
// SYSTEM MODAL
// ======================

function showModal({
  type = 'info',
  icon = null,
  title = 'Notice',
  message = '',
  showInput = false // เพิ่ม parameter เพื่อเปิด/ปิดส่วน Input คำลับ
}) {

  const iconMap = {
    success: '🎉',
    warning: '⚠️',
    error: '❌',
    lock: '🔒',
    gift: '🎁',
    love: '💜',
    secret: '🗝️',
    info: '🎀'
  };

  document.getElementById('systemModalIcon').textContent = icon || iconMap[type] || '🎀';
  document.getElementById('systemModalTitle').textContent = title;
  document.getElementById('systemModalMessage').textContent = message;

  if (showInput) {
    secretInputArea.classList.remove('hidden');
    secretKeywordInput.value = ''; // เคลียร์ช่องข้อความเดิม
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

    // กำหนดค่าเริ่มต้นจาก config
    openedMappings = config.openedMappings || [];

    // ดึงค่าบันทึกจาก LocalStorage มาเขียนทับ (ถ้ามี)
    loadLocalState();
    updateStatusText();
    renderBoxes();
  } catch (error) {
    console.error(error);
    showModal({
      type: 'error',
      title: 'โหลดข้อมูลไม่สำเร็จ',
      message: 'ไม่สามารถโหลด config.json ได้'
    });
  }
}

// ======================
// STATUS & MAX ALLOWED CALCULATION
// ======================

// คำนวณสิทธิ์การเปิดจริง: ค่าตั้งต้นในไฟล์ config + จำนวน keyword ที่ถูกต้องในเครื่องนั้นๆ
function getMaxOpenAllowed() {
  const baseAllowed = config ? config.maxOpenAllowed : 1;
  return baseAllowed + usedKeywords.length;
}

function updateStatusText() {
  const total = config.boxes.length;
  const opened = openedMappings.length;
  const currentMax = getMaxOpenAllowed();
  
  // สิทธิ์ที่ผู้เล่นมีสิทธิ์กดได้ ณ ตอนนี้
  const availableToOpen = currentMax - opened;

  if (opened === total) {
    document.getElementById('remainingText').textContent = `ยินดีด้วย! คุณเปิดครบทั้ง ${total} กล่องเรียบร้อยแล้ว ✨`;
  } else if (availableToOpen > 0) {
    document.getElementById('remainingText').textContent = `คุณเปิดไปแล้ว ${opened}/${total} กล่อง • เปิดได้อีก ${availableToOpen} ครั้งชั่วคราว 🎁`;
  } else {
    document.getElementById('remainingText').textContent = `เปิดแล้ว ${opened}/${total} กล่อง • สิทธิ์หมดแล้ว รอปลดล็อกเพิ่ม 🔒`;
  }
}

// ======================
// HELPERS
// ======================

function findRewardById(rewardId) {
  return config.boxes.find(box => box.id === rewardId);
}

function findOpenedPosition(position) {
  return openedMappings.find(item => item.position === position);
}

// ======================
// RENDER BOXES
// ======================

function renderBoxes() {
  boxContainer.innerHTML = '';

  config.boxes.forEach(positionBox => {
    const openedData = findOpenedPosition(positionBox.id);
    let imageSrc = 'images/gift-box.png';
    let rewardData = null;

    if (openedData) {
      rewardData = findRewardById(openedData.rewardId);
      imageSrc = rewardData.giftImage;
    }

    const card = document.createElement('div');
    card.className = 'box-card';
    card.innerHTML = `
      <img src="${imageSrc}" alt="gift">
      ${openedData ? `<div class="opened-badge">OPENED</div>` : ''}
    `;

    card.addEventListener('click', () => {
      if (openedData) {
        showReward(rewardData);
        return;
      }
      openBox(positionBox.id, card);
    });

    boxContainer.appendChild(card);
  });
}

// ======================
// OPEN BOX
// ======================

function openBox(position, card) {
  // เช็คสิทธิ์การเปิดผ่าน Dynamic Function
  if (openedMappings.length >= getMaxOpenAllowed()) {
    showModal({
      type: 'lock',
      title: 'ยังเปิดไม่ได้',
      message: 'สิทธิ์ของคุณหมดแล้ว ลองมองหา "รหัสลับ" เพื่อปลดล็อกสิทธิ์เพิ่มอีก 1 ครั้ง 💜'
    });
    return;
  }

  const openCount = openedMappings.length;
  const rewardId = config.rewardSequence[openCount];
  const reward = findRewardById(rewardId);

  card.classList.add('box-opening');
  createSparkles();

  setTimeout(() => {
    openedMappings.push({
      position: position,
      rewardId: rewardId
    });

    saveState();
    renderBoxes();
    updateStatusText();
    showReward(reward);

    if (openedMappings.length === config.boxes.length) {
      setTimeout(() => {
        showModal({
          type: 'success',
          title: 'Congratulations!',
          message: 'คุณค้นพบของขวัญทั้งหมดแล้ว 🎉'
        });
      }, 1000);
    }
  }, 800);
}

// ======================
// REWARD MODAL
// ======================

function showReward(reward) {
  document.getElementById('rewardImage').src = reward.giftImage;
  document.getElementById('rewardTitle').textContent = reward.title;
  document.getElementById('rewardDesc').textContent = reward.description;
  rewardModal.classList.remove('hidden');
}

// ======================
// SPARKLES
// ======================

function createSparkles() {
  for (let i = 0; i < 12; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.left = (window.innerWidth / 2 - 60 + Math.random() * 120) + 'px';
    sparkle.style.top = (window.innerHeight / 2 - 60 + Math.random() * 120) + 'px';
    document.body.appendChild(sparkle);

    setTimeout(() => { sparkle.remove(); }, 1000);
  }
}

// ======================
// SECRET KEYWORD ACTION
// ======================

function openSecretUnlockModal() {
  showModal({
    type: 'secret',
    title: 'ปลดล็อกสิทธิ์ลับ',
    message: 'กรอก Keyword รหัสลับเพื่อรับสิทธิ์เปิดกล่องเพิ่มอีก 1 ครั้ง',
    showInput: true
  });
}

// ตรวจจับตอน Submit คำลับ
submitSecretBtn.addEventListener('click', () => {
  const inputVal = secretKeywordInput.value.trim();

  if (!inputVal) return;

  if (usedKeywords.includes(inputVal)) {
    // กรณีใช้คำซ้ำไปแล้ว
    showModal({
      type: 'warning',
      title: 'ใช้ซ้ำแล้ว',
      message: 'รหัสลับนี้ถูกใช้งานเพื่อเปิดสิทธิ์ไปแล้วนะ!'
    });
    return;
  }

  if (VALID_KEYWORDS.includes(inputVal)) {
    // กรอกคำถูกต้อง
    usedKeywords.push(inputVal);
    saveState();
    updateStatusText();
    
    showModal({
      type: 'success',
      title: 'สำเร็จ!',
      message: 'รหัสลับถูกต้อง! คุณได้รับสิทธิ์สุ่มของขวัญเพิ่มขึ้นอีก 1 ครั้ง 🎁💜'
    });
  } else {
    // กรอกผิดคำ
    showModal({
      type: 'error',
      title: 'รหัสไม่ถูกต้อง',
      message: 'คีย์เวิร์ดนี้ไม่ใช่รหัสลับที่ถูกต้อง ลองใหม่อีกครั้งนะ'
    });
  }
});

// รองรับการกดปุ่ม Enter ในหน้าต่างพิมพ์รหัสลับด้วย
secretKeywordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitSecretBtn.click();
});

// ======================
// DOUBLE CLICK / DOUBLE TAP TRIGGER
// ======================

// 1. สำหรับ Desktop
pageTitle.addEventListener('dblclick', openSecretUnlockModal);

// 2. สำหรับ Mobile (เนื่องจากมือถือบางบราวเซอร์ไม่มี dblclick event ที่สมบูรณ์แบบ)
let lastTap = 0;
pageTitle.addEventListener('touchstart', function (e) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 300 && tapLength > 0) {
    e.preventDefault(); // ป้องกันการซูมของหน้าจอในมือถือบางรุ่น
    openSecretUnlockModal();
  }
  lastTap = currentTime;
});

// ======================
// DEBUG
// ======================

window.resetLuckyBox = resetState;
window.exportLuckyBox = exportLuckyBox;
window.showModal = showModal;

// ======================
// START
// ======================

loadConfig();
