import './style.css';
import { createColorPalette }       from './tools/colorPalette.js';
import { createShadowGenerator }    from './tools/shadowGenerator.js';
import { createGradientGenerator }  from './tools/gradientGenerator.js';
import { createBorderRadiusVisualizer } from './tools/borderRadius.js';
import { createTypographyScale }    from './tools/typographyScale.js';
import { createSpacingScale }       from './tools/spacingScale.js';

// ── Tool registry ──────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: 'home',
    label: 'Home',
    icon: '⬡',
    section: null,
    description: 'All UI design tools',
  },
  {
    id: 'color-palette',
    label: 'Color Palette',
    icon: '🎨',
    section: 'Color',
    description: 'Generate color scales, harmonies & check contrast',
    init: createColorPalette,
  },
  {
    id: 'gradient',
    label: 'Gradient',
    icon: '🌈',
    section: 'Color',
    description: 'Create linear, radial, and conic CSS gradients',
    init: createGradientGenerator,
  },
  {
    id: 'shadow',
    label: 'Box Shadow',
    icon: '🟦',
    section: 'Effects',
    description: 'Multi-layer CSS box-shadow generator',
    init: createShadowGenerator,
  },
  {
    id: 'border-radius',
    label: 'Border Radius',
    icon: '⬜',
    section: 'Effects',
    description: 'Visualize and export CSS border-radius values',
    init: createBorderRadiusVisualizer,
  },
  {
    id: 'typography',
    label: 'Type Scale',
    icon: 'Aa',
    section: 'Typography',
    description: 'Modular typography scale with ratio presets',
    init: createTypographyScale,
  },
  {
    id: 'spacing',
    label: 'Spacing Scale',
    icon: '↔',
    section: 'Layout',
    description: 'Design system spacing scale generator',
    init: createSpacingScale,
  },
];

// ── App render ─────────────────────────────────────────────────────────────
const app = document.getElementById('app');

app.innerHTML = `
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <div class="logo-dots">
              <div class="logo-dot" style="background:#f472b6;"></div>
              <div class="logo-dot" style="background:#34d399;"></div>
              <div class="logo-dot" style="background:#fbbf24;"></div>
              <div class="logo-dot" style="background:#60a5fa;"></div>
            </div>
          </div>
          <div class="logo-text">
            <span class="logo-title">Defode</span>
            <span class="logo-subtitle">Designs for Devs</span>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav" id="sidebar-nav"></nav>
    </aside>

    <!-- Main area -->
    <main class="main-content" id="main-content"></main>
  </div>
`;

// ── Build sidebar navigation ───────────────────────────────────────────────
const navEl = document.getElementById('sidebar-nav');
const sections = {};

TOOLS.forEach(tool => {
  if (tool.section === null) {
    // Home link
    const item = document.createElement('div');
    item.className = 'nav-item active';
    item.dataset.tool = tool.id;
    item.innerHTML = `<span class="nav-icon">${tool.icon}</span>${tool.label}`;
    navEl.appendChild(item);
    return;
  }

  if (!sections[tool.section]) {
    const sec = document.createElement('div');
    sec.className = 'nav-section';
    sec.innerHTML = `<div class="nav-section-title">${tool.section}</div>`;
    sections[tool.section] = sec;
    navEl.appendChild(sec);
  }

  const item = document.createElement('div');
  item.className = 'nav-item';
  item.dataset.tool = tool.id;
  item.innerHTML = `<span class="nav-icon">${tool.icon}</span>${tool.label}`;
  sections[tool.section].appendChild(item);
});

// ── Build pages ────────────────────────────────────────────────────────────
const mainEl = document.getElementById('main-content');
const pages = {};
const initialized = new Set();

// Home page
const homePage = document.createElement('div');
homePage.className = 'page active';
homePage.id = 'page-home';
homePage.innerHTML = `
  <div class="page-header">
    <div class="page-title">Defode — UI Design Toolkit</div>
    <div class="page-description">Tools to help developers design and implement beautiful UIs faster</div>
  </div>
  <div class="page-body">
    <div class="home-grid" id="home-tool-grid"></div>
  </div>
`;
mainEl.appendChild(homePage);
pages['home'] = homePage;

// Tool pages
TOOLS.filter(t => t.init).forEach(tool => {
  const page = document.createElement('div');
  page.className = 'page';
  page.id = `page-${tool.id}`;
  page.innerHTML = `
    <div class="page-header">
      <div class="page-title">${tool.icon} ${tool.label}</div>
      <div class="page-description">${tool.description}</div>
    </div>
    <div class="page-body">
      <div class="tool-container"></div>
    </div>
  `;
  mainEl.appendChild(page);
  pages[tool.id] = page;
});

// ── Populate home grid ─────────────────────────────────────────────────────
const homeGrid = document.getElementById('home-tool-grid');
TOOLS.filter(t => t.init).forEach(tool => {
  const card = document.createElement('div');
  card.className = 'tool-card';
  card.dataset.tool = tool.id;
  card.innerHTML = `
    <div class="tool-card-icon">${tool.icon}</div>
    <div class="tool-card-name">${tool.label}</div>
    <div class="tool-card-desc">${tool.description}</div>
  `;
  homeGrid.appendChild(card);
});

// ── Navigation logic ───────────────────────────────────────────────────────
function navigate(toolId) {
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === toolId);
  });

  // Show/hide pages
  Object.entries(pages).forEach(([id, page]) => {
    page.classList.toggle('active', id === toolId);
  });

  // Lazy-initialize tools
  if (toolId !== 'home' && !initialized.has(toolId)) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (tool?.init) {
      const container = pages[toolId].querySelector('.tool-container');
      tool.init(container);
      initialized.add(toolId);
    }
  }

  // Scroll to top
  mainEl.scrollTop = 0;
  window.scrollTo(0, 0);
}

// Sidebar clicks
navEl.addEventListener('click', (e) => {
  const item = e.target.closest('[data-tool]');
  if (item) navigate(item.dataset.tool);
});

// Home card clicks
homeGrid.addEventListener('click', (e) => {
  const card = e.target.closest('[data-tool]');
  if (card) navigate(card.dataset.tool);
});
