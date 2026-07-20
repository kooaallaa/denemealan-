// Tema sistemi, market, SVG önizlemeler
// ============================================================
// 🎨 TEMALAR (MARKET)
// ============================================================
const THEMES = {
  default: { name: 'Varsayılan', desc: 'Defterli klasik görünüm', price: 0, emoji: '📓', class: '' },
  karakalem: { name: 'Karakalem', desc: 'Koyu, dramatik çizim stili', price: 113, emoji: '✏️', class: 'theme-karakalem' },
  fusir: { name: 'Füşır ✨', desc: 'Futuristik neon geometri', price: 225, emoji: '💜', class: 'theme-fusir' },
  cyberpunk: { name: 'Cyberpunk', desc: 'Karanlık şehir, neon ışıklar', price: 301, emoji: '🤖', class: 'theme-cyberpunk' },
  minecraft: { name: 'Minecraft', desc: 'Piksel bloklu retro dünya', price: 404, emoji: '⛏️', class: 'theme-minecraft' },
};

function applyTheme(themeKey) {
  const body = document.body;
  Object.values(THEMES).forEach(t => { if(t.class) body.classList.remove(t.class); });
  const t = THEMES[themeKey];
  if (t && t.class) body.classList.add(t.class);
  activeTheme = themeKey;
  localStorage.setItem('activeTheme', themeKey);
}

function openMarketModal() {
  renderMarketGrid();
  document.getElementById('marketGoldAmt').textContent = goldCoins;
  document.getElementById('marketModal').style.display = 'flex';
}
function closeMarketModal() { document.getElementById('marketModal').style.display = 'none'; }

