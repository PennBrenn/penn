// --- CONFIG ---
const facts = [
    "My geckos shit very loud",
    "My fav food is pesto chicken pasta",
    "I never finish projects",
    "Please give me money",
    "I am good at explosives manufacturing",
    "My fav color is #465e73",
    "I use a Miniware TS21",
    "Yes, i run android (for sideloading)",
    "Yes, im short af",
    "Yes, i need cuddles to sleep",
    "I have horrible spending habits",
    "I have a nothing phone 2",
    "My server is a ryzen7 16gb int.",
    "I built my pc",
    "I use youtube music",
    "My fav drink is lemon sparking ice"
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
    
    const buffer = 150; // Distance off-screen to spawn/despawn
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    let startX, startY, endX, endY;

    // 1. Pick a random side (0: Top, 1: Right, 2: Bottom, 3: Left)
    const side = Math.floor(Math.random() * 4);

    // 2. Determine Coordinates based on side
    switch(side) {
        case 0: // Top -> Bottom
            startX = Math.random() * w;
            startY = -buffer;
            endX = Math.random() * w;
            endY = h + buffer;
            break;
        case 1: // Right -> Left
            startX = w + buffer;
            startY = Math.random() * h;
            endX = -buffer;
            endY = Math.random() * h;
            break;
        case 2: // Bottom -> Top
            startX = Math.random() * w;
            startY = h + buffer;
            endX = Math.random() * w;
            endY = -buffer;
            break;
        case 3: // Left -> Right
            startX = -buffer;
            startY = Math.random() * h;
            endX = w + buffer;
            endY = Math.random() * h;
            break;
    }

    // 3. Calculate Angle so the trail follows the movement
    // Math.atan2(dy, dx) gives rotation in radians
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const angleDeg = angleRad * (180 / Math.PI); // Convert to degrees

    // 4. Set Initial Position
    // We use 'translate' for position and 'rotate' for direction
    star.style.transform = `translate(${startX}px, ${startY}px) rotate(${angleDeg}deg)`;

    // 5. Animate
    // Random duration (Slow: 5s to 10s)
    const duration = 5000 + Math.random() * 5000;

    const animation = star.animate([
        { 
            transform: `translate(${startX}px, ${startY}px) rotate(${angleDeg}deg)`, 
            opacity: 1 
        },
        { 
            transform: `translate(${endX}px, ${endY}px) rotate(${angleDeg}deg)`, 
            opacity: 0 
        }
    ], {
        duration: duration,
        easing: 'linear'
    });

    // 6. Interaction
    star.addEventListener('click', (e) => {
        // Stop bubbling so we don't click things behind it
        e.stopPropagation();
        showFact();
        
        // Visual feedback on click (optional: simple pop effect)
        star.style.opacity = 0;
        star.style.transition = "opacity 0.2s";
        
        // Remove after short delay
        setTimeout(() => star.remove(), 200);
    });

    // Cleanup when animation ends
    animation.onfinish = () => star.remove();

    // Add to DOM
    document.getElementById('star-container').appendChild(star);
    
    // Spawn next star (Random delay between 1s and 3s)
    setTimeout(spawnStar, 1000 + Math.random() * 2000);
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
