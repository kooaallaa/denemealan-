// Başarılar, ses sistemi
// ============================================================
// 📖 KILAVUZ
// ============================================================
function openGuideModal() { document.getElementById('guideModal').style.display = 'flex'; }
function closeGuideModal() { document.getElementById('guideModal').style.display = 'none'; }

// ============================================================
// 🎖️ BAŞARIMLAR (Ünvan = Başarım Adı)
// ============================================================
const ACHIEVEMENTS = {
  coldStart:     { id:'coldStart',     name:'Soğuk Bir Başlangıç', desc:'Seviyeli modda herhangi bir seviyeyi ilk kez kazandın.',   title:'Soğuk Bir Başlangıç' },
  unlucky13:     { id:'unlucky13',     name:'Uğursuz 13',           desc:'Seviyeli modda 13. Seviyeyi yenerek geçtin.',              title:'Uğursuz 13' },
  finisher:      { id:'finisher',      name:'Bitirici',              desc:'Seviyeli modda 20. Seviyeyi tamamlayıp oyunu bitirdin!',  title:'Bitirici' },
  dirty7:        { id:'dirty7',        name:"Pis 7'li",              desc:"7 turluk maçta bottan fazla puan topladın ama genel skor hedefine ulaşamadın.", title:"Pis 7'li" },
  unluckyDouble: { id:'unluckyDouble', name:'Talihsiz',              desc:'14 turluk hızlı maçta çift puan turunu kazandın fakat maçı kaybettin.', title:'Talihsiz' },
  doubleOkay:    { id:'doubleOkay',    name:'Çift Okey',             desc:"21 turluk oyunda iki çift puan turunda da 10'ar puan kazandın.", title:'Çift Okey' },
  topThree:      { id:'topThree',      name:'Zirve Yolcusu',         desc:'Liderlik tablosunda herhangi bir kategoride ilk 3\'e girdin.', title:'Zirve Yolcusu' },
  topOne:        { id:'topOne',        name:'Zirvenin Ta Kendisi',   desc:'Liderlik tablosunda 1. oldun.',                            title:'Zirvenin Ta Kendisi' },
  vizier:        { id:'vizier',        name:'Vezir',                  desc:'Krallar listesinde ilk 3\'e girdin.',                     title:'Vezir' },
  king:          { id:'king',          name:'Kral',                   desc:"Krallar listesinde 1. oldun.",                            title:'Kral' },
};

function checkAchievements() {
  const prev = { ...achievements };

  if (isLevelMode && youScore > botScore && youScore >= targetScore && !prev.coldStart) {
    achievements.coldStart = true;
    showAchievementNotification(ACHIEVEMENTS.coldStart);
  }
  if (isLevelMode && selectedLevel === 13 && youScore >= targetScore && !prev.unlucky13) {
    achievements.unlucky13 = true;
    showAchievementNotification(ACHIEVEMENTS.unlucky13);
  }
  if (level20Completed && !prev.finisher) {
    achievements.finisher = true;
    showAchievementNotification(ACHIEVEMENTS.finisher);
  }
  if (!isLevelMode && !isTournamentMode && currentTotalRounds === 7
      && youScore > botScore && youScore < targetScore && !prev.dirty7) {
    achievements.dirty7 = true;
    showAchievementNotification(ACHIEVEMENTS.dirty7);
  }
  if (!isLevelMode && !isTournamentMode && currentTotalRounds === 14 && !prev.unluckyDouble) {
    const doubleIdx = 6;
    if (playerHistory[doubleIdx] === 'steal' && botHistory[doubleIdx] === 'share') {
      if (youScore < botScore) {
        achievements.unluckyDouble = true;
        showAchievementNotification(ACHIEVEMENTS.unluckyDouble);
      }
    }
  }
  if (!isLevelMode && !isTournamentMode && currentTotalRounds === 21 && !prev.doubleOkay) {
    const d1 = playerHistory[4] === 'steal' && botHistory[4] === 'share';
    const d2 = playerHistory[16] === 'steal' && botHistory[16] === 'share';
    if (d1 && d2) {
      achievements.doubleOkay = true;
      showAchievementNotification(ACHIEVEMENTS.doubleOkay);
    }
  }

  localStorage.setItem('achievements', JSON.stringify(achievements));
}

