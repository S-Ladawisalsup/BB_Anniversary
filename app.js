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
    JSON.stringify(
      openedMappings,
      null,
      2
    )
  );

}

// ======================
// MODAL EVENTS
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

    // ใช้ state จาก config ก่อน

    openedMappings =
      config.openedMappings || [];

    // ถ้ามี localStorage
    // ให้ localStorage มี priority สูงกว่า

    loadLocalState();

    updateStatusText();

    renderBoxes();

  }
  catch (error) {

    console.error(error);

    alert(
      'โหลด config.json ไม่สำเร็จ'
    );

  }

}

// ======================
// STATUS
// ======================

function updateStatusText() {

  const remain =
    config.boxes.length -
    openedMappings.length;

  document
    .getElementById(
      'remainingText'
    )
    .textContent =
      `เปิดแล้ว ${openedMappings.length}/${config.boxes.length} กล่อง • เหลือ ${remain} กล่อง 🎁`;

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

      card.innerHTML =
        `
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

    alert(
      'ยังไม่สามารถเปิดกล่องเพิ่มได้ 🎀'
    );

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
// SPARKLE EFFECT
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

// ======================
// START
// ======================

loadConfig();
