const modal = document.getElementById('adModal');
const closeBtn = document.getElementById('closeBtn');

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

let config;

async function loadConfig() {

  const response = await fetch('./config.json');

  config = await response.json();

  renderBoxes();

}

function renderBoxes() {

  const container = document.getElementById('boxContainer');

  container.innerHTML = '';

  config.boxes.forEach(box => {

    const opened = config.openedBoxes.includes(box.id);

    const image = opened
      ? box.giftImage
      : 'images/gift-box.png';

    const card = document.createElement('div');

    card.className = 'box-card';

    card.innerHTML = `
      <img src="${image}">
    `;

    card.addEventListener('click', () => {

      if (opened) {

        showReward(box);

      } else {

        openBox(box);

      }

    });

    container.appendChild(card);

  });

}

function openBox(box) {

  if (
    config.openedBoxes.length >=
    config.maxOpenAllowed
  ) {

    alert('ยังไม่มีสิทธิ์เปิดเพิ่ม ❤️');

    return;

  }

  config.openedBoxes.push(box.id);

  renderBoxes();

  showReward(box);

}

function showReward(box) {

  document
    .getElementById('rewardImage')
    .src = box.giftImage;

  document
    .getElementById('rewardTitle')
    .textContent = box.title;

  document
    .getElementById('rewardDesc')
    .textContent = box.description;

  document
    .getElementById('rewardModal')
    .classList.remove('hidden');

}

document
  .getElementById('rewardCloseBtn')
  .addEventListener('click', () => {

    document
      .getElementById('rewardModal')
      .classList.add('hidden');

  });

loadConfig();