function showAchievementNotification(ach) {
  const n = document.getElementById('achievementNotification');
  n.innerHTML = `🎖️ <b>${ach.name}</b><br><span style="font-size:11px;">${ach.desc}</span><br><span style="font-size:11px;opacity:0.8;">Ünvan: "${ach.title}"</span>`;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 4000);
}

function loadAchievementsList() {
  const list = document.getElementById('achievementsList');
  const keys = Object.keys(achievements);
  if (keys.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-soft);">Henüz hiç başarım kazanmadın.</div>';
    return;
  }
  let html = '<div style="display:flex;flex-direction:column;gap:8px;">';
  for (const [key, ach] of Object.entries(ACHIEVEMENTS)) {
    if (achievements[key]) {
      html += `<div class="table-item" style="background:var(--gold);border-radius:8px;">
        <div><b>${ach.name}</b><br><span style="font-size:10px;">${ach.desc}</span></div>
        <button class="close-modal-btn" style="font-size:10px;padding:4px 8px;" onclick="selectTitle('${ach.title}')">Ünvanı Seç</button>
      </div>`;
    } else {
      html += `<div class="table-item" style="opacity:0.4;">
        <div><b>???</b><br><span style="font-size:10px;">Gizli Başarım</span></div>
      </div>`;
    }
  }
  html += '</div>';
  list.innerHTML = html;
}

function selectTitle(title) {
  selectedTitle = title;
  localStorage.setItem('selectedTitle', title);
  alert(`"${title}" ünvanı seçildi!`);
}

// ============================================================
// 🎵 MÜZİK
// ============================================================
function initMusic() {
  if (musicStarted) return;
  musicStarted = true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicMasterGain = audioCtx.createGain();
    musicMasterGain.gain.value = isMuted ? 0 : (volumeLevel/100)*0.18;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 1800;
    musicMasterGain.connect(filter); filter.connect(audioCtx.destination);
    [261.63,329.63,392.00].forEach((freq,i) => {
      const osc = audioCtx.createOscillator(); osc.type='triangle'; osc.frequency.value=freq;
      const ng = audioCtx.createGain(); ng.gain.value=0.07;
      const lfo = audioCtx.createOscillator(); lfo.type='sine'; lfo.frequency.value=0.045+i*0.021;
      const lg = audioCtx.createGain(); lg.gain.value=0.05;
      lfo.connect(lg); lg.connect(ng.gain); lfo.start();
      osc.connect(ng); ng.connect(musicMasterGain); osc.start();
    });
    scheduleArpeggio();
  } catch(e) {}
}
function scheduleArpeggio() {
  if (!audioCtx) return;
  const scale=[392,440,523.25,587.33,659.25];
  const note=scale[Math.floor(Math.random()*scale.length)];
  const osc=audioCtx.createOscillator(); osc.type='sine'; osc.frequency.value=note;
  const ng=audioCtx.createGain(); const now=audioCtx.currentTime;
  ng.gain.setValueAtTime(0,now); ng.gain.linearRampToValueAtTime(0.05,now+0.6); ng.gain.linearRampToValueAtTime(0,now+3.5);
  osc.connect(ng); ng.connect(musicMasterGain); osc.start(now); osc.stop(now+3.7);
  setTimeout(scheduleArpeggio, 4000+Math.random()*4000);
}
function toggleMute() {
  isMuted=!isMuted; localStorage.setItem('muted',isMuted);
  document.getElementById('muteToggleBtn').textContent=isMuted?'🔇':'🔊';
  if(musicMasterGain) musicMasterGain.gain.value=isMuted?0:(volumeLevel/100)*0.18;
}
function setVolume(v) {
  volumeLevel=parseInt(v); localStorage.setItem('volumeLevel',volumeLevel);
  if(!isMuted&&musicMasterGain) musicMasterGain.gain.value=(volumeLevel/100)*0.18;
}

