// --- CONFIG ---
const facts = [
    "I have geckos that are louder than my alarm clock.",
    "I own a Kriss Vector airsoft gun.",
    "I code things and sometimes finish them.",
    "I want to build an ultralight aircraft.",
    "My cat Trick is always hungry.",
    "I'm learning backend security right now!"
];

// --- TIME & BIRTHDAY ---
function updateTime() {
    const laTime = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric', minute: 'numeric', hour12: true
    });
    document.getElementById('laTime').textContent = laTime;
}

function updateBirthday() {
    const today = new Date();
    let target = new Date(today.getFullYear(), 10, 17); // Nov 17
    if (today > target) target.setFullYear(today.getFullYear() + 1);
    const diff = Math.ceil((target - today) / (1000 * 3600 * 24));
    document.getElementById("days").textContent = diff;
}

setInterval(updateTime, 1000);
updateTime();
updateBirthday();

// --- TYPEWRITER ---
const typeEl = document.getElementById("typewriter-word");
const words = ["Im Penn", "Im William"];
let wIdx = 0, cIdx = 0, isDeleting = false;

function typeLoop() {
    const current = words[wIdx];
    if (isDeleting) {
        cIdx--;
    } else {
        cIdx++;
    }
    
    typeEl.textContent = current.slice(0, cIdx);

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && cIdx === current.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && cIdx === 0) {
        isDeleting = false;
        wIdx = (wIdx + 1) % words.length;
    }

    setTimeout(typeLoop, speed);
}
typeLoop();

// --- SHOOTING STARS ---
function spawnStar() {
    const star = document.createElement('div');
    star.classList.add('shooting-star');
    
    // Random start position
    const startY = Math.random() * (window.innerHeight / 2); // Top half only
    const startX = -100; // Start off screen left
    
    star.style.top = startY + 'px';
    star.style.left = startX + 'px';
    
    // Random duration (SLOW: 4s to 8s)
    const duration = 4000 + Math.random() * 4000;
    
    // Animate via Web Animations API for easier cleanup
    const animation = star.animate([
        { transform: 'translate(0, 0) rotate(20deg)', opacity: 1 },
        { transform: `translate(${window.innerWidth + 200}px, 200px) rotate(20deg)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'linear'
    });

    // Interaction
    star.addEventListener('click', () => {
        showFact();
        star.remove(); // Remove immediately on click
    });

    animation.onfinish = () => star.remove();
    document.getElementById('star-container').appendChild(star);
    
    // Recursion: Spawn next star randomly between 2s and 6s
    setTimeout(spawnStar, 2000 + Math.random() * 4000);
}

// Start Star Loop
setTimeout(spawnStar, 1000);

// --- MODAL FACT ---
const modal = document.getElementById('star-modal');
const factText = document.getElementById('fact-text');
const closeBtn = document.getElementById('close-modal');

function showFact() {
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    factText.textContent = randomFact;
    modal.classList.remove('hidden');
}

closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

// --- AUDIO PLAYER ---
const musicBtn = document.getElementById('musicToggle');
const music = document.getElementById('bgMusic');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        music.pause();
        musicBtn.textContent = "► Play Music";
    } else {
        music.play();
        musicBtn.textContent = "⏸ Pause Music";
    }
    isPlaying = !isPlaying;
});

// --- HEAR MY VOICE (TTS) ---
const ttsInput = document.getElementById('ttsInput');
const ttsBtn = document.getElementById('ttsBtn');
const ttsStatus = document.getElementById('ttsStatus');
const ttsAudio = document.getElementById('ttsAudio');

ttsBtn.addEventListener('click', async () => {
    const text = ttsInput.value.trim();
    if (!text) return;
    
    ttsStatus.textContent = "Generating audio (this may take a few seconds)...";
    ttsBtn.disabled = true;

    try {
        const response = await fetch('/api/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        ttsAudio.src = url;
        ttsAudio.style.display = 'block';
        ttsAudio.play();
        ttsStatus.textContent = "Playing...";
    } catch (error) {
        ttsStatus.textContent = "Error: " + error.message;
    } finally {
        ttsBtn.disabled = false;
    }
});
