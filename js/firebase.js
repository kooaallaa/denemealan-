// Firebase kayıt, liderboard, geçmiş
// ============================================================
function saveToFirebaseAndLocal() {
  // isLevelMode kontrolü kaldırıldı, her maç kaydedilsin
  let botNameRecord = isTournamentMode 
    ? document.getElementById('hudBotName').textContent 
    : BOT_STRATEGIES[selectedLevel].name;

  const rec = {
    username, score: youScore, botScore, rounds: currentTotalRounds,
    botName: botNameRecord, timestamp: Date.now()
  };
  let lh = JSON.parse(localStorage.getItem('matchHistory')) || [];
  lh.unshift(rec);
  localStorage.setItem('matchHistory', JSON.stringify(lh.slice(0, 30)));

  if (isFirebaseReady && db) {
    db.collection('scores').add(rec)
      .then(() => checkLeaderboardAchievements())
      .catch(e => console.error(e));
  }
}

function checkLeaderboardAchievements() {
  if(!isFirebaseReady||!db) return;
  db.collection('scores').where('rounds','==',currentTotalRounds)
    .orderBy('score','desc').limit(10).get()
    .then(snap=>{
      const docs=snap.docs.map(d=>d.data());
      const idxMe=docs.findIndex(d=>d.username===username);
      if(idxMe>=0&&idxMe<3&&!achievements.topThree){ achievements.topThree=true; showAchievementNotification(ACHIEVEMENTS.topThree); localStorage.setItem('achievements',JSON.stringify(achievements)); }
      if(idxMe===0&&!achievements.topOne){ achievements.topOne=true; showAchievementNotification(ACHIEVEMENTS.topOne); localStorage.setItem('achievements',JSON.stringify(achievements)); }
    }).catch(()=>{
      db.collection('scores').where('rounds','==',currentTotalRounds).limit(200).get().then(snap=>{
        const sorted=snap.docs.map(d=>d.data()).sort((a,b)=>b.score-a.score).slice(0,10);
        const idxMe=sorted.findIndex(d=>d.username===username);
        if(idxMe>=0&&idxMe<3&&!achievements.topThree){ achievements.topThree=true; showAchievementNotification(ACHIEVEMENTS.topThree); localStorage.setItem('achievements',JSON.stringify(achievements)); }
        if(idxMe===0&&!achievements.topOne){ achievements.topOne=true; showAchievementNotification(ACHIEVEMENTS.topOne); localStorage.setItem('achievements',JSON.stringify(achievements)); }
      });
    });
  db.collection('scores').get().then(snap=>{
    let wm={};
    snap.docs.forEach(d=>{const dt=d.data();if(dt.score>dt.botScore)wm[dt.username]=(wm[dt.username]||0)+1;});
    const sw=Object.keys(wm).map(n=>({username:n,wins:wm[n]})).sort((a,b)=>b.wins-a.wins);
    const mi=sw.findIndex(w=>w.username===username);
    if(mi>=0&&mi<3&&!achievements.vizier){achievements.vizier=true;showAchievementNotification(ACHIEVEMENTS.vizier);localStorage.setItem('achievements',JSON.stringify(achievements));}
    if(mi===0&&!achievements.king){achievements.king=true;showAchievementNotification(ACHIEVEMENTS.king);localStorage.setItem('achievements',JSON.stringify(achievements));}
  });
}

// ============================================================
// 📜 GEÇMİŞ & LİDERLİK
// ============================================================
function loadLocalHistory() {
  const el=document.getElementById('historyList');
  const lh=JSON.parse(localStorage.getItem('matchHistory'))||[];
  if(lh.length===0){ el.innerHTML='<div style="text-align:center;padding:20px;color:var(--ink-soft);">Henüz hiç maç oynamadın.</div>'; return; }
  el.innerHTML=lh.map(h=>`
    <div class="table-item">
      <div>
        <span class="table-name">vs ${h.botName.split(" - ")[0]}</span>
        <div class="table-sub">${h.rounds} Tur | ${new Date(h.timestamp).toLocaleDateString()}</div>
      </div>
      <div class="table-score" style="color:${h.score>=h.botScore?'var(--share-dark)':'var(--steal-dark)'}">
        ${h.score} - ${h.botScore}
      </div>
    </div>`).join('');
}

