/**
 * Color Palette Generator
 * Generates color scales and harmonic palettes from a seed color.
 */
import { hexToRgb, rgbToHex, tintColor, shadeColor, contrastText, copyToClipboard, attachCopyButton, hexToHsl, contrastRatio } from '../utils.js';

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const TINT_MAP   = [0.95, 0.88, 0.75, 0.58, 0.38, 0, 0, 0, 0, 0, 0];
const SHADE_MAP  = [0, 0, 0, 0, 0, 0, 0.15, 0.30, 0.48, 0.64, 0.75];

function buildScale(baseHex) {
  return SCALE_STEPS.map((step, i) => {
    if (i < 5) return tintColor(baseHex, TINT_MAP[i]);
    if (i === 5) return baseHex;
    return shadeColor(baseHex, SHADE_MAP[i]);
  });
}

function buildHarmonicPalettes(baseHex) {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];
  const hslStr = hexToHsl(baseHex);
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return [];
  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = parseInt(match[3]);

  const hslToHex = (hue, sat, lig) => {
    hue = ((hue % 360) + 360) % 360;
    const h1 = hue / 360;
    const s1 = sat / 100;
    const l1 = lig / 100;
    const q = l1 < 0.5 ? l1 * (1 + s1) : l1 + s1 - l1 * s1;
    const p = 2 * l1 - q;
    const toC = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const r = Math.round(toC(h1 + 1/3) * 255);
    const g = Math.round(toC(h1) * 255);
    const b = Math.round(toC(h1 - 1/3) * 255);
    return rgbToHex(r, g, b);
  };

  return [
    {
      name: 'Complementary',
      colors: [baseHex, hslToHex(h + 180, s, l)],
    },
    {
      name: 'Triadic',
      colors: [baseHex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)],
    },
    {
      name: 'Analogous',
      colors: [hslToHex(h - 30, s, l), baseHex, hslToHex(h + 30, s, l)],
    },
    {
      name: 'Split-Complementary',
      colors: [baseHex, hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)],
    },
    {
      name: 'Tetradic',
      colors: [baseHex, hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l)],
    },
  ];
}

