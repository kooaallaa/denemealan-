// Oyun döngüsü, tur yönetimi, grafik
// ============================================================
function setMode(turns, btn) {
  document.querySelectorAll('.select-group .select-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentTotalRounds=turns;
  if(turns===7) targetScore=17;
  else if(turns===14) targetScore=34;
  else if(turns===21) targetScore=51;
}

function startQuickMatch() {
  if(!usernameClaimed||!username){ alert("Önce ismini doğrulamalısın!"); return; }
  selectedLevel=Math.floor(Math.random()*20)+1;
  isLevelMode=false; isTournamentMode=false;
  document.getElementById('hudBotName').textContent='Yapay Zeka';
  initGame();
}

function startLevelMatch() {
  if(!usernameClaimed||!username){ alert("Önce ismini doğrulamalısın!"); return; }
  currentTotalRounds=14; targetScore=34;
  isLevelMode=true; isTournamentMode=false;
  closeLevelModal();
  document.getElementById('hudBotName').textContent='Yapay Zeka';
  initGame();
}

function initGame() {
  document.getElementById('hudPlayerName').textContent=username;
  document.getElementById('pNameText').textContent=username;
  const tb=document.getElementById('hudTitleBadge');
  if(selectedTitle){ tb.textContent=`"${selectedTitle}"`; tb.style.display='block'; } else { tb.style.display='none'; }
  document.getElementById('menuScreen').style.display='none';
  document.getElementById('gameScreen').style.display='block';
  round=0; youScore=0; botScore=0; playerHistory=[]; botHistory=[];
  scoreHistoryPlayer=[0]; scoreHistoryBot=[0];
  document.getElementById('youScore').textContent='0';
  document.getElementById('botScore').textContent='0';
  document.getElementById('botStatus').textContent='Nötr';
  document.getElementById('botStatus').className='bot-status-container neutral';
  document.getElementById('log').innerHTML='';
  document.getElementById('continueTournamentBtn').style.display='none';
  document.getElementById('finalArea').style.display='none';
  document.getElementById('resultArea').style.display='none';
  document.getElementById('playArea').style.display='block';
  document.body.classList.remove('outcome-win','outcome-lose','outcome-draw','double-mode');

  showBotDialog();
  startRound();
}

function showBotDialog() {
  const d=document.getElementById('botDialog');
  if(!isLevelMode){ d.style.display='none'; return; }
  d.textContent=`"${BOT_STRATEGIES[selectedLevel].getQuote()}"`;
  d.style.display='block';
}

function startRound() {
  round++;
  if(round>currentTotalRounds){ return endGame(); }

  decided=false;
  if(!isPaused) timeLeft=20;

  let isDouble=false;
  if(currentTotalRounds===7&&round===5) isDouble=true;
  else if(currentTotalRounds===14&&round===7) isDouble=true;
  else if(currentTotalRounds===21&&(round===5||round===17)) isDouble=true;

  const rp=document.getElementById('roundPill');
  const sp=document.getElementById('stagePanel');
  const tc=document.getElementById('timerCircle');

  if(isDouble){
    document.body.classList.add('double-mode');
    sp.classList.add('double-active'); rp.classList.add('double-active');
    rp.innerHTML=`⚡ Tur ${round}/${currentTotalRounds} (X2!)`;
  } else {
    document.body.classList.remove('double-mode');
    sp.classList.remove('double-active'); rp.classList.remove('double-active');
    rp.textContent=`Tur ${round}/${currentTotalRounds}`;
  }

  document.getElementById('prompt').textContent='Kararını ver.';
  document.getElementById('stealBtn').disabled=false;
  document.getElementById('shareBtn').disabled=false;
  document.getElementById('playArea').style.display='block';
  document.getElementById('resultArea').style.display='none';

  const startTime = isPaused ? pauseTimeLeft : 20;
  timeLeft = startTime;
  tc.style.strokeDashoffset = CIRC - (timeLeft/20)*CIRC;
  document.getElementById('timerNum').textContent=timeLeft;
  isPaused=false;

  if(timerInterval) clearInterval(timerInterval);

  timerInterval=setInterval(()=>{
    timeLeft--;
    document.getElementById('timerNum').textContent=timeLeft;
    const pct=(timeLeft/20)*CIRC;
    tc.style.strokeDashoffset=CIRC-pct;
    if(timeLeft<=0){ clearInterval(timerInterval); makeChoice(Math.random()<0.5?'steal':'share'); }
  },1000);
}

function pauseGame() {
  if(decided) return;
  isPaused=true;
  pauseTimeLeft=timeLeft;
  clearInterval(timerInterval);
  timerInterval=null;
  document.getElementById('pauseModal').style.display='flex';
}

function resumeGame() {
  document.getElementById('pauseModal').style.display='none';
  round--;
  startRound();
}

function exitToMenuFromPause() {
  clearInterval(timerInterval); timerInterval=null;
  isPaused=false;
  document.getElementById('pauseModal').style.display='none';
  document.getElementById('gameScreen').style.display='none';
  document.getElementById('finalArea').style.display='none';
  document.getElementById('menuScreen').style.display='flex';
  document.body.classList.remove('outcome-win','outcome-lose','outcome-draw','double-mode');
  isTournamentMode=false;
  document.getElementById('tournamentBanner').style.display='none';
  loadLeaderboardByRound(currentTotalRounds);
  loadLocalHistory();
}

function makeChoice(playerChoice) {
  if(decided) return;
  decided=true;
  clearInterval(timerInterval); timerInterval=null;
  const coin=document.getElementById('coin');
  coin.classList.add('spin');
  setTimeout(()=>{ coin.classList.remove('spin'); processRoundResult(playerChoice); },900);
}

function processRoundResult(playerChoice) {
  const botChoice=BOT_STRATEGIES[selectedLevel].decide();
  playerHistory.push(playerChoice); botHistory.push(botChoice);

  let mult=1;
  if(currentTotalRounds===7&&round===5) mult=2;
  else if(currentTotalRounds===14&&round===7) mult=2;
  else if(currentTotalRounds===21&&(round===5||round===17)) mult=2;

  let pE=0,bE=0;
  if(playerChoice==='share'&&botChoice==='share'){pE=3*mult;bE=3*mult;}
  else if(playerChoice==='share'&&botChoice==='steal'){pE=1*mult;bE=5*mult;}
  else if(playerChoice==='steal'&&botChoice==='share'){pE=5*mult;bE=1*mult;}
  else{pE=-1*mult;bE=-1*mult;}

  youScore+=pE; botScore+=bE;
  scoreHistoryPlayer.push(youScore); scoreHistoryBot.push(botScore);

  document.getElementById('youScore').textContent=youScore;
  document.getElementById('botScore').textContent=botScore;

  const log=document.getElementById('log');
  const dot=document.createElement('div');
  dot.className=`log-dot ${playerChoice}`; log.appendChild(dot);

  const bs=document.getElementById('botStatus');
  if(playerChoice==='steal'){ bs.textContent='Kızgın'; bs.className='bot-status-container angry'; }
  else if(playerChoice==='share'&&botChoice==='share'){ bs.textContent='Dost'; bs.className='bot-status-container trust'; }
  else{ bs.textContent='Nötr'; bs.className='bot-status-container neutral'; }

  document.getElementById('youChoiceText').textContent=playerChoice==='share'?'PAYLAŞTI':'ÇALDI';
  document.getElementById('youChoiceText').style.color=playerChoice==='share'?'var(--share-dark)':'var(--steal-dark)';
  document.getElementById('botChoiceText').textContent=botChoice==='share'?'PAYLAŞTI':'ÇALDI';
  document.getElementById('botChoiceText').style.color=botChoice==='share'?'var(--share-dark)':'var(--steal-dark)';
  document.getElementById('pointsText').innerHTML=`Bu elde: <b>${pE>=0?'+':''}${pE}</b> | Bot: <b>${bE>=0?'+':''}${bE}</b>`;
  document.getElementById('playArea').style.display='none';
  document.getElementById('resultArea').style.display='block';
  showBotDialog();

  setTimeout(()=>startRound(),4000);
}

// ============================================================
// 🏁 OYUN SONU
// ============================================================
function endGame() {
  document.getElementById('playArea').style.display='none';
  document.getElementById('resultArea').style.display='none';
  document.getElementById('finalArea').style.display='block';
  document.getElementById('tournamentBanner').style.display='none';

  // Puan barajı kontrolü - hızlı eşleşmelerde
  let outcome=youScore>botScore?'win':youScore<botScore?'lose':'draw';
  if(!isLevelMode && !isTournamentMode) {
    if(youScore < targetScore) {
      outcome='lose';
    }
  }
  
  const ft=document.getElementById('finalTitle');
  ft.classList.remove('win','lose','draw'); ft.classList.add(outcome);
  ft.textContent=outcome==='win'?'KAZANDINIZ! 🎉':outcome==='lose'?'KAYBETTİNİZ 😔':'BERABERE 🤝';

  document.body.classList.remove('outcome-win','outcome-lose','outcome-draw','double-mode');
  document.body.classList.add('outcome-'+outcome);

  const youCoop = playerHistory.length>0 ? Math.round(playerHistory.filter(h=>h==='share').length/playerHistory.length*100) : 0;
  const botCoop = botHistory.length>0 ? Math.round(botHistory.filter(h=>h==='share').length/botHistory.length*100) : 0;
  document.getElementById('statYouCoop').textContent=youCoop+'%';
  document.getElementById('statBotCoop').textContent=botCoop+'%';

  drawMiniChart();

  const container=document.getElementById('historyVisualContainer');
  container.innerHTML=playerHistory.map((p,idx)=>`
    <div class="visual-history-item">
      <span style="color:var(--gold);font-weight:700;">T${idx+1}</span>
      <span style="color:${p==='share'?'var(--share-dark)':'var(--steal-dark)'}">${p==='share'?'🤝':'⚔️'}</span>
      <span style="color:${botHistory[idx]==='share'?'var(--share-dark)':'var(--steal-dark)'}">${botHistory[idx]==='share'?'🤝':'⚔️'}</span>
    </div>`).join('');

  document.getElementById('statBotStrategy').textContent=BOT_STRATEGIES[selectedLevel].name;

  const sm=document.getElementById('statMission');
  if(isLevelMode) {
    if(youScore>=targetScore) {
      sm.textContent=`BAŞARILI! (${targetScore} puan hedefine ulaştın)`;
      sm.style.color='var(--share-dark)';
      if(selectedLevel===maxUnlockedLevel&&maxUnlockedLevel<20){
        maxUnlockedLevel++;
        localStorage.setItem('maxUnlockedLevel',maxUnlockedLevel);
      }
      if(selectedLevel===20&&!level20Completed){
        level20Completed=true;
        localStorage.setItem('level20Completed','true');
      }
    } else {
      sm.textContent=`BAŞARISIZ! (Hedef: ${targetScore} puan, Senin: ${youScore})`;
      sm.style.color='var(--steal-dark)';
    }
  } else if(isTournamentMode) {
    const td=tournamentData;
    const rndData=td.rounds[td.currentRound];
    const pMatch=rndData.matches.find(m=>m.p1===username||m.p2===username);
    if(pMatch){
      pMatch.winner=outcome==='win'?username:(pMatch.p1===username?pMatch.p2:pMatch.p1);
      pMatch.score1=pMatch.p1===username?youScore:botScore;
      pMatch.score2=pMatch.p2===username?youScore:botScore;
    }
    if(outcome==='win'){
      rndData.matches.forEach(m=>{
        if(!m.winner){
          const r=simulateBotMatch(m.p1,m.p2,rndData.totalRounds);
          m.winner=r.winner; m.score1=r.score1; m.score2=r.score2;
        }
      });
      const nextRoundIdx=td.currentRound+1;
      if(nextRoundIdx>2){
        sm.textContent='🏆 Turnuvayı Kazandın!'; sm.style.color='var(--share-dark)';
        setTimeout(tournamentChampion,1500);
      } else {
        const nextName=td.rounds[nextRoundIdx].name;
        sm.textContent=`✅ Geçtİn! Sıradaki: ${nextName}`; sm.style.color='var(--share-dark)';
        document.getElementById('continueTournamentBtn').style.display='inline-block';
      }
    } else {
      sm.textContent='Turnuvadan elendin! 🙁'; sm.style.color='var(--steal-dark)';
      td.eliminated=true;
      setTimeout(tournamentEliminated,1500);
    }
  } else {
    if(youScore >= targetScore) {
      sm.textContent=`BAŞARILI! ${targetScore} puan barajını aştın. Skorun: ${youScore}`;
      sm.style.color='var(--share-dark)';
      let gr=currentTotalRounds===7?1:currentTotalRounds===14?2:3;
      goldCoins+=gr; localStorage.setItem('goldCoins',goldCoins);
      sm.textContent+=` (+${gr} 🪙)`; updateGoldDisplay();
    } else {
      sm.textContent=`BAŞARISIZ! ${targetScore} puan barajına ulaşamadın. Skorun: ${youScore}`;
      sm.style.color='var(--steal-dark)';
    }
  }

  checkAchievements();
  saveToFirebaseAndLocal();
}

function drawMiniChart() {
  const svg=document.getElementById('miniChartSvg');
  svg.innerHTML='';
  const W=300,H=80,PAD=10;
  const all=[...scoreHistoryPlayer,...scoreHistoryBot];
  const minV=Math.min(...all),maxV=Math.max(...all);
  const range=maxV-minV||1;
  const toX=i=>(PAD+(i/(scoreHistoryPlayer.length-1||1))*(W-2*PAD));
  const toY=v=>(H-PAD-((v-minV)/range)*(H-2*PAD));

  const makePath=(hist,color)=>{
    if(hist.length<2) return;
    let d=`M${toX(0)},${toY(hist[0])}`;
    for(let i=1;i<hist.length;i++) d+=` L${toX(i)},${toY(hist[i])}`;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',d); p.setAttribute('stroke',color);
    p.setAttribute('stroke-width','2.5'); p.setAttribute('fill','none');
    p.setAttribute('stroke-linecap','round'); p.setAttribute('stroke-linejoin','round');
    svg.appendChild(p);
  };
  const zl=document.createElementNS('http://www.w3.org/2000/svg','line');
  zl.setAttribute('x1',PAD); zl.setAttribute('y1',toY(0));
  zl.setAttribute('x2',W-PAD); zl.setAttribute('y2',toY(0));
  zl.setAttribute('stroke','rgba(46,43,61,0.15)'); zl.setAttribute('stroke-width','1'); zl.setAttribute('stroke-dasharray','4,3');
  svg.appendChild(zl);

  makePath(scoreHistoryPlayer,'#1f6b44');
  makePath(scoreHistoryBot,'#a3352b');

  const mkL=(x,color,label)=>{
    const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x',x); r.setAttribute('y',H-8); r.setAttribute('width',10); r.setAttribute('height',4);
    r.setAttribute('fill',color); r.setAttribute('rx','2'); svg.appendChild(r);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x+13); t.setAttribute('y',H-4);
    t.setAttribute('font-size','9'); t.setAttribute('fill','currentColor'); t.setAttribute('font-family','Patrick Hand,sans-serif');
    t.textContent=label; svg.appendChild(t);
  };
  mkL(PAD,'#1f6b44','Sen'); mkL(PAD+60,'#a3352b','Bot');
}

// ============================================================
// 💾 KAYIT
