/**
 * Typography Scale Generator
 */
import { copyToClipboard } from '../utils.js';

const NAMED_STEPS = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
const DEFAULT_RATIO = 1.25;
const DEFAULT_BASE = 16;

function buildScale(base, ratio, steps) {
  // The "base" step (index 2 in NAMED_STEPS) should equal the base size.
  // Smaller indices (xs, sm) go down in scale; larger indices go up.
  const BASE_INDEX = 2;
  return Array.from({ length: steps }, (_, i) => {
    const exp = i - BASE_INDEX;
    const px = Math.round(base * Math.pow(ratio, exp) * 100) / 100;
    const rem = Math.round(px / 16 * 100) / 100;
    return { px, rem, name: NAMED_STEPS[i] || `step-${i}` };
  });
}

export function createTypographyScale(container) {
  let basePx = DEFAULT_BASE;
  let ratio = DEFAULT_RATIO;
  let steps = 10;
  let previewText = 'The quick brown fox';
  let fontFamily = 'inherit';
  let fontWeight = '400';

  const RATIOS = [
    { name: 'Minor Second (1.067)',  value: 1.067 },
    { name: 'Major Second (1.125)',  value: 1.125 },
    { name: 'Minor Third (1.2)',     value: 1.2   },
    { name: 'Major Third (1.25)',    value: 1.25  },
    { name: 'Perfect Fourth (1.333)',value: 1.333 },
    { name: 'Augmented Fourth (1.414)', value: 1.414 },
    { name: 'Perfect Fifth (1.5)',   value: 1.5   },
    { name: 'Golden Ratio (1.618)',  value: 1.618 },
  ];

  const SYSTEM_FONTS = [
    { name: 'System UI',    value: 'system-ui, sans-serif' },
    { name: 'Inter',        value: "'Inter', sans-serif" },
    { name: 'Mono',         value: "'JetBrains Mono', monospace" },
    { name: 'Georgia',      value: 'Georgia, serif' },
  ];

  container.innerHTML = `
    <div class="flex gap-24" style="align-items: flex-start; flex-wrap: wrap;">
      <!-- Controls -->
      <div style="min-width:260px; flex:0 0 260px;">
        <div class="panel mb-16">
          <div class="panel-title">Scale Settings</div>
          <div class="field mb-12">
            <label>Base size: <span id="ts-base-val">${basePx}</span>px</label>
            <input type="range" id="ts-base" min="10" max="24" step="1" value="${basePx}" />
          </div>
          <div class="field mb-12">
            <label>Ratio</label>
            <select class="input" id="ts-ratio">
              ${RATIOS.map(r => `<option value="${r.value}"${r.value === ratio ? ' selected' : ''}>${r.name}</option>`).join('')}
            </select>
          </div>
          <div class="field mb-12">
            <label>Steps: <span id="ts-steps-val">${steps}</span></label>
            <input type="range" id="ts-steps" min="4" max="10" step="1" value="${steps}" />
          </div>
          <div class="field mb-12">
            <label>Font Family</label>
            <select class="input" id="ts-font">
              ${SYSTEM_FONTS.map(f => `<option value="${f.value}">${f.name}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Font Weight</label>
            <select class="input" id="ts-weight">
              ${['300','400','500','600','700'].map(w => `<option value="${w}"${w === fontWeight ? ' selected':''}>Weight ${w}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="panel mb-16">
          <div class="panel-title">Preview Text</div>
          <input type="text" class="input" id="ts-preview-text" value="${previewText}" />
        </div>

        <div class="panel">
          <div class="flex items-center justify-between mb-8">
            <div class="panel-title" style="margin-bottom:0;">Export</div>
          </div>
          <button class="btn btn-primary w-full mb-8" id="ts-copy-css">Copy CSS variables</button>
          <button class="btn btn-secondary w-full" id="ts-copy-tailwind">Copy Tailwind config</button>
        </div>
      </div>

      <!-- Scale display -->
      <div style="flex:1; min-width:300px;">
        <div class="panel">
          <div class="flex items-center justify-between mb-16">
            <div class="panel-title" style="margin-bottom:0;">Type Scale</div>
            <div class="flex gap-8">
              <span class="tag tag-primary" id="ts-ratio-label">Major Third</span>
            </div>
          </div>
          <div id="ts-scale-list"></div>
        </div>
      </div>
    </div>
  `;

  const baseSlider = container.querySelector('#ts-base');
  const baseVal    = container.querySelector('#ts-base-val');
  const ratioSel   = container.querySelector('#ts-ratio');
  const stepsSlider = container.querySelector('#ts-steps');
  const stepsVal   = container.querySelector('#ts-steps-val');
  const fontSel    = container.querySelector('#ts-font');
  const weightSel  = container.querySelector('#ts-weight');
  const previewTextInput = container.querySelector('#ts-preview-text');
  const scaleList  = container.querySelector('#ts-scale-list');
  const ratioLabel = container.querySelector('#ts-ratio-label');
  const copyCss    = container.querySelector('#ts-copy-css');
  const copyTw     = container.querySelector('#ts-copy-tailwind');

  function render() {
    const scale = buildScale(basePx, ratio, steps);
    scaleList.innerHTML = '';
    [...scale].reverse().forEach((step, i) => {
      const row = document.createElement('div');
      row.className = 'type-scale-row';
      row.innerHTML = `
        <div class="type-meta">
          <div class="type-step">${step.name}</div>
          <div class="type-size">${step.px}px / ${step.rem}rem</div>
        </div>
        <div class="type-preview flex-1" style="font-size:${step.px}px; font-family:${fontFamily}; font-weight:${fontWeight}; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${previewText || 'Aa'}
        </div>
      `;
      scaleList.appendChild(row);
    });

    // Update ratio label
    const r = RATIOS.find(r => r.value.toString() === ratio.toString());
    if (r) ratioLabel.textContent = r.name.split('(')[0].trim();
  }

  function getCSSVars() {
    const scale = buildScale(basePx, ratio, steps);
    return `:root {\n${scale.map(s => `  --text-${s.name}: ${s.rem}rem;`).join('\n')}\n}`;
  }

  function getTailwindConfig() {
    const scale = buildScale(basePx, ratio, steps);
    const entries = scale.map(s => `    '${s.name}': '${s.rem}rem',`).join('\n');
    return `module.exports = {\n  theme: {\n    fontSize: {\n${entries}\n    }\n  }\n}`;
  }

  baseSlider.addEventListener('input', () => {
    basePx = parseInt(baseSlider.value);
    baseVal.textContent = basePx;
    render();
  });

  ratioSel.addEventListener('change', () => {
    ratio = parseFloat(ratioSel.value);
    render();
  });

  stepsSlider.addEventListener('input', () => {
    steps = parseInt(stepsSlider.value);
    stepsVal.textContent = steps;
    render();
  });

  fontSel.addEventListener('change', () => {
    fontFamily = fontSel.value;
    render();
  });

  weightSel.addEventListener('change', () => {
    fontWeight = weightSel.value;
    render();
  });

  previewTextInput.addEventListener('input', () => {
    previewText = previewTextInput.value;
    render();
  });

  copyCss.addEventListener('click', () => copyToClipboard(getCSSVars(), '✓ CSS vars copied!'));
  copyTw.addEventListener('click', () => copyToClipboard(getTailwindConfig(), '✓ Tailwind config copied!'));

  render();
}