export function createColorPalette(container) {
  let baseColor = '#6366f1';

  container.innerHTML = `
    <div class="flex gap-24" style="align-items: flex-start; flex-wrap: wrap;">
      <!-- Controls -->
      <div style="min-width:260px; flex: 1;">
        <div class="panel mb-16">
          <div class="panel-title">Seed Color</div>
          <div class="flex gap-8 items-center mb-12">
            <input type="color" id="cp-color-input" value="${baseColor}" />
            <input type="text" class="input input-mono flex-1" id="cp-hex-input" value="${baseColor}" placeholder="#6366f1" maxlength="7" />
          </div>
          <div class="field mb-8">
            <label>HSL</label>
            <div class="input input-mono" id="cp-hsl-display" style="background: var(--color-bg);">${hexToHsl(baseColor)}</div>
          </div>
          <div class="field">
            <label>RGB</label>
            <div class="input input-mono" id="cp-rgb-display" style="background: var(--color-bg);">rgb(99, 102, 241)</div>
          </div>
        </div>

        <!-- Harmonic palettes -->
        <div class="panel">
          <div class="panel-title">Color Harmonies</div>
          <div id="cp-harmonies"></div>
        </div>
      </div>

      <!-- Scale -->
      <div style="flex: 2; min-width:300px;">
        <div class="panel mb-16">
          <div class="flex items-center justify-between mb-16">
            <div class="panel-title" style="margin-bottom:0;">Color Scale</div>
            <button class="btn btn-ghost btn-sm" id="cp-copy-scale-btn">Copy CSS vars</button>
          </div>
          <div id="cp-scale-display"></div>
        </div>

        <!-- Contrast checker -->
        <div class="panel">
          <div class="panel-title">Contrast Checker</div>
          <div class="grid-2 mb-12">
            <div class="field">
              <label>Foreground</label>
              <div class="flex gap-8 items-center">
                <input type="color" id="cc-fg" value="#ffffff" />
                <input type="text" class="input input-mono flex-1" id="cc-fg-text" value="#ffffff" maxlength="7" />
              </div>
            </div>
            <div class="field">
              <label>Background</label>
              <div class="flex gap-8 items-center">
                <input type="color" id="cc-bg" value="${baseColor}" />
                <input type="text" class="input input-mono flex-1" id="cc-bg-text" value="${baseColor}" maxlength="7" />
              </div>
            </div>
          </div>
          <div id="cc-preview" class="contrast-preview" style="background:${baseColor}; color:#ffffff;">
            <div style="font-weight:700; font-size:16px; margin-bottom:4px;">Heading Text</div>
            <div style="font-size:13px;">Body text preview for readability</div>
          </div>
          <div class="flex items-center gap-12">
            <div id="cc-ratio-badge" class="contrast-ratio-badge pass">21 : 1</div>
            <div>
              <div class="flex gap-8" id="cc-wcag-badges"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const colorInput = container.querySelector('#cp-color-input');
  const hexInput   = container.querySelector('#cp-hex-input');
  const hslDisplay = container.querySelector('#cp-hsl-display');
  const rgbDisplay = container.querySelector('#cp-rgb-display');
  const scaleEl    = container.querySelector('#cp-scale-display');
  const harmoniesEl = container.querySelector('#cp-harmonies');
  const copyScaleBtn = container.querySelector('#cp-copy-scale-btn');

  const ccFgPicker = container.querySelector('#cc-fg');
  const ccFgText   = container.querySelector('#cc-fg-text');
  const ccBgPicker = container.querySelector('#cc-bg');
  const ccBgText   = container.querySelector('#cc-bg-text');
  const ccPreview  = container.querySelector('#cc-preview');
  const ccRatio    = container.querySelector('#cc-ratio-badge');
  const ccBadges   = container.querySelector('#cc-wcag-badges');

  function renderScale() {
    const scale = buildScale(baseColor);
    scaleEl.innerHTML = '';
    SCALE_STEPS.forEach((step, i) => {
      const color = scale[i];
      const text = contrastText(color);
      const row = document.createElement('div');
      row.className = 'flex items-center gap-12 mb-4';
      row.style.cssText = `padding:8px 12px; border-radius:6px; background:${color}; cursor:pointer;`;
      row.title = 'Click to copy';
      row.innerHTML = `
        <span style="font-family:var(--font-mono);font-size:11px;color:${text};width:30px;">${step}</span>
        <span style="flex:1;"></span>
        <span style="font-family:var(--font-mono);font-size:11px;color:${text};">${color}</span>
      `;
      row.addEventListener('click', () => copyToClipboard(color, `✓ ${color}`));
      scaleEl.appendChild(row);
    });
  }

  function renderHarmonies() {
    const palettes = buildHarmonicPalettes(baseColor);
    harmoniesEl.innerHTML = '';
    palettes.forEach(p => {
      const row = document.createElement('div');
      row.className = 'mb-12';
      row.innerHTML = `<div style="font-size:11px;color:var(--color-text-muted);margin-bottom:6px;">${p.name}</div>`;
      const swatches = document.createElement('div');
      swatches.className = 'flex gap-4';
      p.colors.forEach(c => {
        const s = document.createElement('div');
        s.style.cssText = `flex:1;height:32px;border-radius:6px;background:${c};cursor:pointer;`;
        s.title = c;
        s.addEventListener('click', () => copyToClipboard(c, `✓ ${c}`));
        swatches.appendChild(s);
      });
      row.appendChild(swatches);
      harmoniesEl.appendChild(row);
    });
  }

  function updateColorDisplays() {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;
    hslDisplay.textContent = hexToHsl(baseColor);
    rgbDisplay.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  function updateContrastChecker() {
    const fg = ccFgText.value;
    const bg = ccBgText.value;
    if (!hexToRgb(fg) || !hexToRgb(bg)) return;
    ccPreview.style.background = bg;
    ccPreview.style.color = fg;
    const ratio = contrastRatio(fg, bg);
    if (!ratio) return;
    const ratioFixed = ratio.toFixed(2);
    ccRatio.textContent = `${ratioFixed} : 1`;
    const passes = ratio >= 4.5;
    ccRatio.className = `contrast-ratio-badge ${passes ? 'pass' : 'fail'}`;
    ccBadges.innerHTML = `
      <span class="tag ${ratio >= 3 ? 'pass' : 'fail'}" style="background:${ratio>=3?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)'}; color:${ratio>=3?'#34d399':'#f87171'}; padding:2px 8px; border-radius:100px; font-size:11px;">AA Large ${ratio >= 3 ? '✓' : '✗'}</span>
      <span class="tag ${ratio >= 4.5 ? 'pass' : 'fail'}" style="background:${ratio>=4.5?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)'}; color:${ratio>=4.5?'#34d399':'#f87171'}; padding:2px 8px; border-radius:100px; font-size:11px;">AA Normal ${ratio >= 4.5 ? '✓' : '✗'}</span>
      <span class="tag ${ratio >= 7 ? 'pass' : 'fail'}" style="background:${ratio>=7?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)'}; color:${ratio>=7?'#34d399':'#f87171'}; padding:2px 8px; border-radius:100px; font-size:11px;">AAA ${ratio >= 7 ? '✓' : '✗'}</span>
    `;
  }

  function update() {
    colorInput.value = baseColor;
    hexInput.value = baseColor;
    ccBgPicker.value = baseColor;
    ccBgText.value = baseColor;
    updateColorDisplays();
    renderScale();
    renderHarmonies();
    updateContrastChecker();
  }

  colorInput.addEventListener('input', () => {
    baseColor = colorInput.value;
    update();
  });

  hexInput.addEventListener('input', () => {
    const v = hexInput.value.startsWith('#') ? hexInput.value : '#' + hexInput.value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      baseColor = v;
      colorInput.value = v;
      updateColorDisplays();
      renderScale();
      renderHarmonies();
      ccBgPicker.value = v;
      ccBgText.value = v;
      updateContrastChecker();
    }
  });

  copyScaleBtn.addEventListener('click', () => {
    const scale = buildScale(baseColor);
    const css = `:root {\n${SCALE_STEPS.map((s, i) => `  --color-${s}: ${scale[i]};`).join('\n')}\n}`;
    copyToClipboard(css, '✓ CSS variables copied!');
  });

  ccFgPicker.addEventListener('input', () => {
    ccFgText.value = ccFgPicker.value;
    updateContrastChecker();
  });
  ccFgText.addEventListener('input', () => {
    const v = ccFgText.value.startsWith('#') ? ccFgText.value : '#' + ccFgText.value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      ccFgPicker.value = v;
      updateContrastChecker();
    }
  });
  ccBgPicker.addEventListener('input', () => {
    ccBgText.value = ccBgPicker.value;
    updateContrastChecker();
  });
  ccBgText.addEventListener('input', () => {
    const v = ccBgText.value.startsWith('#') ? ccBgText.value : '#' + ccBgText.value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      ccBgPicker.value = v;
      updateContrastChecker();
    }
  });

  update();
}
