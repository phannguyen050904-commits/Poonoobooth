import { state } from './state.js';
import { safeLog } from './utils.js';

// Update weather effects
export function updateWeatherEffects() {
  stopCreatingNewWeatherEffects();
  switch(state.currentWeather) {
    case 'none':
      break;
    case 'spring':
      createFlowerPetals();
      break;
    case 'summer':
      startRain();
      break;
    case 'autumn':
      startLeafFall();
      break;
    case 'winter':
      startSnowFall();
      break;
  }
  safeLog(`Weather changed to: ${state.currentWeather}`);
}

// Stop creating new weather effects
export function stopCreatingNewWeatherEffects() {
  if (state.leafInterval) {
    clearInterval(state.leafInterval);
    state.leafInterval = null;
  }
  if (state.snowInterval) {
    clearInterval(state.snowInterval);
    state.snowInterval = null;
  }
  if (state.rainInterval) {
    clearInterval(state.rainInterval);
    state.rainInterval = null;
  }
  if (state.petalInterval) {
    clearInterval(state.petalInterval);
    state.petalInterval = null;
  }
}

// Spring - Flower petals
function createFlowerPetals() {
  state.petalInterval = setInterval(() => {
    if (state.currentWeather === 'spring') createPetal();
  }, Math.random() * 200 + 150);
}

function createPetal() {
  if (state.currentWeather !== 'spring') return;
  const petal = document.createElement('div');
  petal.classList.add('leaf');
  petal.innerHTML = '🌸';
  const size = Math.random() * 25 + 15;
  petal.style.fontSize = `${size}px`;
  petal.style.left = `${Math.random() * 100}vw`;
  const duration = Math.random() * 20 + 12;
  const sway = Math.random() * 80 - 40;
  petal.style.setProperty('--sway', `${sway}px`);
  petal.style.animation = `leaf-fall ${duration}s linear forwards`;
  petal.style.opacity = Math.random() * 0.6 + 0.4;
  document.body.appendChild(petal);
  setTimeout(() => {
    if (petal.parentNode) petal.remove();
  }, duration * 5000);
}

// Summer - Rain
function startRain() {
  createRaindrop();
  state.rainInterval = setInterval(() => {
    if (state.currentWeather === 'summer') {
      createRaindrop();
      if (Math.random() > 0.5) setTimeout(() => createRaindrop(), 50);
      if (Math.random() > 0.7) setTimeout(() => createRaindrop(), 100);
    }
  }, 10);
}

function createRaindrop() {
  if (state.currentWeather !== 'summer') return;
  const raindrop = document.createElement('div');
  raindrop.classList.add('raindrop');
  raindrop.style.width = '2px';
  raindrop.style.height = '20px';
  raindrop.style.background = 'linear-gradient(to bottom, transparent, #a0d0ff, #70b0ff)';
  raindrop.style.borderRadius = '1px';
  raindrop.style.left = `${Math.random() * 100}vw`;
  const duration = Math.random() * 0.8 + 0.4;
  raindrop.style.animation = `rain-fall ${duration}s linear forwards`;
  raindrop.style.opacity = Math.random() * 0.7 + 0.3;
  const length = Math.random() * 15 + 10;
  raindrop.style.height = `${length}px`;
  const width = Math.random() * 1 + 1;
  raindrop.style.width = `${width}px`;
  document.body.appendChild(raindrop);
  setTimeout(() => {
    if (raindrop.parentNode) raindrop.remove();
  }, duration * 1000);
}

// Autumn - Leaves
function startLeafFall() {
  createLeaf();
  state.leafInterval = setInterval(() => {
    if (state.currentWeather === 'autumn') createLeaf();
  }, Math.random() * 150 + 100);
}

function createLeaf() {
  if (state.currentWeather !== 'autumn') return;
  const leaf = document.createElement('div');
  leaf.classList.add('leaf');
  const leaves = ['🍁', '🍂'];
  const randomLeaf = leaves[Math.floor(Math.random() * leaves.length)];
  leaf.innerHTML = randomLeaf;
  const size = Math.random() * 30 + 15;
  leaf.style.fontSize = `${size}px`;
  leaf.style.left = `${Math.random() * 100}vw`;
  const duration = Math.random() * 10 + 5;
  const sway = Math.random() * 100 - 50;
  leaf.style.setProperty('--sway', `${sway}px`);
  leaf.style.animation = `leaf-fall ${duration}s linear forwards`;
  leaf.style.opacity = Math.random() * 0.7 + 0.3;
  const colors = ['#ff6b35', '#f4a261', '#e76f51', '#e9c46a'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  leaf.style.color = randomColor;
  document.body.appendChild(leaf);
  setTimeout(() => {
    if (leaf.parentNode) leaf.remove();
  }, duration * 5000);
}

// Winter - Snow
function startSnowFall() {
  createSnowflake();
  state.snowInterval = setInterval(() => {
    if (state.currentWeather === 'winter') createSnowflake();
  }, Math.random() * 100 + 75);
}

function createSnowflake() {
  if (state.currentWeather !== 'winter') return;
  const snowflake = document.createElement('div');
  snowflake.classList.add('snowflake');
  snowflake.innerHTML = '❄';
  const size = Math.random() * 20 + 10;
  snowflake.style.fontSize = `${size}px`;
  snowflake.style.left = `${Math.random() * 100}vw`;
  const duration = Math.random() * 8 + 5;
  snowflake.style.animation = `fall ${duration}s linear forwards`;
  snowflake.style.opacity = Math.random() * 0.8 + 0.2;
  const rotation = Math.random() * 360;
  snowflake.style.transform = `rotate(${rotation}deg)`;
  document.body.appendChild(snowflake);
  setTimeout(() => {
    if (snowflake.parentNode) snowflake.remove();
  }, duration * 4000);
}