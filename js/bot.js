// Bot karar algoritmaları, turnuva botu
// ============================================================
// 🤖 BOT STRATEJİLERİ
// ============================================================
const BOT_STRATEGIES = {
  1:{ name:"Hayırsever Rahip - Seviye 1", decide:()=>Math.random()<0.90?'share':'steal',
    quotes:["Barış ve cömertlik bu masanın tek kurtuluşudur.","Paylaşmak ruhun en yüce erdemidir.","Merhamet en büyük güçtür.","Kalbim temiz, niyetim barış."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  2:{ name:"Sabırlı Kütüphaneci - Seviye 2", decide:()=>{if(playerHistory.length<2)return'share';return(playerHistory[playerHistory.length-1]==='steal'&&playerHistory[playerHistory.length-2]==='steal')?'steal':'share';},
    quotes:["Kitaplar ikinci şans verilmesi gerektiğini yazar.","Tarih tekerrürden ibarettir.","Bilgelik acele etmemeyi gerektirir."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  3:{ name:"Sokak Kumarbazı - Seviye 3", decide:()=>Math.random()<0.5?'steal':'share',
    quotes:["Zarlar atıldı!","Hayat bir kumardır.","Risk almazsan kazanamazsın."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  4:{ name:"Kopya Kedisi - Seviye 4", decide:()=>{if(playerHistory.length===0)return'share';if(Math.random()<0.10)return playerHistory[playerHistory.length-1]==='steal'?'share':'steal';return playerHistory[playerHistory.length-1];},
    quotes:["Ayna gibi davranırım.","Ne verirsen onu alırsın.","Sahne ışıkları altında gerçekler kaybolur."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  5:{ name:"Kibar Diplomat - Seviye 5", decide:()=>playerHistory.length===0?'share':playerHistory[playerHistory.length-1],
    quotes:["Diplomasi karşılıklı saygı üzerine kuruludur.","Ben barıştan yanayım.","Misilleme yapmak zorunda kalabilirim."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  6:{ name:"Kurnaz Avukat - Seviye 6", decide:()=>{if(playerHistory.length===0)return'steal';if(playerHistory.length===1)return playerHistory[0]==='steal'?'share':'steal';return playerHistory[playerHistory.length-1];},
    quotes:["Sözleşmedeki boşlukları iyi bilirim.","Delilleri inceledim, kararımı verdim.","İtiraz ediyorum!"],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  7:{ name:"Borsa Analisti - Seviye 7", decide:()=>{if(playerHistory.length<3)return'share';const r=playerHistory.slice(-4);return(r.filter(h=>h==='steal').length>r.length/2)?'steal':'share';},
    quotes:["Grafikler stabil görünüyor.","Piyasa dalgalı, dikkatli olmalıyız.","Risk-getiri oranını hesapladım."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  8:{ name:"Dedektif - Seviye 8", decide:()=>{const p=['share','steal','share','share'];if(playerHistory.length<4)return p[playerHistory.length];return playerHistory.includes('steal')?playerHistory[playerHistory.length-1]:'steal';},
    quotes:["Her suçlu bir iz bırakır.","Elementer, sevgili dostum!","Büyüteçle inceliyorum."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  9:{ name:"Yırtıcı Avcı - Seviye 9", decide:()=>Math.random()<0.90?'steal':'share',
    quotes:["Zayıflara bu ormanda yer yok.","Avımı asla kaçırmam.","Güçlü olan kazanır."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  10:{ name:"Demir Leydi - Seviye 10", decide:()=>playerHistory.length<3?'share':(playerHistory.filter(h=>h==='steal').length>1?'steal':'share'),
    quotes:["Taviz vermek zayıflıktır.","Demir iradeyle yönetirim bu masayı.","Bu bir savaş."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  11:{ name:"Gizemli Simyacı - Seviye 11", decide:()=>Math.random()<0.4?'steal':'share',
    quotes:["Elementlerin dengesi bozulmamalı.","Simya sırlarla doludur.","Doğru formülü bulursam her şey mümkün."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  12:{ name:"Korsan Kaptan - Seviye 12", decide:()=>playerHistory.length===0?'steal':(playerHistory[playerHistory.length-1]==='steal'?'steal':'share'),
    quotes:["Yarrr! Hazine benim olacak!","Korsanlar paylaşmaz yağmalar!","Altınlarımı korumak için her şeyi yaparım."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  13:{ name:"Medyum - Seviye 13", decide:()=>{if(playerHistory.length<2)return'share';return Math.random()<0.6?'share':'steal';},
    quotes:["Ruhlar bana geleceği fısıldıyor...","Altıncı hissim asla yanılmaz.","Sezgilerim güçlüdür."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  14:{ name:"Robot - Seviye 14", decide:()=>{if(playerHistory.length===0)return'share';const p=playerHistory.join('');if(p.length>11&&p.slice(-12)==='stealstealsteal')return'steal';return'share';},
    quotes:["Hesaplama modu aktif.","Algoritma güncellendi. Tehdit algılandı.","Binary düşünürüm: 0 veya 1."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  15:{ name:"Şövalye - Seviye 15", decide:()=>playerHistory.length<5?'share':(playerHistory[playerHistory.length-1]==='steal'?'steal':'share'),
    quotes:["Şövalye yemini ettim: Adil olacağım.","Dürüstlük en büyük silahtır.","Düello başlasın!"],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  16:{ name:"Gölge Suikastçı - Seviye 16", decide:()=>Math.random()<0.7?'steal':'share',
    quotes:["Gölgelerde saklanırım.","Sessizlik ölümün habercisidir.","Karanlıkta kimse beni göremez."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  17:{ name:"Filozof - Seviye 17", decide:()=>{const s=playerHistory.filter(h=>h==='steal').length;return s>playerHistory.length/2?'steal':'share';},
    quotes:["Etik ve ahlak bu masada sınanır.","Özgür irade, en büyük yanılgıdır.","Platon'un mağarasındayız."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  18:{ name:"Büyücü - Seviye 18", decide:()=>{if(playerHistory.length<2)return'share';return playerHistory[playerHistory.length-1]===playerHistory[playerHistory.length-2]?'steal':'share';},
    quotes:["Abrakadabra! Puanların yok olsun!","Büyücülük sırlarla doludur.","Büyü her zaman işe yaramaz."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  19:{ name:"Asi Lider - Seviye 19", decide:()=>playerHistory.includes('steal')?'steal':'share',
    quotes:["Sisteme karşıyım! Kuralları yıkalım!","Ya benimlesin ya da karşımdasın.","İsyan ateşini ben yaktım."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
  20:{ name:"Efsanevi General - Seviye 20", decide:()=>{if(playerHistory.length<4)return'share';const l=playerHistory.slice(-4);return l.filter(h=>h==='steal').length>=2?'steal':'share';},
    quotes:["Savaş meydanında zafer benimdir.","Strateji olmadan savaş kazanılmaz.","Tarih kitapları bu zaferi yazacak."],
    getQuote(){return this.quotes[Math.floor(Math.random()*this.quotes.length)]}},
};
function makeTournamentBotDecide(aggressiveness) {
  return () => Math.random() < aggressiveness ? 'steal' : 'share';
}

// ============================================================
// 🌐 INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggle').checked = true;
  }
  applyTheme(activeTheme);
  document.getElementById('volumeSlider').value = volumeLevel;
  document.getElementById('muteToggleBtn').textContent = isMuted ? '🔇' : '🔊';
  updateGoldDisplay();

  if (!username || !usernameClaimed) {
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('menuScreen').style.display = 'none';
  } else {
    document.getElementById('usernameInput').value = username;
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('menuScreen').style.display = 'flex';
    loadLeaderboardByRound(7);
    loadLocalHistory();
    loadAchievementsList();
  }
});
document.addEventListener('click', initMusic, { once: true });

