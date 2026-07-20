// Sabitler, bot stratejileri verisi, global değişkenler
// ============================================================
// 🌐 FIREBASE
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCDXpbVlu8KPR0nPumTcBV9gemyzwkZtGQ",
  authDomain: "gametheory-koalasfirst.firebaseapp.com",
  projectId: "gametheory-koalasfirst",
  storageBucket: "gametheory-koalasfirst.firebasestorage.app",
  messagingSenderId: "453446948489",
  appId: "1:453446948489:web:3338a534af6dfc0e84d858"
};
let db = null, isFirebaseReady = false;
try {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseReady = true;
  }
} catch(e) { console.error("Firebase hatası:", e); }

// ============================================================
// ⚙️ STATE
// ============================================================
const CIRC = 176;
let username = localStorage.getItem('username') || "";
let usernameClaimed = localStorage.getItem('usernameClaimed') === 'true';
let maxUnlockedLevel = parseInt(localStorage.getItem('maxUnlockedLevel')) || 1;
let level20Completed = localStorage.getItem('level20Completed') === 'true';
let selectedLevel = 1;
let currentTotalRounds = 7;
let targetScore = 17;
let isLevelMode = false;
let isTournamentMode = false;
let tournamentRound = 0;
let tournamentData = null;
let pendingTournamentContinue = false;
let goldCoins = parseInt(localStorage.getItem('goldCoins')) || 0;
let selectedTitle = localStorage.getItem('selectedTitle') || '';
let achievements = JSON.parse(localStorage.getItem('achievements')) || {};
let ownedThemes = JSON.parse(localStorage.getItem('ownedThemes')) || ['default'];
let activeTheme = localStorage.getItem('activeTheme') || 'default';
let isPaused = false;
let pauseTimeLeft = 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let isMuted = localStorage.getItem('muted') === 'true';
let volumeLevel = parseInt(localStorage.getItem('volumeLevel'));
if (isNaN(volumeLevel)) volumeLevel = 40;
let audioCtx = null, musicMasterGain = null, musicStarted = false;

let round = 0, youScore = 0, botScore = 0, timeLeft = 20;
let timerInterval = null, decided = false;
let playerHistory = [], botHistory = [];
let scoreHistoryPlayer = [0], scoreHistoryBot = [0];

// Kazanma serileri (tur sayısına göre ayrı)
let winStreaks = JSON.parse(localStorage.getItem('winStreaks')) || { 7: 0, 14: 0, 21: 0 };

// Hayvan isimleri - turnuva botları için (sayısız, saf isimler)
const ANIMAL_NAMES = [
  "Tilki","Kaplan","Kurt","Ayı","Kartal","Aslan","Panter","Kobra",
  "Çakal","Vaşak","Sırtlan","Boğa","Akrep","Timsah","Jaguar","Atmaca"
];
function randomAnimalName() {
  return ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
}
