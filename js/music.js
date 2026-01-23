import { noiNayCoAnhLyrics } from './config.js';
import { state } from './state.js';
import { elements } from './dom.js';
import { safeLog } from './utils.js';

// Update music effects
export function updateMusicEffects() {
  stopCurrentMusic();
  switch(state.currentMusic) {
    case 'none':
      hideLyrics();
      break;
    case 'Nơi này có anh':
      showLyrics();
      startLyricsDisplay();
      break;
  }
  safeLog(`Music changed to: ${state.currentMusic}`);
}

// Stop current music
export function stopCurrentMusic() {
  if (state.lyricsInterval) {
    clearInterval(state.lyricsInterval);
    state.lyricsInterval = null;
  }
  state.currentLyricIndex = 0;
}

// Show lyrics container
function showLyrics() {
  elements.lyricsContainer.style.display = 'block';
  elements.lyricsText.textContent = '';
  elements.lyricsText.classList.remove('show');
}

// Hide lyrics container
function hideLyrics() {
  elements.lyricsContainer.style.display = 'none';
  elements.lyricsText.classList.remove('show');
}

// Start displaying lyrics
function startLyricsDisplay() {
  if (state.currentMusic !== 'Nơi này có anh') return;
  state.currentLyricIndex = 0;
  displayNextLyric();
}

// Display next lyric
function displayNextLyric() {
  if (state.currentMusic !== 'Nơi này có anh') return;
  
  if (state.currentLyricIndex >= noiNayCoAnhLyrics.length) {
    state.currentLyricIndex = 0;
  }
  
  const currentLyric = noiNayCoAnhLyrics[state.currentLyricIndex];
  
  elements.lyricsText.classList.remove('show');
  
  setTimeout(() => {
    elements.lyricsText.textContent = currentLyric.text;
    elements.lyricsText.classList.add('show');
    
    state.currentLyricIndex++;
    
    if (state.currentLyricIndex < noiNayCoAnhLyrics.length || state.currentMusic === 'Nơi này có anh') {
      const displayTime = currentLyric.duration;
      state.lyricsInterval = setTimeout(() => {
        displayNextLyric();
      }, displayTime);
    }
  }, 0);
}