const modal = document.getElementById('adModal');
const closeBtn = document.getElementById('closeBtn');

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

const boxes = [
  {
    id: 1,
    image: 'images/gift-box.png'
  },
  {
    id: 2,
    image: 'images/gift-box.png'
  },
  {
    id: 3,
    image: 'images/gift-box.png'
  },
  {
    id: 4,
    image: 'images/gift-box.png'
  }
];

const container = document.getElementById('boxContainer');

boxes.forEach(box => {

  const card = document.createElement('div');

  card.className = 'box-card';

  card.innerHTML = `
    <img src="${box.image}">
  `;

  card.addEventListener('click', () => {
    alert(`เปิดกล่อง ${box.id}`);
  });

  container.appendChild(card);

});
