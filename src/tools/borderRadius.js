/**
 * Border Radius Visualizer
 */
import { copyToClipboard } from '../utils.js';

export function createBorderRadiusVisualizer(container) {
  let tl = 10, tr = 10, br = 10, bl = 10;
  let linked = true;
  let unit = 'px';
  let width = 200, height = 140;
  let bgColor = '#6366f1';
  let fgColor = '#ffffff';

  container.innerHTML = `
    <div class="flex gap-24" style="align-items: flex-start; flex-wrap: wrap;">
      <!-- Preview -->
      <div style="flex:1; min-width:260px;">
        <div class="panel mb-16" style="display:flex; align-items:center; justify-content:center; min-height:240px;">
          <div id="br-box" style="
            width:${width}px; height:${height}px;
            background:${bgColor};
            color:${fgColor};
            display:flex; align-items:center; justify-content:center;
            font-size:13px; font-weight:500;
            transition: border-radius 0.15s, width 0.15s, height 0.15s;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          " id="br-preview">
            Preview
          </div>
        </div>

        <!-- CSS output -->
        <div class="panel" style="position:relative;">
          <div class="panel-title">CSS Output</div>
          <pre id="br-code" class="code-block" style="padding-right:70px; white-space:pre-wrap;"></pre>
          <button class="btn btn-primary btn-sm" id="br-copy" style="position:absolute;top:16px;right:16px;">Copy</button>
        </div>
      </div>

      <!-- Controls -->
      <div style="min-width:260px; flex:1;">
        <div class="panel mb-16">
          <div class="flex items-center justify-between mb-16">
            <div class="panel-title" style="margin-bottom:0;">Corners</div>
            <div class="flex gap-8 items-center">
              <label class="flex items-center gap-6" style="cursor:pointer; font-size:12px; color:var(--color-text-muted);">
                <input type="checkbox" id="br-link" checked /> Link all
              </label>
              <select class="input" id="br-unit" style="width:60px; padding:4px 8px;">
                <option value="px">px</option>
                <option value="%">%</option>
                <option value="rem">rem</option>
              </select>
            </div>
          </div>

          <!-- Corner grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            ${[['tl','Top Left'],['tr','Top Right'],['bl','Bottom Left'],['br','Bottom Right']].map(([id,label]) => `
            <div class="field">
              <label>${label}: <span id="br-${id}-val">10</span>${unit}</label>
              <input type="range" id="br-${id}" min="0" max="100" value="10" />
              <input type="number" class="input input-mono" id="br-${id}-num" value="10" min="0" max="100" style="margin-top:6px;" />
            </div>
            `).join('')}
          </div>
        </div>

        <!-- Box size -->
        <div class="panel mb-16">
          <div class="panel-title">Box Size</div>
          <div class="grid-2">
            <div class="field">
              <label>Width: <span id="br-w-val">${width}</span>px</label>
              <input type="range" id="br-w" min="80" max="400" value="${width}" />
            </div>
            <div class="field">
              <label>Height: <span id="br-h-val">${height}</span>px</label>
              <input type="range" id="br-h" min="60" max="300" value="${height}" />
            </div>
          </div>
        </div>

        <!-- Colors + presets -->
        <div class="panel mb-16">
          <div class="panel-title">Appearance</div>
          <div class="grid-2 mb-12">
            <div class="field">
              <label>Background</label>
              <div class="flex gap-8 items-center">
                <input type="color" id="br-bg" value="${bgColor}" />
                <input type="text" class="input input-mono flex-1" id="br-bg-text" value="${bgColor}" maxlength="7" />
              </div>
            </div>
            <div class="field">
              <label>Text Color</label>
              <div class="flex gap-8 items-center">
                <input type="color" id="br-fg" value="${fgColor}" />
                <input type="text" class="input input-mono flex-1" id="br-fg-text" value="${fgColor}" maxlength="7" />
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">Presets</div>
          <div class="flex gap-8" style="flex-wrap:wrap;" id="br-presets"></div>
        </div>
      </div>
    </div>
  `;

  const box = container.querySelector('#br-box');
  const codeEl = container.querySelector('#br-code');
  const copyBtn = container.querySelector('#br-copy');
  const linkCheck = container.querySelector('#br-link');
  const unitSelect = container.querySelector('#br-unit');

  const corners = ['tl','tr','bl','br'].map(id => ({
    id,
    slider: container.querySelector(`#br-${id}`),
    num: container.querySelector(`#br-${id}-num`),
    val: container.querySelector(`#br-${id}-val`),
  }));

  const wSlider = container.querySelector('#br-w');
  const hSlider = container.querySelector('#br-h');
  const wVal = container.querySelector('#br-w-val');
  const hVal = container.querySelector('#br-h-val');
  const bgPicker = container.querySelector('#br-bg');
  const bgText = container.querySelector('#br-bg-text');
  const fgPicker = container.querySelector('#br-fg');
  const fgText = container.querySelector('#br-fg-text');

  const cornerVars = { tl, tr, bl, br };

  const PRESETS = [
    { name: 'Sharp',    tl:0,  tr:0,  bl:0,  br:0  },
    { name: 'Subtle',   tl:4,  tr:4,  bl:4,  br:4  },
    { name: 'Rounded',  tl:10, tr:10, bl:10, br:10 },
    { name: 'Large',    tl:20, tr:20, bl:20, br:20 },
    { name: 'Pill',     tl:50, tr:50, bl:50, br:50 },
    { name: 'Stadium',  tl:100,tr:100,bl:100,br:100 },
    { name: 'Top only', tl:12, tr:12, bl:0,  br:0  },
    { name: 'Mixed',    tl:0,  tr:20, bl:20, br:0  },
    { name: 'Leaf',     tl:50, tr:0,  bl:0,  br:50 },
    { name: 'Blob',     tl:60, tr:20, bl:30, br:50 },
  ];

  function getCSS() {
    const vals = {
      tl: cornerVars.tl,
      tr: cornerVars.tr,
      bl: cornerVars.bl,
      br: cornerVars.br,
    };
    const all = [vals.tl, vals.tr, vals.br, vals.bl];
    const u = unit;
    if (all.every(v => v === all[0])) {
      return `border-radius: ${all[0]}${u};`;
    }
    return `border-radius: ${vals.tl}${u} ${vals.tr}${u} ${vals.br}${u} ${vals.bl}${u};`;
  }

  function applyToBox() {
    const vals = cornerVars;
    const u = unit;
    box.style.borderRadius = `${vals.tl}${u} ${vals.tr}${u} ${vals.br}${u} ${vals.bl}${u}`;
    codeEl.textContent = getCSS();
  }

  function setCorner(id, value) {
    cornerVars[id] = value;
    const c = corners.find(c => c.id === id);
    c.slider.value = value;
    c.num.value = value;
    c.val.textContent = value;
  }

  corners.forEach(({ id, slider, num, val }) => {
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value);
      if (linked) {
        corners.forEach(c => setCorner(c.id, v));
      } else {
        setCorner(id, v);
      }
      applyToBox();
    });

    num.addEventListener('input', () => {
      const v = Math.max(0, Math.min(100, parseInt(num.value) || 0));
      if (linked) {
        corners.forEach(c => setCorner(c.id, v));
      } else {
        setCorner(id, v);
      }
      applyToBox();
    });
  });

  linkCheck.addEventListener('change', () => {
    linked = linkCheck.checked;
  });

  unitSelect.addEventListener('change', () => {
    unit = unitSelect.value;
    corners.forEach(c => { c.val.textContent = cornerVars[c.id]; });
    // Update labels
    container.querySelectorAll('.field label').forEach(l => {
      if (l.htmlFor && l.htmlFor.startsWith('br-')) return;
      // Update unit in slider labels
    });
    applyToBox();
  });

  wSlider.addEventListener('input', () => {
    width = parseInt(wSlider.value);
    wVal.textContent = width;
    box.style.width = width + 'px';
  });

  hSlider.addEventListener('input', () => {
    height = parseInt(hSlider.value);
    hVal.textContent = height;
    box.style.height = height + 'px';
  });

  bgPicker.addEventListener('input', () => {
    bgColor = bgPicker.value;
    bgText.value = bgColor;
    box.style.background = bgColor;
  });

  bgText.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(bgText.value)) {
      bgColor = bgText.value;
      bgPicker.value = bgColor;
      box.style.background = bgColor;
    }
  });

  fgPicker.addEventListener('input', () => {
    fgColor = fgPicker.value;
    fgText.value = fgColor;
    box.style.color = fgColor;
  });

  fgText.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(fgText.value)) {
      fgColor = fgText.value;
      fgPicker.value = fgColor;
      box.style.color = fgColor;
    }
  });

  copyBtn.addEventListener('click', () => copyToClipboard(getCSS(), '✓ Copied!'));

  // Presets
  const presetsEl = container.querySelector('#br-presets');
  PRESETS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-sm';
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      linked = false;
      linkCheck.checked = false;
      setCorner('tl', p.tl);
      setCorner('tr', p.tr);
      setCorner('bl', p.bl);
      setCorner('br', p.br);
      applyToBox();
    });
    presetsEl.appendChild(btn);
  });

  applyToBox();
}
