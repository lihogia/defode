/**
 * Utility helpers shared across tools
 */

/**
 * Copy text to clipboard and show a toast notification.
 * @param {string} text
 * @param {string} [label]
 */
export function copyToClipboard(text, label = 'Copied!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(label, 'success');
  }).catch(() => {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(label, 'success');
  });
}

/**
 * Show a transient toast message.
 * @param {string} message
 * @param {'success'|'info'|'error'} [type]
 */
export function showToast(message, type = 'info') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  // Force reflow so transition replays
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

/**
 * Convert hex color string to {r, g, b} object (0-255).
 * @param {string} hex
 * @returns {{r:number, g:number, b:number}|null}
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(clean)) return null;
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/**
 * Convert {r, g, b} (0-255) to hex string.
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex to HSL string.
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Compute relative luminance of a color (WCAG 2.x).
 * @param {{r:number, g:number, b:number}} rgb
 */
export function relativeLuminance({ r, g, b }) {
  const sRGB = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Compute WCAG contrast ratio between two hex colors.
 */
export function contrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const L1 = relativeLuminance(rgb1);
  const L2 = relativeLuminance(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate a tint of a base hex color (blend toward white).
 * @param {string} hex
 * @param {number} amount 0..1
 */
export function tintColor(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * amount),
    Math.round(rgb.g + (255 - rgb.g) * amount),
    Math.round(rgb.b + (255 - rgb.b) * amount),
  );
}

/**
 * Generate a shade of a base hex color (blend toward black).
 * @param {string} hex
 * @param {number} amount 0..1
 */
export function shadeColor(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.round(rgb.r * (1 - amount)),
    Math.round(rgb.g * (1 - amount)),
    Math.round(rgb.b * (1 - amount)),
  );
}

/**
 * Determine whether text on a given background should be light or dark.
 */
export function contrastText(bgHex) {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return '#000';
  const lum = relativeLuminance(rgb);
  return lum > 0.179 ? '#0f0f13' : '#ffffff';
}

/**
 * Render a "copy" button attached to a code block.
 * @param {HTMLElement} codeBlock
 * @param {()=>string} getText  Lazily reads current code text
 */
export function attachCopyButton(codeBlock, getText) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-ghost btn-sm code-copy-btn';
  btn.title = 'Copy to clipboard';
  btn.textContent = 'Copy';
  btn.addEventListener('click', () => copyToClipboard(getText(), '✓ Copied!'));
  codeBlock.appendChild(btn);
}
