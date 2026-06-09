let config = null;

// =====================
// ELEMENTS
// =====================

const welcomeModal =
  document.getElementById('welcomeModal');

const rewardModal =
  document.getElementById('rewardModal');

const boxContainer =
  document.getElementById('boxContainer');

// =====================
// CLOSE BUTTONS
// =====================

document
  .getElementById('closeWelcomeBtn')
  .addEventListener('click', () => {

    welcomeModal.classList.add('hidden');

  });

document
  .getElementById('closeRewardBtn')
  .addEventListener('click', () => {

    rewardModal.classList.add('hidden');

  });

// =====================
// LOAD CONFIG
// =====================

async function loadConfig() {

  try {

    const response =
      await fetch('./config.json');

    config =
      await response.json();

    updateRemainingText();

    renderBoxes();

  }
  catch (error) {

    console.error(error);

    alert(
      'ไม่สามารถโหลด config.json ได้'
    );

  }

}

// =====================
// REMAINING TEXT
// =====================

function updateRemainingText() {

  const remain =
    config.boxes.length -
    config.openedBoxes.length;

  document
    .getElementById('remainingText')
    .textContent =
      `เหลือกล่องที่ยังไม่ถูกค้นพบ ${remain} กล่อง 🎁`;

}

// =====================
// RENDER BOXES
// =====================

function renderBoxes() {

  boxContainer.innerHTML = '';

  config.boxes.forEach(box => {

    const opened =
      config.openedBoxes.includes(box.id);

    const card =
      document.createElement('div');

    card.className = 'box-card';

    card.dataset.id = box.id;

    card.innerHTML = `
      <img
        src="${
          opened
            ? box.giftImage
            : 'images/gift-box.png'
        }"
        alt="${box.title}"
      >

      ${
        opened
          ? '<div class="opened-badge">OPENED</div>'
          : ''
      }
    `;

    card.addEventListener(
      'click',
      () => {

        if (opened) {

          showReward(box);

        }
        else {

          playOpenAnimation(
            card,
            box
          );

        }

      }
    );

    boxContainer.appendChild(card);

  });

}

// =====================
// OPEN ANIMATION
// =====================

function playOpenAnimation(
  card,
  box
) {

  card.classList.add(
    'box-opening'
  );

  createSparkles();

  setTimeout(() => {

    card.classList.remove(
      'box-opening'
    );

    showReward(box);

  }, 800);

}

// =====================
// REWARD MODAL
// =====================

function showReward(box) {

  document
    .getElementById('rewardImage')
    .src =
    box.giftImage;

  document
    .getElementById('rewardTitle')
    .textContent =
    box.title;

  document
    .getElementById('rewardDesc')
    .textContent =
    box.description;

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
      document.createElement('div');

    sparkle.className =
      'sparkle';

    sparkle.innerHTML = '✨';

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

    setTimeout(() => {

      sparkle.remove();

    }, 1000);

  }

}

// =====================
// START
// =====================

loadConfig();
