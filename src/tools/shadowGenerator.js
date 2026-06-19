/**
 * CSS Box Shadow Generator
 */
import { copyToClipboard } from '../utils.js';

function shadowToCSS(layers) {
  return layers
    .filter(l => l.enabled)
    .map(l => {
      const inset = l.inset ? 'inset ' : '';
      return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
    })
    .join(',\n       ');
}

export function createShadowGenerator(container) {
  let layers = [
    { id: 1, enabled: true, x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.3)', inset: false },
  ];
  let selectedId = 1;
  let nextId = 2;

  container.innerHTML = `
    <div class="flex gap-24" style="align-items: flex-start; flex-wrap: wrap;">
      <!-- Preview + Code -->
      <div style="flex:1; min-width:260px;">
        <div class="panel mb-16" style="display:flex; align-items:center; justify-content:center; padding:40px 20px;">
          <div id="sg-preview-bg" style="width:100%; min-height:200px; border-radius:12px; display:flex; align-items:center; justify-content:center; background: var(--color-surface-3);">
            <div id="sg-preview-box" style="width:160px; height:100px; border-radius:10px; background: var(--color-surface); transition: box-shadow 0.2s;"></div>
          </div>
        </div>
        <div class="panel" style="position:relative;">
          <div class="panel-title">CSS Output</div>
          <div id="sg-code" class="code-block" style="padding-right:70px; white-space:pre-wrap; word-break:break-all;"></div>
          <button class="btn btn-primary btn-sm" id="sg-copy-btn" style="position:absolute;top:16px;right:16px;">Copy</button>
        </div>
      </div>

      <!-- Controls -->
      <div style="min-width:280px; flex:1;">
        <div class="panel">
          <div class="flex items-center justify-between mb-12">
            <div class="panel-title" style="margin-bottom:0;">Shadow Layers</div>
            <button class="btn btn-primary btn-sm" id="sg-add-btn">+ Add Layer</button>
          </div>
          <div id="sg-layers-list" class="shadow-layers"></div>

          <div class="divider"></div>

          <!-- Per-layer controls -->
          <div id="sg-layer-controls">
            <div class="panel-title">Selected Layer</div>
            <div class="grid-2 mb-12">
              <div class="field">
                <label>Offset X <span id="sg-x-val">0</span>px</label>
                <input type="range" id="sg-x" min="-60" max="60" value="0" />
              </div>
              <div class="field">
                <label>Offset Y <span id="sg-y-val">4</span>px</label>
                <input type="range" id="sg-y" min="-60" max="60" value="4" />
              </div>
              <div class="field">
                <label>Blur <span id="sg-blur-val">12</span>px</label>
                <input type="range" id="sg-blur" min="0" max="100" value="12" />
              </div>
              <div class="field">
                <label>Spread <span id="sg-spread-val">0</span>px</label>
                <input type="range" id="sg-spread" min="-40" max="40" value="0" />
              </div>
            </div>
            <div class="flex gap-12 items-center mb-12">
              <div class="field flex-1">
                <label>Color</label>
                <div class="flex gap-8 items-center">
                  <input type="color" id="sg-color-picker" value="#000000" />
                  <input type="text" class="input input-mono flex-1" id="sg-color-text" value="rgba(0,0,0,0.3)" />
                </div>
              </div>
            </div>
            <div class="flex items-center gap-12">
              <label class="flex items-center gap-8" style="cursor:pointer; font-size:13px; color:var(--color-text-muted);">
                <input type="checkbox" id="sg-inset" style="cursor:pointer;" />
                Inset
              </label>
            </div>
          </div>
        </div>

        <!-- Presets -->
        <div class="panel mt-16">
          <div class="panel-title">Presets</div>
          <div class="flex gap-8" style="flex-wrap:wrap;" id="sg-presets"></div>
        </div>
      </div>
    </div>
  `;

  const previewBox = container.querySelector('#sg-preview-box');
  const codeEl     = container.querySelector('#sg-code');
  const copyBtn    = container.querySelector('#sg-copy-btn');
  const addBtn     = container.querySelector('#sg-add-btn');
  const layersList = container.querySelector('#sg-layers-list');

  const xSlider    = container.querySelector('#sg-x');
  const ySlider    = container.querySelector('#sg-y');
  const blurSlider = container.querySelector('#sg-blur');
  const spreadSlider = container.querySelector('#sg-spread');
  const colorPicker = container.querySelector('#sg-color-picker');
  const colorText  = container.querySelector('#sg-color-text');
  const insetCheck = container.querySelector('#sg-inset');

  const presets = [
    { name: 'None',    layers: [{ id:1, enabled:true, x:0,y:0,blur:0,spread:0,color:'rgba(0,0,0,0)',inset:false }] },
    { name: 'Subtle',  layers: [{ id:1, enabled:true, x:0,y:1,blur:3,spread:0,color:'rgba(0,0,0,0.2)',inset:false }] },
    { name: 'Soft',    layers: [{ id:1, enabled:true, x:0,y:4,blur:16,spread:0,color:'rgba(0,0,0,0.25)',inset:false }] },
    { name: 'Medium',  layers: [{ id:1, enabled:true, x:0,y:8,blur:24,spread:-4,color:'rgba(0,0,0,0.35)',inset:false }] },
    { name: 'Large',   layers: [{ id:1, enabled:true, x:0,y:16,blur:48,spread:-8,color:'rgba(0,0,0,0.4)',inset:false }] },
    { name: 'Layered', layers: [
      { id:1, enabled:true, x:0,y:1,blur:2,spread:0,color:'rgba(0,0,0,0.2)',inset:false },
      { id:2, enabled:true, x:0,y:8,blur:24,spread:-4,color:'rgba(0,0,0,0.2)',inset:false },
    ]},
    { name: 'Glow',    layers: [{ id:1, enabled:true, x:0,y:0,blur:20,spread:4,color:'rgba(99,102,241,0.5)',inset:false }] },
    { name: 'Inset',   layers: [{ id:1, enabled:true, x:0,y:2,blur:6,spread:-2,color:'rgba(0,0,0,0.5)',inset:true }] },
  ];

  function getSelected() {
    return layers.find(l => l.id === selectedId);
  }

  function updatePreview() {
    const css = shadowToCSS(layers);
    previewBox.style.boxShadow = css || 'none';
    const fullCss = `box-shadow: ${css || 'none'};`;
    codeEl.textContent = fullCss;
  }

  function updateControls() {
    const layer = getSelected();
    if (!layer) return;
    xSlider.value = layer.x;
    ySlider.value = layer.y;
    blurSlider.value = layer.blur;
    spreadSlider.value = layer.spread;
    colorText.value = layer.color;
    insetCheck.checked = layer.inset;
    container.querySelector('#sg-x-val').textContent = layer.x;
    container.querySelector('#sg-y-val').textContent = layer.y;
    container.querySelector('#sg-blur-val').textContent = layer.blur;
    container.querySelector('#sg-spread-val').textContent = layer.spread;
  }

  function renderLayers() {
    layersList.innerHTML = '';
    layers.forEach(layer => {
      const el = document.createElement('div');
      el.className = `shadow-layer${layer.id === selectedId ? ' active' : ''}`;
      el.innerHTML = `
        <div class="shadow-layer-header">
          <div class="layer-color-dot" style="background:${layer.color};border:1px solid var(--color-border);"></div>
          <span style="font-size:12px;font-weight:500;flex:1;">Layer ${layer.id}${layer.inset?' (inset)':''}</span>
          <label style="cursor:pointer;display:flex;align-items:center;gap:4px;font-size:11px;color:var(--color-text-muted);">
            <input type="checkbox" ${layer.enabled ? 'checked' : ''} class="layer-toggle" data-id="${layer.id}" />
            Visible
          </label>
          ${layers.length > 1 ? `<button class="btn btn-ghost btn-sm layer-delete" data-id="${layer.id}" title="Remove">✕</button>` : ''}
        </div>
      `;
      el.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox' || e.target.classList.contains('layer-delete')) return;
        selectedId = layer.id;
        renderLayers();
        updateControls();
      });
      el.querySelector('.layer-toggle').addEventListener('change', (e) => {
        layer.enabled = e.target.checked;
        updatePreview();
      });
      const delBtn = el.querySelector('.layer-delete');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          layers = layers.filter(l => l.id !== layer.id);
          if (selectedId === layer.id) selectedId = layers[0]?.id;
          renderLayers();
          updateControls();
          updatePreview();
        });
      }
      layersList.appendChild(el);
    });
  }

  function renderPresets() {
    const presetsEl = container.querySelector('#sg-presets');
    presets.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = p.name;
      btn.addEventListener('click', () => {
        layers = p.layers.map(l => ({ ...l }));
        selectedId = layers[0].id;
        nextId = Math.max(...layers.map(l => l.id)) + 1;
        renderLayers();
        updateControls();
        updatePreview();
      });
      presetsEl.appendChild(btn);
    });
  }

  addBtn.addEventListener('click', () => {
    const newLayer = { id: nextId++, enabled: true, x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.2)', inset: false };
    layers.push(newLayer);
    selectedId = newLayer.id;
    renderLayers();
    updateControls();
    updatePreview();
  });

  copyBtn.addEventListener('click', () => copyToClipboard(codeEl.textContent, '✓ Copied!'));

  [
    [xSlider, 'x', '#sg-x-val'],
    [ySlider, 'y', '#sg-y-val'],
    [blurSlider, 'blur', '#sg-blur-val'],
    [spreadSlider, 'spread', '#sg-spread-val'],
  ].forEach(([el, prop, valId]) => {
    el.addEventListener('input', () => {
      const layer = getSelected();
      if (!layer) return;
      layer[prop] = parseInt(el.value);
      container.querySelector(valId).textContent = el.value;
      updatePreview();
      renderLayers();
    });
  });

  colorText.addEventListener('input', () => {
    const layer = getSelected();
    if (!layer) return;
    layer.color = colorText.value;
    updatePreview();
    renderLayers();
  });

  colorPicker.addEventListener('input', () => {
    colorText.value = colorPicker.value;
    const layer = getSelected();
    if (!layer) return;
    layer.color = colorPicker.value;
    updatePreview();
    renderLayers();
  });

  insetCheck.addEventListener('change', () => {
    const layer = getSelected();
    if (!layer) return;
    layer.inset = insetCheck.checked;
    updatePreview();
    renderLayers();
  });

  renderPresets();
  renderLayers();
  updateControls();
  updatePreview();
}