function getThemePreviewSVG(key) {
  const configs = {
    default: {
      card: '#fffdf5', ink: '#2e2b3d', gold: '#e3ab3d', share: '#2f8f5b', steal: '#d1483c',
      titleText: '#2e2b3d', titleBg: 'rgba(227,171,61,0.55)',
      bgEl: `
        <rect width="300" height="90" fill="#f5efe0"/>
        ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${i*15+10}" x2="300" y2="${i*15+10}" stroke="#bcd6ea" stroke-width="0.8"/>`).join('')}
        <line x1="22" y1="0" x2="22" y2="90" stroke="#e2a49f" stroke-width="1.5" opacity="0.6"/>
      `
    },
    karakalem: {
      card: '#242424', ink: '#e8e8e8', gold: '#c8a830', share: '#228855', steal: '#cc3333',
      titleText: '#e8e8e8', titleBg: 'rgba(200,168,48,0.35)',
      bgEl: `
        <rect width="300" height="90" fill="#1c1c1c"/>
        <radialGradient id="kk_g1" cx="20%" cy="30%" r="50%"><stop offset="0%" stop-color="#505050" stop-opacity="0.2"/><stop offset="100%" stop-color="#505050" stop-opacity="0"/></radialGradient>
        <radialGradient id="kk_g2" cx="80%" cy="70%" r="45%"><stop offset="0%" stop-color="#383838" stop-opacity="0.18"/><stop offset="100%" stop-color="#383838" stop-opacity="0"/></radialGradient>
        <rect width="300" height="90" fill="url(#kk_g1)"/>
        <rect width="300" height="90" fill="url(#kk_g2)"/>
      `
    },
    fusir: {
      card: '#0a0020', ink: '#f0e0ff', gold: '#ff88ff', share: '#00ffaa', steal: '#ff2266',
      titleText: '#ff88ff', titleBg: 'rgba(255,0,255,0.25)',
      bgEl: `
        <rect width="300" height="90" fill="#05001a"/>
        <radialGradient id="fs_g1" cx="25%" cy="20%" r="55%"><stop offset="0%" stop-color="#b400ff" stop-opacity="0.3"/><stop offset="100%" stop-color="#b400ff" stop-opacity="0"/></radialGradient>
        <radialGradient id="fs_g2" cx="78%" cy="80%" r="50%"><stop offset="0%" stop-color="#00c8ff" stop-opacity="0.22"/><stop offset="100%" stop-color="#00c8ff" stop-opacity="0"/></radialGradient>
        <rect width="300" height="90" fill="url(#fs_g1)"/>
        <rect width="300" height="90" fill="url(#fs_g2)"/>
        ${Array.from({length:6},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="90" stroke="#ff00ff" stroke-width="0.5" opacity="0.12"/>`).join('')}
        ${Array.from({length:4},(_,i)=>`<line x1="0" y1="${i*25}" x2="300" y2="${i*25}" stroke="#00ffff" stroke-width="0.5" opacity="0.1"/>`).join('')}
        <line x1="0" y1="90" x2="300" y2="0" stroke="#ff00ff" stroke-width="0.6" opacity="0.08"/>
        <line x1="0" y1="0" x2="300" y2="90" stroke="#00ffff" stroke-width="0.6" opacity="0.08"/>
      `
    },
    cyberpunk: {
      card: '#0e0e00', ink: '#ffff00', gold: '#ff8800', share: '#00ff44', steal: '#ff4400',
      titleText: '#ff8800', titleBg: 'rgba(255,68,0,0.28)',
      bgEl: `
        <rect width="300" height="90" fill="#080808"/>
        <radialGradient id="cp_g1" cx="50%" cy="0%" r="65%"><stop offset="0%" stop-color="#ff8800" stop-opacity="0.18"/><stop offset="100%" stop-color="#ff8800" stop-opacity="0"/></radialGradient>
        <radialGradient id="cp_g2" cx="100%" cy="100%" r="45%"><stop offset="0%" stop-color="#00ff44" stop-opacity="0.12"/><stop offset="100%" stop-color="#00ff44" stop-opacity="0"/></radialGradient>
        <rect width="300" height="90" fill="url(#cp_g1)"/>
        <rect width="300" height="90" fill="url(#cp_g2)"/>
        ${Array.from({length:8},(_,i)=>`<line x1="${i*40}" y1="0" x2="${i*40}" y2="90" stroke="#ffff00" stroke-width="0.3" opacity="0.08"/>`).join('')}
      `
    },
    minecraft: {
      card: '#6b5b4b', ink: '#ffffaa', gold: '#ffaa00', share: '#55aa33', steal: '#cc3333',
      titleText: '#ffff55', titleBg: 'rgba(0,0,0,0)',
      bgEl: `
        <rect width="300" height="90" fill="#5a4a3a"/>
        ${Array.from({length:10},(_,i)=>`<line x1="0" y1="${i*9}" x2="300" y2="${i*9}" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>`).join('')}
        ${Array.from({length:20},(_,i)=>`<line x1="${i*15}" y1="0" x2="${i*15}" y2="90" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>`).join('')}
        <rect x="0" y="75" width="300" height="15" fill="rgba(85,170,51,0.3)"/>
        <rect x="0" y="76" width="300" height="1" fill="rgba(85,170,51,0.5)"/>
      `
    }
  };
  const c = configs[key] || configs.default;
  const W = 300, H = 90;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="theme-preview">
    <defs></defs>
    ${c.bgEl}
    <rect x="55" y="7" width="130" height="21" rx="4" fill="${c.titleBg}"/>
    <text x="120" y="22" text-anchor="middle" font-family="Kalam,cursive" font-size="13" font-weight="bold" fill="${c.titleText}">The Game Theory</text>
    <text x="8" y="22" font-family="sans-serif" font-size="10" fill="${c.gold}">🪙 42</text>
    <circle cx="230" cy="17" r="8" fill="${c.card}" stroke="${c.ink}" stroke-width="1.2"/>
    <text x="230" y="21" text-anchor="middle" font-size="8">❓</text>
    <circle cx="249" cy="17" r="8" fill="${c.card}" stroke="${c.ink}" stroke-width="1.2"/>
    <text x="249" y="21" text-anchor="middle" font-size="8">🛒</text>
    <circle cx="268" cy="17" r="8" fill="${c.card}" stroke="${c.ink}" stroke-width="1.2"/>
    <text x="268" y="21" text-anchor="middle" font-size="8">⚙️</text>
    <rect x="14" y="34" width="272" height="48" rx="7" fill="${c.card}" stroke="${c.ink}" stroke-width="1.5"/>
    <circle cx="68" cy="58" r="13" fill="${c.gold}" stroke="${c.ink}" stroke-width="1"/>
    <text x="68" y="62" text-anchor="middle" font-size="11">🪙</text>
    <rect x="96" y="48" width="72" height="20" rx="5" fill="${c.steal}" stroke="${c.ink}" stroke-width="1"/>
    <text x="132" y="62" text-anchor="middle" font-family="Kalam,cursive" font-size="11" font-weight="bold" fill="#fff">ÇAL</text>
    <rect x="178" y="48" width="82" height="20" rx="5" fill="${c.share}" stroke="${c.ink}" stroke-width="1"/>
    <text x="219" y="62" text-anchor="middle" font-family="Kalam,cursive" font-size="11" font-weight="bold" fill="#fff">PAYLAŞ</text>
    <text x="132" y="44" text-anchor="middle" font-family="Patrick Hand,cursive" font-size="8" fill="${c.ink}">Sen: <tspan font-weight="bold" fill="${c.share}">7</tspan></text>
    <text x="219" y="44" text-anchor="middle" font-family="Patrick Hand,cursive" font-size="8" fill="${c.ink}">Bot: <tspan font-weight="bold" fill="${c.steal}">5</tspan></text>
  </svg>`;
}

function renderMarketGrid() {
  const grid = document.getElementById('marketGrid');
  grid.innerHTML = Object.entries(THEMES).map(([key, t]) => {
    const owned = ownedThemes.includes(key);
    const isActive = activeTheme === key;
    let btnLabel, btnClass, btnDisabled;
    if (isActive) { btnLabel = '✓ Aktif'; btnClass = 'owned'; btnDisabled = 'disabled'; }
    else if (owned) { btnLabel = 'Seç'; btnClass = 'owned'; btnDisabled = ''; }
    else { btnLabel = `${t.price} 🪙`; btnClass = ''; btnDisabled = goldCoins < t.price ? 'disabled' : ''; }

    return `<div class="market-item">
      <div class="market-item-top">
        <div class="market-item-info">
          <div class="market-item-name">${t.emoji} ${t.name}</div>
          <div class="market-item-desc">${t.desc}</div>
        </div>
        <button class="market-price-btn ${btnClass}" ${btnDisabled}
          onclick="buyOrSelectTheme('${key}')">${btnLabel}</button>
      </div>
      ${getThemePreviewSVG(key)}
    </div>`;
  }).join('');
}

function buyOrSelectTheme(key) {
  const t = THEMES[key];
  if (!t) return;
  if (ownedThemes.includes(key)) {
    applyTheme(key);
    renderMarketGrid();
    return;
  }
  if (goldCoins < t.price) { alert("Yeterli altın yok!"); return; }
  goldCoins -= t.price;
  localStorage.setItem('goldCoins', goldCoins);
  ownedThemes.push(key);
  localStorage.setItem('ownedThemes', JSON.stringify(ownedThemes));
  updateGoldDisplay();
  applyTheme(key);
  renderMarketGrid();
  document.getElementById('marketGoldAmt').textContent = goldCoins;
}
