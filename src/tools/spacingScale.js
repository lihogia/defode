/**
 * Spacing Scale Generator
 */
import { copyToClipboard } from '../utils.js';

export function createSpacingScale(container) {
  let base = 4;
  let multiplier = 1.5;
  let steps = 12;
  let unit = 'px';

  const SYSTEMS = [
    { name: 'Base-4 (×1.5)', base: 4,  multiplier: 1.5 },
    { name: 'Base-4 (×2)',    base: 4,  multiplier: 2 },
    { name: 'Base-8 (×1.5)', base: 8,  multiplier: 1.5 },
    { name: 'Tailwind',       custom: [0,1,2,4,6,8,10,12,16,20,24,32,40,48,56,64,72,80,96] },
    { name: 'Material (8pt)', base: 8,  multiplier: 1 },
    { name: 'Bootstrap',      custom: [0,4,8,12,16,24,32,48,64] },
  ];

  function buildScale() {
    if (base <= 0) return [];
    return Array.from({ length: steps }, (_, i) => {
      // multiplier === 1 produces a linear scale (base × step index)
      const value = i === 0 ? 0
        : multiplier === 1 ? base * i
        : Math.round(base * Math.pow(multiplier, i - 1));
      const rem = Math.round(value / 16 * 100) / 100;
      return { step: i, value, rem, label: `${i}` };
    });
  }

  container.innerHTML = `
    <div class="flex gap-24" style="align-items: flex-start; flex-wrap: wrap;">
      <!-- Controls -->
      <div style="min-width:260px; flex:0 0 260px;">
        <div class="panel mb-16">
          <div class="panel-title">Scale Settings</div>
          <div class="field mb-12">
            <label>Base unit: <span id="sp-base-val">${base}</span>px</label>
            <input type="range" id="sp-base" min="2" max="16" step="1" value="${base}" />
          </div>
          <div class="field mb-12">
            <label>Multiplier: <span id="sp-mult-val">${multiplier}</span>×</label>
            <input type="range" id="sp-mult" min="1" max="3" step="0.25" value="${multiplier}" />
          </div>
          <div class="field mb-12">
            <label>Steps: <span id="sp-steps-val">${steps}</span></label>
            <input type="range" id="sp-steps" min="6" max="20" step="1" value="${steps}" />
          </div>
          <div class="field">
            <label>Unit</label>
            <select class="input" id="sp-unit">
              <option value="px">px</option>
              <option value="rem">rem</option>
            </select>
          </div>
        </div>

        <div class="panel mb-16">
          <div class="panel-title">Presets</div>
          <div class="flex flex-col gap-8" id="sp-presets"></div>
        </div>

        <div class="panel">
          <div class="panel-title">Export</div>
          <button class="btn btn-primary w-full mb-8" id="sp-copy-css">Copy CSS variables</button>
          <button class="btn btn-secondary w-full" id="sp-copy-tailwind">Copy Tailwind config</button>
        </div>
      </div>

      <!-- Scale display -->
      <div style="flex:1; min-width:300px;">
        <div class="panel">
          <div class="panel-title">Spacing Scale</div>
          <div id="sp-scale-list"></div>
        </div>
      </div>
    </div>
  `;

  const baseSlider = container.querySelector('#sp-base');
  const baseVal    = container.querySelector('#sp-base-val');
  const multSlider = container.querySelector('#sp-mult');
  const multVal    = container.querySelector('#sp-mult-val');
  const stepsSlider= container.querySelector('#sp-steps');
  const stepsVal   = container.querySelector('#sp-steps-val');
  const unitSel    = container.querySelector('#sp-unit');
  const scaleList  = container.querySelector('#sp-scale-list');
  const copyCss    = container.querySelector('#sp-copy-css');
  const copyTw     = container.querySelector('#sp-copy-tailwind');
  const presetsEl  = container.querySelector('#sp-presets');

  function getMaxValue() {
    const scale = buildScale();
    return scale.length ? Math.max(...scale.map(s => s.value)) : 1;
  }

  function render() {
    const scale = buildScale();
    const maxVal = getMaxValue() || 1;
    scaleList.innerHTML = '';
    scale.forEach(item => {
      const displayValue = unit === 'rem' ? `${item.rem}rem` : `${item.value}px`;
      const barWidth = Math.max(2, Math.round((item.value / maxVal) * 240));
      const row = document.createElement('div');
      row.className = 'spacing-scale-row';
      row.innerHTML = `
        <span class="spacing-label">${item.step}</span>
        <div class="spacing-bar" style="width:${barWidth}px;"></div>
        <span style="font-family:var(--font-mono); font-size:11px; color:var(--color-text-muted); margin-left:8px;">${displayValue}</span>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto; font-size:10px;" title="Copy value">${displayValue}</button>
      `;
      row.querySelector('button').addEventListener('click', () => copyToClipboard(displayValue, `✓ ${displayValue}`));
      scaleList.appendChild(row);
    });
  }

  function getCSSVars() {
    const scale = buildScale();
    return `:root {\n${scale.map(s => {
      const v = unit === 'rem' ? `${s.rem}rem` : `${s.value}px`;
      return `  --space-${s.step}: ${v};`;
    }).join('\n')}\n}`;
  }

  function getTailwindConfig() {
    const scale = buildScale();
    const entries = scale.map(s => {
      const v = unit === 'rem' ? `${s.rem}rem` : `${s.value}px`;
      return `    '${s.step}': '${v}',`;
    }).join('\n');
    return `module.exports = {\n  theme: {\n    spacing: {\n${entries}\n    }\n  }\n}`;
  }

  baseSlider.addEventListener('input', () => {
    base = parseInt(baseSlider.value);
    baseVal.textContent = base;
    render();
  });

  multSlider.addEventListener('input', () => {
    multiplier = parseFloat(multSlider.value);
    multVal.textContent = multiplier;
    render();
  });

  stepsSlider.addEventListener('input', () => {
    steps = parseInt(stepsSlider.value);
    stepsVal.textContent = steps;
    render();
  });

  unitSel.addEventListener('change', () => {
    unit = unitSel.value;
    render();
  });

  copyCss.addEventListener('click', () => copyToClipboard(getCSSVars(), '✓ CSS vars copied!'));
  copyTw.addEventListener('click', () => copyToClipboard(getTailwindConfig(), '✓ Tailwind config copied!'));

  SYSTEMS.forEach(sys => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-sm w-full';
    btn.textContent = sys.name;
    btn.addEventListener('click', () => {
      if (sys.custom) {
        // Render custom directly
        scaleList.innerHTML = '';
        const maxVal = Math.max(...sys.custom) || 1;
        sys.custom.forEach((v, i) => {
          const rem = Math.round(v / 16 * 100) / 100;
          const displayValue = unit === 'rem' ? `${rem}rem` : `${v}px`;
          const barWidth = Math.max(2, Math.round((v / maxVal) * 240));
          const row = document.createElement('div');
          row.className = 'spacing-scale-row';
          row.innerHTML = `
            <span class="spacing-label">${i}</span>
            <div class="spacing-bar" style="width:${barWidth}px;"></div>
            <span style="font-family:var(--font-mono); font-size:11px; color:var(--color-text-muted); margin-left:8px;">${displayValue}</span>
            <button class="btn btn-ghost btn-sm" style="margin-left:auto; font-size:10px;">${displayValue}</button>
          `;
          row.querySelector('button').addEventListener('click', () => copyToClipboard(displayValue, `✓ ${displayValue}`));
          scaleList.appendChild(row);
        });
      } else {
        base = sys.base;
        multiplier = sys.multiplier;
        baseSlider.value = base;
        baseVal.textContent = base;
        multSlider.value = multiplier;
        multVal.textContent = multiplier;
        render();
      }
    });
    presetsEl.appendChild(btn);
  });

  render();
}
