let config = null;

const STORAGE_KEY = 'anniversary-lucky-box';

let openedMappings = [];

// ======================
// ELEMENTS
// ======================

const welcomeModal =
  document.getElementById(
    'welcomeModal'
  );

const rewardModal =
  document.getElementById(
    'rewardModal'
  );

const systemModal =
  document.getElementById(
    'systemModal'
  );

const boxContainer =
  document.getElementById(
    'boxContainer'
  );

// ======================
// STORAGE
// ======================

function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      openedMappings
    )
  );

}

function loadLocalState() {

  const saved =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!saved) {
    return false;
  }

  try {

    openedMappings =
      JSON.parse(saved);

    return true;

  }
  catch (error) {

    console.error(error);

    return false;

  }

}

function resetState() {

  localStorage.removeItem(
    STORAGE_KEY
  );

  location.reload();

}

function exportLuckyBox() {

  console.log(
    'Copy this to config.json'
  );

  console.log(
    JSON.stringify(
      openedMappings,
      null,
      2
    )
  );

}

// ======================
// MODALS
// ======================

document
  .getElementById(
    'closeWelcomeBtn'
  )
  .addEventListener(
    'click',
    () => {

      welcomeModal.classList.add(
        'hidden'
      );

    }
  );

document
  .getElementById(
    'closeRewardBtn'
  )
  .addEventListener(
    'click',
    () => {

      rewardModal.classList.add(
        'hidden'
      );

    }
  );

document
  .getElementById(
    'closeSystemBtn'
  )
  .addEventListener(
    'click',
    () => {

      systemModal.classList.add(
        'hidden'
      );

    }
  );

// ======================
// SYSTEM MODAL
// ======================

function showModal({

  type = 'info',

  icon = null,

  title = 'Notice',

  message = ''

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

  document
    .getElementById(
      'systemModalIcon'
    )
    .textContent =
      icon ||
      iconMap[type] ||
      '🎀';

  document
    .getElementById(
      'systemModalTitle'
    )
    .textContent =
      title;

  document
    .getElementById(
      'systemModalMessage'
    )
    .textContent =
      message;

  systemModal.classList.remove(
    'hidden'
  );

}

// ======================
// LOAD CONFIG
// ======================

async function loadConfig() {

  try {

    const response =
      await fetch(
        './config.json'
      );

    config =
      await response.json();

    // Default state from config

    openedMappings =
      config.openedMappings || [];

    // Local storage overrides config

    loadLocalState();

    updateStatusText();

    renderBoxes();

  }
  catch (error) {

    console.error(error);

    showModal({

      type: 'error',

      title:
        'โหลดข้อมูลไม่สำเร็จ',

      message:
        'ไม่สามารถโหลด config.json ได้'

    });

  }

}

// ======================
// STATUS
// ======================

function updateStatusText() {

  const total =
    config.boxes.length;

  const opened =
    openedMappings.length;

  const remain =
    total - opened;

  document
    .getElementById(
      'remainingText'
    )
    .textContent =
      `เปิดแล้ว ${opened}/${total} กล่อง • เหลือ ${remain} กล่อง 🎁`;

}

// ======================
// HELPERS
// ======================

function findRewardById(
  rewardId
) {

  return config.boxes.find(
    box =>
      box.id === rewardId
  );

}

function findOpenedPosition(
  position
) {

  return openedMappings.find(
    item =>
      item.position === position
  );

}

// ======================
// RENDER BOXES
// ======================

function renderBoxes() {

  boxContainer.innerHTML =
    '';

  config.boxes.forEach(
    positionBox => {

      const openedData =
        findOpenedPosition(
          positionBox.id
        );

      let imageSrc =
        'images/gift-box.png';

      let rewardData =
        null;

      if (openedData) {

        rewardData =
          findRewardById(
            openedData.rewardId
          );

        imageSrc =
          rewardData.giftImage;

      }

      const card =
        document.createElement(
          'div'
        );

      card.className =
        'box-card';

      card.innerHTML = `
        <img
          src="${imageSrc}"
          alt="gift">

        ${
          openedData
            ? `
              <div
                class="opened-badge">
                OPENED
              </div>
            `
            : ''
        }
      `;

      card.addEventListener(
        'click',
        () => {

          if (
            openedData
          ) {

            showReward(
              rewardData
            );

            return;

          }

          openBox(
            positionBox.id,
            card
          );

        }
      );

      boxContainer.appendChild(
        card
      );

    }
  );

}

// ======================
// OPEN BOX
// ======================

function openBox(
  position,
  card
) {

  if (
    openedMappings.length >=
    config.maxOpenAllowed
  ) {

    showModal({

      type: 'lock',

      title:
        'ยังเปิดไม่ได้',

      message:
        'กล่องถัดไปยังไม่ถูกปลดล็อก โปรดกลับมาอีกครั้งในภายหลัง 💜'

    });

    return;

  }

  const openCount =
    openedMappings.length;

  const rewardId =
    config.rewardSequence[
      openCount
    ];

  const reward =
    findRewardById(
      rewardId
    );

  card.classList.add(
    'box-opening'
  );

  createSparkles();

  setTimeout(
    () => {

      openedMappings.push({

        position:
          position,

        rewardId:
          rewardId

      });

      saveState();

      renderBoxes();

      updateStatusText();

      showReward(
        reward
      );

      if (
        openedMappings.length ===
        config.boxes.length
      ) {

        setTimeout(
          () => {

            showModal({

              type:
                'success',

              title:
                'Congratulations!',

              message:
                'คุณค้นพบของขวัญทั้งหมดแล้ว 🎉'

            });

          },
          1000
        );

      }

    },
    800
  );

}

// ======================
// REWARD MODAL
// ======================

function showReward(
  reward
) {

  document
    .getElementById(
      'rewardImage'
    )
    .src =
      reward.giftImage;

  document
    .getElementById(
      'rewardTitle'
    )
    .textContent =
      reward.title;

  document
    .getElementById(
      'rewardDesc'
    )
    .textContent =
      reward.description;

  rewardModal.classList.remove(
    'hidden'
  );

}

// ======================
// SPARKLES
// ======================

function createSparkles() {

  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const sparkle =
      document.createElement(
        'div'
      );

    sparkle.className =
      'sparkle';

    sparkle.innerHTML =
      '✨';

    sparkle.style.left =
      (
        window.innerWidth / 2 -
        60 +
        Math.random() * 120
      ) + 'px';

    sparkle.style.top =
      (
        window.innerHeight / 2 -
        60 +
        Math.random() * 120
      ) + 'px';

    document.body.appendChild(
      sparkle
    );

    setTimeout(
      () => {

        sparkle.remove();

      },
      1000
    );

  }

}

// ======================
// DEBUG
// ======================

window.resetLuckyBox =
  resetState;

window.exportLuckyBox =
  exportLuckyBox;

window.showModal =
  showModal;

// ======================
// START
// ======================

loadConfig();
