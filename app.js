let config = null;

const STORAGE_KEY =
  'anniversary-lucky-box';

let openedMappings = [];

// =====================
// ELEMENTS
// =====================

const welcomeModal =
  document.getElementById(
    'welcomeModal'
  );

const rewardModal =
  document.getElementById(
    'rewardModal'
  );

const boxContainer =
  document.getElementById(
    'boxContainer'
  );

// =====================
// STORAGE
// =====================

function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      openedMappings
    )
  );

}

function loadState() {

  const saved =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!saved) {
    return;
  }

  try {

    openedMappings =
      JSON.parse(saved);

  }
  catch (error) {

    console.error(
      error
    );

    openedMappings = [];

  }

}

function resetState() {

  localStorage.removeItem(
    STORAGE_KEY
  );

  location.reload();

}

// =====================
// MODALS
// =====================

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

// =====================
// LOAD CONFIG
// =====================

async function loadConfig() {

  try {

    const response =
      await fetch(
        './config.json'
      );

    config =
      await response.json();

    loadState();

    updateRemainingText();

    renderBoxes();

  }
  catch (error) {

    console.error(
      error
    );

    alert(
      'โหลด config.json ไม่สำเร็จ'
    );

  }

}

// =====================
// STATUS TEXT
// =====================

function updateRemainingText() {

  document
    .getElementById(
      'remainingText'
    )
    .textContent =
      `เปิดแล้ว ${openedMappings.length} / ${config.boxes.length} กล่อง 🎁`;

}

// =====================
// HELPERS
// =====================

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

// =====================
// RENDER BOXES
// =====================

function renderBoxes() {

  boxContainer.innerHTML = '';

  config.boxes.forEach(box => {

    const openedData =
      findOpenedPosition(
        box.id
      );

    let imageSrc =
      'images/gift-box.png';

    if (openedData) {

      const reward =
        findRewardById(
          openedData.rewardId
        );

      imageSrc =
        reward.giftImage;

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
        alt="gift"
      >

      ${
        openedData
          ? '<div class="opened-badge">OPENED</div>'
          : ''
      }
    `;

    card.addEventListener(
      'click',
      () => {

        if (openedData) {

          const reward =
            findRewardById(
              openedData.rewardId
            );

          showReward(
            reward
          );

        }
        else {

          openBox(
            box.id,
            card
          );

        }

      }
    );

    boxContainer.appendChild(
      card
    );

  });

}

// =====================
// OPEN BOX
// =====================

function openBox(
  position,
  card
) {

  if (
    openedMappings.length >=
    config.maxOpenAllowed
  ) {

    alert(
      'ยังไม่สามารถเปิดกล่องเพิ่มได้ 🎀'
    );

    return;

  }

  const rewardIndex =
    openedMappings.length;

  const rewardId =
    config.rewardSequence[
      rewardIndex
    ];

  const reward =
    findRewardById(
      rewardId
    );

  card.classList.add(
    'box-opening'
  );

  createSparkles();

  setTimeout(() => {

    openedMappings.push({
      position: position,
      rewardId: rewardId
    });

    saveState();

    renderBoxes();

    updateRemainingText();

    showReward(
      reward
    );

  }, 800);

}

// =====================
// REWARD MODAL
// =====================

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

// =====================
// SPARKLES
// =====================

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

// =====================
// DEBUG
// =====================

window.resetLuckyBox =
  resetState;

// =====================
// START
// =====================

loadConfig();
