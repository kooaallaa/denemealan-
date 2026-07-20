// Ayarlar, gold gösterimi, oyuna giriş
function updateGoldDisplay() {
  document.getElementById('goldAmount').textContent = goldCoins;
}
function toggleDarkTheme() {
  isDarkMode = document.getElementById('themeToggle').checked;
  document.body.classList.toggle('dark-theme', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
}
function openSettingsModal() { document.getElementById('settingsModal').style.display='flex'; }
function closeSettingsModal() { document.getElementById('settingsModal').style.display='none'; }

// ============================================================
// 🔑 İSİM DOĞRULAMA
// ============================================================
async function verifyAndClaimName(screen) {
  const inputId  = screen==='welcome'?'welcomeUsernameInput':'usernameInput';
  const statusId = screen==='welcome'?'welcomeNameStatus':'menuNameStatus';
  const btnId    = screen==='welcome'?'welcomeCheckBtn':'menuCheckBtn';
  const val = document.getElementById(inputId).value.trim();
  const st  = document.getElementById(statusId);
  const btn = document.getElementById(btnId);
  st.textContent=''; st.className='name-status-msg';
  if (!val) { st.textContent='Boş bırakamazsın!'; st.classList.add('error'); return; }
  if (['oyuncu','yapay zeka'].includes(val.toLowerCase())) { st.textContent='Bu ismi seçemezsin.'; st.classList.add('error'); return; }
  if (usernameClaimed && val===username) { st.textContent='Bu zaten senin ismin. ✓'; st.classList.add('success'); return; }
  btn.disabled=true; st.textContent='Kontrol ediliyor...'; st.classList.add('success');
  if (!isFirebaseReady||!db) {
    username=val; usernameClaimed=true;
    localStorage.setItem('username',username); localStorage.setItem('usernameClaimed','true');
    st.textContent='Çevrimdışı Onaylandı! ✓'; st.className='name-status-msg success';
    btn.disabled=false;
    if(screen==='welcome') document.getElementById('welcomeStartBtn').style.display='block';
    return;
  }
  const nameKey=val.toLowerCase();
  try {
    const doc=await db.collection('usernames').doc(nameKey).get();
    if(doc.exists){ st.textContent='Bu isim alınmış!'; st.className='name-status-msg error'; if(screen==='welcome') document.getElementById('welcomeStartBtn').style.display='none'; }
    else {
      await db.collection('usernames').doc(nameKey).set({display:val,claimedAt:Date.now()});
      username=val; usernameClaimed=true;
      localStorage.setItem('username',username); localStorage.setItem('usernameClaimed','true');
      st.textContent='Harika! Onaylandı. ✓'; st.className='name-status-msg success';
      if(screen==='welcome') document.getElementById('welcomeStartBtn').style.display='block';
    }
  } catch(e) {
    username=val; usernameClaimed=true;
    localStorage.setItem('username',username); localStorage.setItem('usernameClaimed','true');
    st.textContent='Geçici onay (Yerel mod)'; st.className='name-status-msg success';
    if(screen==='welcome') document.getElementById('welcomeStartBtn').style.display='block';
  } finally { btn.disabled=false; }
}
function tryEnterGame() {
  if (usernameClaimed&&username) {
    document.getElementById('welcomeScreen').style.display='none';
    document.getElementById('menuScreen').style.display='flex';
    document.getElementById('usernameInput').value=username;
    loadLeaderboardByRound(7); loadLocalHistory(); loadAchievementsList();
    if (!localStorage.getItem('guideShown')) { openGuideModal(); localStorage.setItem('guideShown','true'); }
  }
}

// ============================================================
// 🏆 SEVİYE MODAL
// ============================================================
function openLevelModal() { renderLevelGrid(); document.getElementById('levelModal').style.display='flex'; }
function closeLevelModal() { document.getElementById('levelModal').style.display='none'; }
function renderLevelGrid() {
  const grid=document.getElementById('levelGrid'); grid.innerHTML='';
  for(let i=1;i<=20;i++){
    const btn=document.createElement('button'); btn.className='level-btn';
    if(i>maxUnlockedLevel){ btn.classList.add('locked'); btn.disabled=true; }
    else {
      btn.textContent=i;
      if(i===selectedLevel) btn.classList.add('active');
      btn.onclick=()=>{ document.querySelectorAll('.level-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); selectedLevel=i; };
    }
    grid.appendChild(btn);
  }
}

