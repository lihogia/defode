/**
 * CSS Gradient Generator
 */
import { copyToClipboard } from '../utils.js';

export function createGradientGenerator(container) {
  let type = 'linear';
  let angle = 135;
  let radialShape = 'ellipse';
  let stops = [
    { id: 0, color: '#6366f1', position: 0 },
    { id: 1, color: '#f472b6', position: 100 },
  ];
  let selectedStop = 0;
  let nextStopId = 2;

  function buildGradientCSS() {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (type === 'radial') {
      return `radial-gradient(${radialShape} at center, ${stopsStr})`;
    } else {
      return `conic-gradient(from ${angle}deg at center, ${stopsStr})`;
    }
  }

  container.innerHTML = `
    <div class="flex gap-24" style="align-items: flex-start; flex-wrap: wrap;">
      <!-- Preview + code -->
      <div style="flex:1; min-width:260px;">
        <div class="panel mb-16" style="padding:0; overflow:hidden;">
          <div id="gg-preview" class="gradient-preview" style="border-radius:var(--radius-lg) var(--radius-lg) 0 0; margin:0; height:180px;"></div>
          <!-- Stop track -->
          <div style="padding:16px;">
            <div id="gg-stop-track" class="gradient-stop-track" title="Click to add a stop"></div>
          </div>
        </div>
        <div class="panel" style="position:relative;">
          <div class="panel-title">CSS Output</div>
          <pre id="gg-code" class="code-block" style="white-space:pre-wrap; word-break:break-all; padding-right:70px;"></pre>
          <button class="btn btn-primary btn-sm" id="gg-copy-btn" style="position:absolute;top:16px;right:16px;">Copy</button>
        </div>
      </div>

      <!-- Controls -->
      <div style="min-width:260px; flex:1;">
        <div class="panel mb-16">
          <div class="panel-title">Gradient Type</div>
          <div class="flex gap-8 mb-16" id="gg-type-btns">
            <button class="btn btn-primary btn-sm" data-type="linear">Linear</button>
            <button class="btn btn-secondary btn-sm" data-type="radial">Radial</button>
            <button class="btn btn-secondary btn-sm" data-type="conic">Conic</button>
          </div>

          <div id="gg-angle-row" class="field mb-0">
            <label>Angle: <span id="gg-angle-val">135</span>°</label>
            <input type="range" id="gg-angle" min="0" max="360" value="135" />
          </div>

          <div id="gg-radial-row" class="field mb-0" style="display:none;">
            <label>Shape</label>
            <select class="input" id="gg-radial-shape">
              <option value="ellipse">Ellipse</option>
              <option value="circle">Circle</option>
            </select>
          </div>
        </div>

        <!-- Color stops -->
        <div class="panel mb-16">
          <div class="flex items-center justify-between mb-12">
            <div class="panel-title" style="margin-bottom:0;">Color Stops</div>
            <button class="btn btn-primary btn-sm" id="gg-add-stop">+ Add Stop</button>
          </div>
          <div id="gg-stops-list" class="flex flex-col gap-8 mb-12"></div>
        </div>

        <!-- Presets -->
        <div class="panel">
          <div class="panel-title">Presets</div>
          <div class="flex gap-8" style="flex-wrap:wrap;" id="gg-presets"></div>
        </div>
      </div>
    </div>
  `;

  const preview  = container.querySelector('#gg-preview');
  const track    = container.querySelector('#gg-stop-track');
  const codeEl   = container.querySelector('#gg-code');
  const copyBtn  = container.querySelector('#gg-copy-btn');
  const typeBtns = container.querySelector('#gg-type-btns');
  const angleSlider = container.querySelector('#gg-angle');
  const angleVal = container.querySelector('#gg-angle-val');
  const angleRow = container.querySelector('#gg-angle-row');
  const radialRow = container.querySelector('#gg-radial-row');
  const radialShape_ = container.querySelector('#gg-radial-shape');
  const stopsList = container.querySelector('#gg-stops-list');
  const addStopBtn = container.querySelector('#gg-add-stop');

  const PRESETS = [
    { name: 'Sunset',    type:'linear', angle:135, stops:[{id:0,color:'#f97316',position:0},{id:1,color:'#f43f5e',position:100}] },
    { name: 'Ocean',     type:'linear', angle:135, stops:[{id:0,color:'#0ea5e9',position:0},{id:1,color:'#6366f1',position:100}] },
    { name: 'Forest',    type:'linear', angle:135, stops:[{id:0,color:'#10b981',position:0},{id:1,color:'#059669',position:100}] },
    { name: 'Aurora',    type:'linear', angle:135, stops:[{id:0,color:'#8b5cf6',position:0},{id:1,color:'#06b6d4',position:50},{id:2,color:'#10b981',position:100}] },
    { name: 'Peach',     type:'linear', angle:90,  stops:[{id:0,color:'#fbbf24',position:0},{id:1,color:'#f472b6',position:100}] },
    { name: 'Midnight',  type:'linear', angle:180, stops:[{id:0,color:'#1e1b4b',position:0},{id:1,color:'#312e81',position:50},{id:2,color:'#4f46e5',position:100}] },
    { name: 'Radial Glow',type:'radial',angle:0,  radialShape:'ellipse', stops:[{id:0,color:'#6366f1',position:0},{id:1,color:'#0f0f13',position:80}] },
    { name: 'Rainbow',   type:'conic',  angle:0,  stops:[{id:0,color:'#f43f5e',position:0},{id:1,color:'#f97316',position:20},{id:2,color:'#fbbf24',position:40},{id:3,color:'#34d399',position:60},{id:4,color:'#60a5fa',position:80},{id:5,color:'#8b5cf6',position:100}] },
  ];

  function updatePreview() {
    const gradCSS = buildGradientCSS();
    preview.style.background = gradCSS;
    track.style.background = `linear-gradient(to right, ${[...stops].sort((a,b)=>a.position-b.position).map(s=>`${s.color} ${s.position}%`).join(',')})`;
    codeEl.textContent = `background: ${gradCSS};`;
    renderStopHandles();
  }

  function renderStopHandles() {
    // Clear old handles
    track.querySelectorAll('.gradient-stop-handle').forEach(el => el.remove());
    stops.forEach(stop => {
      const handle = document.createElement('div');
      handle.className = `gradient-stop-handle${stop.id === selectedStop ? ' selected' : ''}`;
      handle.style.left = `${stop.position}%`;
      handle.style.background = stop.color;
      handle.title = `${stop.color} @ ${stop.position}%`;

      let dragging = false;
      let startX = 0;

      handle.addEventListener('mousedown', (e) => {
        selectedStop = stop.id;
        dragging = true;
        startX = e.clientX;
        renderStopsList();
        e.stopPropagation();
        e.preventDefault();
      });

      const onMouseMove = (e) => {
        if (!dragging) return;
        const rect = track.getBoundingClientRect();
        const pct = Math.round(Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100)));
        stop.position = pct;
        updatePreview();
        renderStopsList();
      };

      const onMouseUp = () => {
        dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      handle.addEventListener('mousedown', () => {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      track.appendChild(handle);
    });
  }

  function renderStopsList() {
    stopsList.innerHTML = '';
    [...stops].sort((a,b) => a.position - b.position).forEach(stop => {
      const row = document.createElement('div');
      row.className = `flex items-center gap-8 p-8${stop.id === selectedStop ? ' active' : ''}`;
      row.style.cssText = `padding:8px 10px; border-radius:var(--radius-md); background:${stop.id === selectedStop ? 'var(--color-surface-3)' : 'transparent'}; cursor:pointer;`;
      row.innerHTML = `
        <input type="color" value="${stop.color}" title="Stop color" />
        <input type="text" class="input input-mono" value="${stop.color}" style="width:90px;" />
        <input type="number" class="input input-mono" value="${stop.position}" min="0" max="100" style="width:60px;" title="Position %" />
        <span style="font-size:11px;color:var(--color-text-faint);">%</span>
        ${stops.length > 2 ? `<button class="btn btn-ghost btn-sm" title="Remove stop" style="margin-left:auto;">✕</button>` : ''}
      `;

      const colorPicker = row.querySelector('input[type="color"]');
      const colorText   = row.querySelector('input[type="text"]');
      const posInput    = row.querySelector('input[type="number"]');

      colorPicker.addEventListener('input', () => {
        stop.color = colorPicker.value;
        colorText.value = stop.color;
        updatePreview();
      });

      colorText.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(colorText.value)) {
          stop.color = colorText.value;
          colorPicker.value = stop.color;
          updatePreview();
        }
      });

      posInput.addEventListener('input', () => {
        stop.position = Math.max(0, Math.min(100, parseInt(posInput.value) || 0));
        updatePreview();
      });

      row.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
        selectedStop = stop.id;
        renderStopsList();
        renderStopHandles();
      });

      const delBtn = row.querySelector('button');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          stops = stops.filter(s => s.id !== stop.id);
          if (selectedStop === stop.id) selectedStop = stops[0].id;
          updatePreview();
          renderStopsList();
        });
      }

      stopsList.appendChild(row);
    });
  }

  // Track click to add stop
  track.addEventListener('click', (e) => {
    if (e.target.classList.contains('gradient-stop-handle')) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.round((e.clientX - rect.left) / rect.width * 100);
    // Interpolate color at position
    const newStop = { id: nextStopId++, color: '#ffffff', position: pct };
    stops.push(newStop);
    selectedStop = newStop.id;
    updatePreview();
    renderStopsList();
  });

  addStopBtn.addEventListener('click', () => {
    const newStop = { id: nextStopId++, color: '#ffffff', position: 50 };
    stops.push(newStop);
    selectedStop = newStop.id;
    updatePreview();
    renderStopsList();
  });

  // Type buttons
  typeBtns.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    type = btn.dataset.type;
    typeBtns.querySelectorAll('button').forEach(b => b.className = 'btn btn-secondary btn-sm');
    btn.className = 'btn btn-primary btn-sm';
    angleRow.style.display = (type !== 'radial') ? '' : 'none';
    radialRow.style.display = type === 'radial' ? '' : 'none';
    updatePreview();
  });

  angleSlider.addEventListener('input', () => {
    angle = parseInt(angleSlider.value);
    angleVal.textContent = angle;
    updatePreview();
  });

  radialShape_.addEventListener('change', () => {
    radialShape = radialShape_.value;
    updatePreview();
  });

  copyBtn.addEventListener('click', () => copyToClipboard(codeEl.textContent, '✓ Copied!'));

  // Presets
  const presetsEl = container.querySelector('#gg-presets');
  PRESETS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-sm';
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      type = p.type;
      angle = p.angle;
      radialShape = p.radialShape || 'ellipse';
      stops = p.stops.map(s => ({ ...s }));
      selectedStop = stops[0].id;
      nextStopId = Math.max(...stops.map(s => s.id)) + 1;
      angleSlider.value = angle;
      angleVal.textContent = angle;
      radialShape_.value = radialShape;
      angleRow.style.display = (type !== 'radial') ? '' : 'none';
      radialRow.style.display = type === 'radial' ? '' : 'none';
      typeBtns.querySelectorAll('button').forEach(b => {
        b.className = b.dataset.type === type ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
      });
      updatePreview();
      renderStopsList();
    });
    presetsEl.appendChild(btn);
  });

  renderStopsList();
  updatePreview();
}