function loadLeaderboardByRound(rounds) {
  document.querySelectorAll('.sub-filters .sub-filter-btn').forEach(b=>b.classList.remove('active'));
  const btnMap={7:'sub7Btn',14:'sub14Btn',21:'sub21Btn'};
  if(btnMap[rounds]) document.getElementById(btnMap[rounds]).classList.add('active');
  const el=document.getElementById('globalList');
  if(!isFirebaseReady){ el.innerHTML='<div style="text-align:center;padding:15px;color:var(--ink-soft);font-size:12px;">Firebase bağlantısı yok.</div>'; return; }
  el.innerHTML='<div style="text-align:center;padding:20px;color:var(--ink-soft);">Yükleniyor...</div>';

  const query = db.collection('scores').where('rounds','==',rounds);
  (isFirebaseReady ? query.orderBy('score','desc').limit(10).get() : Promise.reject())
    .then(snap=>{
      if(snap.size===0){ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-soft);">${rounds} Tur için rekor yok. İlk sen ol!</div>`; return; }
      let idx=1;
      el.innerHTML=snap.docs.map(d=>{
        const dt=d.data();
        return `<div class="table-item">
          <div><span style="color:var(--gold-dark);font-weight:700;margin-right:8px;">#${idx++}</span> <span class="table-name">${dt.username}</span></div>
          <div class="table-score">${dt.score} <span style="font-size:10px;color:var(--pencil);font-weight:normal;">(${dt.botName.split(" - ")[0]})</span></div>
        </div>`;
      }).join('');
    })
    .catch(()=>{
      db.collection('scores').where('rounds','==',rounds).limit(200).get()
        .then(snap=>{
          if(snap.size===0){ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-soft);">${rounds} Tur için rekor yok.</div>`; return; }
          const sorted=snap.docs.map(d=>d.data()).sort((a,b)=>b.score-a.score).slice(0,10);
          let idx=1;
          el.innerHTML=sorted.map(d=>`<div class="table-item">
            <div><span style="color:var(--gold-dark);font-weight:700;margin-right:8px;">#${idx++}</span> <span class="table-name">${d.username}</span></div>
            <div class="table-score">${d.score} <span style="font-size:10px;color:var(--pencil);font-weight:normal;">(${d.botName.split(" - ")[0]})</span></div>
          </div>`).join('');
        })
        .catch(()=>{ el.innerHTML='<div style="text-align:center;padding:10px;color:var(--steal-dark);font-size:11px;">Skor yüklenemedi.</div>'; });
    });
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-link').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
  if(tabId==='tabWinners') loadWinnersTab();
  else if(tabId==='tabAchievements') loadAchievementsList();
  else if(tabId==='tabHistory') loadLocalHistory();
}

function loadWinnersTab() {
  const el=document.getElementById('winnersList');
  if(!isFirebaseReady){ el.innerHTML='<div style="text-align:center;padding:15px;color:var(--ink-soft);font-size:12px;">Firebase bağlantısı yok.</div>'; return; }
  el.innerHTML='<div style="text-align:center;padding:20px;color:var(--ink-soft);">Yükleniyor...</div>';
  db.collection('scores').get().then(snap=>{
    if(!snap || snap.size === 0){ el.innerHTML='<div style="text-align:center;padding:20px;color:var(--ink-soft);">Kraliyet koltuğu henüz boş!</div>'; return; }
    let wm={};
    snap.docs.forEach(d=>{const dt=d.data();if(dt.score>dt.botScore)wm[dt.username]=(wm[dt.username]||0)+1;});
    const sw=Object.keys(wm).map(n=>({username:n,wins:wm[n]})).sort((a,b)=>b.wins-a.wins).slice(0, 10); // 10 kişi göster
    if(sw.length===0){ el.innerHTML='<div style="text-align:center;padding:20px;color:var(--ink-soft);">Yapay zekayı yenebilen henüz çıkmadı!</div>'; return; }
    let idx=1;
    el.innerHTML=sw.map(w=>`<div class="table-item">
      <div><span style="color:#d4af37;font-weight:700;margin-right:8px;">👑 #${idx++}</span> <span class="table-name">${w.username}</span></div>
      <div class="table-score" style="color:var(--gold-dark);">${w.wins} Galibiyet</div>
    </div>`).join('');
  }).catch(()=>{ el.innerHTML='<div style="text-align:center;padding:15px;color:var(--steal-dark);">Yüklenirken hata oluştu.</div>'; });
}

function exitToMenu() {
  clearInterval(timerInterval); timerInterval=null;
  document.getElementById('gameScreen').style.display='none';
  document.getElementById('finalArea').style.display='none';
  document.getElementById('menuScreen').style.display='flex';
  document.body.classList.remove('outcome-win','outcome-lose','outcome-draw','double-mode');
  document.getElementById('tournamentBanner').style.display='none';
  updateGoldDisplay();
  loadLeaderboardByRound(currentTotalRounds);
  loadLocalHistory();
  loadAchievementsList();
}
