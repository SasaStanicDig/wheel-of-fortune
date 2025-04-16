const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');

let prizes = [];
let currentAngle = 0;
let spinning = false;

async function loadPrizes() {
  const response = await fetch('prizes.json');
  prizes = await response.json();
  drawWheel();
}

function drawWheel() {
  const validPrizes = prizes.filter(p => p.count > 0);
  const sliceAngle = (2 * Math.PI) / validPrizes.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  validPrizes.forEach((prize, index) => {
    const angle = index * sliceAngle;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, angle, angle + sliceAngle);
    ctx.fillStyle = `hsl(${(index * 360) / validPrizes.length}, 80%, 60%)`;
    ctx.fill();
    ctx.save();

    const img = new Image();
    img.src = prize.image;
    img.onload = () => {
      const imgAngle = angle + sliceAngle / 2;
      const x = 250 + Math.cos(imgAngle) * 150 - 30;
      const y = 250 + Math.sin(imgAngle) * 150 - 30;
      ctx.drawImage(img, x, y, 60, 60);
    };
    ctx.restore();
  });
}

function spinWheel() {
  if (spinning) return;
  const validPrizes = prizes.filter(p => p.count > 0);
  if (validPrizes.length === 0) {
    alert("No more prizes!");
    return;
  }

  spinning = true;

  const randomIndex = Math.floor(Math.random() * validPrizes.length);
  const selectedPrize = validPrizes[randomIndex];
  const anglePerPrize = (2 * Math.PI) / validPrizes.length;
  const stopAngle = (randomIndex * anglePerPrize) + anglePerPrize / 2;

  let targetAngle = (2 * Math.PI * 10) + (Math.PI * 3 / 2 - stopAngle); // Spin and land
  let duration = 5000;
  let start = null;

  function animate(timestamp) {
    if (!start) start = timestamp;
    let progress = timestamp - start;
    let angle = easeOut(progress / duration) * targetAngle;

    currentAngle = angle;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    ctx.translate(250, 250);
    ctx.rotate(currentAngle);
    ctx.translate(-250, -250);

    drawWheel();

    if (progress < duration) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      selectedPrize.count--;
      drawWheel();
      // alert(`You won: ${selectedPrize.name}!`);
      prizeImage.src = selectedPrize.image;
      prizeName.textContent = selectedPrize.name;
      prizeModal.style.display = 'flex';

    }
  }

  requestAnimationFrame(animate);
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

spinBtn.addEventListener('click', spinWheel);
const prizeModal = document.getElementById('prizeModal');
const prizeImage = document.getElementById('prizeImage');
const prizeName = document.getElementById('prizeName');
const closeModal = document.getElementById('closeModal');
loadPrizes();

closeModal.addEventListener('click', () => {
  prizeModal.style.display = 'none';
});

