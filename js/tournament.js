// Turnuva modu, bracket
// ============================================================
// 🏟️ TURNUVA
// ============================================================
function generateTournamentData() {
  const players = [username];
  const used = new Set([username]);
  while(players.length < 8) {
    const n = randomAnimalName();
    if (!used.has(n)) { used.add(n); players.push(n); }
  }
  const qfMatches = [
    { p1: players[0], p2: players[1], winner: null, score1: null, score2: null },
    { p1: players[2], p2: players[3], winner: null, score1: null, score2: null },
    { p1: players[4], p2: players[5], winner: null, score1: null, score2: null },
    { p1: players[6], p2: players[7], winner: null, score1: null, score2: null },
  ];
  return {
    players,
    rounds: [
      { name: 'Çeyrek Final', matches: qfMatches, totalRounds: 7 },
      { name: 'Yarı Final', matches: [], totalRounds: 14 },
      { name: 'Final', matches: [], totalRounds: 21 },
    ],
    currentRound: 0,
    playerMatchIdx: 0,
    eliminated: false,
    champion: null,
  };
}

function simulateBotMatch(bot1, bot2, rounds) {
  let s1=0, s2=0;
  for(let i=0;i<rounds;i++){
    const c1 = Math.random()<0.55?'share':'steal';
    const c2 = Math.random()<0.5?'share':'steal';
    let mult=1;
    if(rounds===7&&i===4) mult=2;
    if(rounds===14&&i===6) mult=2;
    if(rounds===21&&(i===4||i===16)) mult=2;
    if(c1==='share'&&c2==='share'){s1+=3*mult;s2+=3*mult;}
    else if(c1==='share'&&c2==='steal'){s1+=1*mult;s2+=5*mult;}
    else if(c1==='steal'&&c2==='share'){s1+=5*mult;s2+=1*mult;}
    else{s1-=1*mult;s2-=1*mult;}
  }
  return {winner: s1>=s2?bot1:bot2, score1:s1, score2:s2};
}

function openTournamentMode() {
  document.getElementById('tournamentModal').style.display='flex';
  tournamentData = generateTournamentData();
  renderTournamentBracketModal();
}
function closeTournamentModal() { document.getElementById('tournamentModal').style.display='none'; }

function renderTournamentBracketModal() {
  const el = document.getElementById('tournamentBracket');
  const td = tournamentData;
  if (!td) { el.innerHTML=''; return; }
  let html = '';
  td.rounds.forEach((rnd, ri) => {
    html += `<div class="bracket-round-label">🏁 ${rnd.name} (${rnd.totalRounds} Tur)</div>`;
    if (ri === 0) {
      rnd.matches.forEach((m, mi) => {
        const isPlayerMatch = m.p1 === username || m.p2 === username;
        html += `<div class="bracket-match">
          <div class="bracket-player ${m.p1===username?'current-user':''} ${m.winner===m.p1?'winner':''} ${m.winner&&m.winner!==m.p1?'loser':''}">${m.p1}</div>
          <div class="bracket-vs">vs</div>
          <div class="bracket-player ${m.p2===username?'current-user':''} ${m.winner===m.p2?'winner':''} ${m.winner&&m.winner!==m.p2?'loser':''}">${m.p2}</div>
          ${m.winner?`<div class="bracket-score">${m.score1??'?'}-${m.score2??'?'}</div>`:''}
        </div>`;
      });
    } else {
      for(let i=0;i<(ri===1?2:1);i++){
        const m = rnd.matches[i];
        if(m){
          html+=`<div class="bracket-match">
            <div class="bracket-player ${m.p1===username?'current-user':''} ${m.winner===m.p1?'winner':''} ${m.winner&&m.winner!==m.p1?'loser':''}">${m.p1}</div>
            <div class="bracket-vs">vs</div>
            <div class="bracket-player ${m.p2===username?'current-user':''} ${m.winner===m.p2?'winner':''} ${m.winner&&m.winner!==m.p2?'loser':''}">${m.p2}</div>
            ${m.winner?`<div class="bracket-score">${m.score1??'?'}-${m.score2??'?'}</div>`:''}
          </div>`;
        } else {
          html+=`<div class="bracket-match"><div class="bracket-player" style="opacity:0.4;">TBD</div><div class="bracket-vs">vs</div><div class="bracket-player" style="opacity:0.4;">TBD</div></div>`;
        }
      }
    }
  });
  el.innerHTML = html;
}

