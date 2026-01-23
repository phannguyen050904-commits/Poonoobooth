// assets.js - Updated version
import { themeNames, filterConfigs, dialogueConfigs, grainConfigs } from './config.js';
import { assets } from './state.js';
import { safeLog, safeErr } from './utils.js';
import { preloadMarks } from './marks.js'; // Thêm import

// Preload themes
export function preloadThemes() {
  themeNames.forEach(name => {
    const img = new Image();
    img.src = `themes/${name}.png`;
    assets.themeImages[name] = img;
    img.addEventListener('load', () => safeLog(`Theme loaded: ${name}`));
  });
}

// Preload filters
export function preloadFilters() {
  filterConfigs.forEach(f => {
    const img = new Image();
    img.src = f.path;
    assets.filterImages[f.name] = { 
      image: img, 
      offsetX: f.offsetX, 
      offsetY: f.offsetY, 
      scale: f.scale || 1.0 
    };
    img.addEventListener('load', () => safeLog(`Filter loaded: ${f.name}`));
    img.addEventListener('error', () => safeErr(`Filter failed: ${f.name}`));
  });
}

// Preload dialogues
export function preloadDialogues() {
  dialogueConfigs.forEach(d => {
    const img = new Image();
    img.src = d.path;
    assets.dialogueImages[d.name] = img;
    img.addEventListener('load', () => safeLog(`Dialogue loaded: ${d.name}`));
    img.addEventListener('error', () => safeErr(`Dialogue failed: ${d.name}`));
  });
}

// Preload grain videos
export function preloadGrains() {
  grainConfigs.forEach(g => {
    const v = document.createElement('video');
    v.src = g.path;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.addEventListener('loadeddata', () => {
      safeLog(`Grain loaded: ${g.name}`);
      v.play().catch(() => {});
    });
    assets.grainVideos[g.name] = v;
  });
}

// Preload fonts
export async function preloadFonts() {
  const fontsToLoad = ['32px FontTime', '32px FontPixel', '3px MyFont'];
  try {
    await Promise.all(fontsToLoad.map(f => document.fonts.load(f)));
    safeLog('Fonts loaded');
  } catch (err) {
    safeErr('Font loading failed:', err);
  }
}

// Preload all assets
export function preloadAll() {
  preloadThemes();
  preloadFilters();
  preloadDialogues();
  preloadGrains();
  preloadFonts();
  preloadMarks(); // Thêm dòng này
}