function startTournament() {
  if (goldCoins<2) { alert("Yeterli altın yok! Turnuva için 2 🪙 gerekli."); return; }
  goldCoins-=2; localStorage.setItem('goldCoins',goldCoins); updateGoldDisplay();
  isTournamentMode=true;
  isLevelMode=false;
  closeTournamentModal();
  playTournamentMatch();
}

function playTournamentMatch() {
  const td = tournamentData;
  const rndData = td.rounds[td.currentRound];
  rndData.matches.forEach((m, mi) => {
    if (m.winner) return;
    const isPlayerMatch = m.p1===username || m.p2===username;
    if (!isPlayerMatch) {
      const res = simulateBotMatch(m.p1, m.p2, rndData.totalRounds);
      m.winner=res.winner; m.score1=res.score1; m.score2=res.score2;
    }
  });
  const pMatch = rndData.matches.find(m => m.p1===username || m.p2===username);
  if (!pMatch) { tournamentEliminated(); return; }
  const opponent = pMatch.p1===username ? pMatch.p2 : pMatch.p1;
  const lvls = [[1,5,10],[8,12,16],[18,19,20]];
  const lvl = lvls[td.currentRound][Math.floor(Math.random()*3)];
  selectedLevel = lvl;
  currentTotalRounds = rndData.totalRounds;
  targetScore = rndData.totalRounds===7?17:rndData.totalRounds===14?34:51;
  showTournamentBanner(`🏟️ ${rndData.name} — vs ${opponent}`);
  document.getElementById('hudBotName').textContent = opponent;
  initGame();
}

function showTournamentBanner(text) {
  const b = document.getElementById('tournamentBanner');
  b.textContent = text;
  b.style.display = 'block';
}

function continueTournament() {
  document.getElementById('continueTournamentBtn').style.display='none';
  const td = tournamentData;
  const rndData = td.rounds[td.currentRound];
  const pMatch = rndData.matches.find(m => m.p1===username || m.p2===username);
  if (!pMatch) return;

  if (td.eliminated) {
    tournamentEliminated();
    return;
  }

  const allDone = rndData.matches.every(m=>m.winner);
  if (!allDone) return;

  const winners = rndData.matches.map(m=>m.winner);
  td.currentRound++;

  if (td.currentRound > 2) {
    tournamentChampion();
    return;
  }

  const nextRnd = td.rounds[td.currentRound];
  const nextMatches = [];
  for (let i=0;i<winners.length;i+=2) {
    nextMatches.push({ p1:winners[i], p2:winners[i+1], winner:null, score1:null, score2:null });
  }
  nextRnd.matches = nextMatches;

  const pInNext = nextMatches.some(m=>m.p1===username||m.p2===username);
  if (!pInNext) { tournamentEliminated(); return; }

  exitToMenu();
  openTournamentMode_Continue();
}

function openTournamentMode_Continue() {
  setTimeout(()=>{
    document.getElementById('tournamentModal').style.display='flex';
    renderTournamentBracketModal();
    const startBtn = document.querySelector('#tournamentModal .action-btn');
    if(startBtn){ startBtn.textContent=`Sıradaki Maçı Oyna`; startBtn.onclick=()=>{ closeTournamentModal(); playTournamentMatch(); }; }
  },200);
}

function tournamentEliminated() {
  isTournamentMode=false;
  alert("Turnuvadan elendin! Daha iyi şanslar. 🙁");
  exitToMenu();
}
function tournamentChampion() {
  isTournamentMode=false;
  goldCoins += 20; // 10 yerine 20
  localStorage.setItem('goldCoins', goldCoins);
  updateGoldDisplay();
  alert("🏆 TURNUVA ŞAMPİYONUSUN! 20 🪙 kazandın!");
  exitToMenu();
}
