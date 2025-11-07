// Dexter Episodes Database
// Update this with your actual episodes
const dexterEpisodes = {
    1: [
        { episode: 1, title: "Dexter", description: "Dexter Morgan, a Miami PD forensic analyst, has a secret..." },
        { episode: 2, title: "Crocodile", description: "Dexter's world is rocked when a rival serial killer emerges." },
        { episode: 3, title: "Popping Cherry", description: "Dexter is enlisted to investigate a crime scene." },
        { episode: 4, title: "Let's Give the Boy a Hand", description: "The Ice Truck Killer leaves a body part." },
        { episode: 5, title: "Love American Style", description: "Dexter's anniversary with Rita arrives." },
        { episode: 6, title: "Return to Sender", description: "The Ice Truck Killer sends Dexter a message." },
        { episode: 7, title: "Circle of Friends", description: "Dexter's secrets are threatened." },
        { episode: 8, title: "Shrink Wrap", description: "Dexter faces a new challenge." },
        { episode: 9, title: "Father Knows Best", description: "Dexter remembers his father's lessons." },
        { episode: 10, title: "Seeing Red", description: "Dexter hunts the Ice Truck Killer." },
        { episode: 11, title: "Truth Be Told", description: "Dexter's past is revealed." },
        { episode: 12, title: "Born Free", description: "Season finale - Dexter confronts the truth." }
    ],
    2: [
        { episode: 1, title: "It's Alive!", description: "Season 2 premiere" },
        { episode: 2, title: "Waiting to Exhale", description: "Dexter faces new challenges" },
        // Add more episodes...
    ],
    // Add seasons 3-8
};

let currentSeason = 1;
let currentEpisodeIndex = 0;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    createSeasonSelector();
    displayEpisodes(currentSeason);
});

// Create season selector buttons
function createSeasonSelector() {
    const selector = document.getElementById('seasonSelector');
    const totalSeasons = Object.keys(dexterEpisodes).length;

    for (let i = 1; i <= totalSeasons; i++) {
        const btn = document.createElement('button');
        btn.className = `season-btn ${i === 1 ? 'active' : ''}`;
        btn.textContent = `Season ${i}`;
        btn.onclick = () => selectSeason(i);
        selector.appendChild(btn);
    }
}

// Select season
function selectSeason(season) {
    currentSeason = season;
    
    // Update active button
    document.querySelectorAll('.season-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index + 1 === season);
    });
    
    displayEpisodes(season);
}

// Display episodes for selected season
function displayEpisodes(season) {
    const grid = document.getElementById('episodeGrid');
    grid.innerHTML = '';

    const episodes = dexterEpisodes[season];
    
    episodes.forEach((ep, index) => {
        const episodeId = `s${season}e${ep.episode}`;
        const progress = getProgress(episodeId);
        const isWatched = progress.percent > 90;

        const card = document.createElement('div');
        card.className = `episode-card ${isWatched ? 'watched' : ''}`;
        card.onclick = () => playEpisode(season, index);
        
        card.innerHTML = `
            <div class="episode-number">S${season} E${ep.episode}</div>
            <h3>${ep.title}</h3>
            <p>${ep.description}</p>
            <p style="font-size: 12px; color: #666;">
                ${progress.percent > 0 && progress.percent < 90 
                    ? `Resume from ${formatTime(progress.time)}` 
                    : isWatched ? 'Watched' : 'Not started'}
            </p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percent}%"></div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Play episode
function playEpisode(season, episodeIndex) {
    currentSeason = season;
    currentEpisodeIndex = episodeIndex;
    
    const episode = dexterEpisodes[season][episodeIndex];
    const episodeId = `s${season}e${episode.episode}`;
    
    const player = document.getElementById('videoPlayer');
    const container = document.getElementById('playerContainer');
    const title = document.getElementById('episodeTitle');

    // Set video source
    player.src = `episodes/${episodeId}.mp4`;
    title.textContent = `S${season} E${episode.episode}: ${episode.title}`;
    container.style.display = 'block';

    // Resume from last position
    const progress = getProgress(episodeId);
    if (progress.time > 0 && progress.percent < 90) {
        player.currentTime = progress.time;
    }

    player.play();

    // Update navigation buttons
    updateNavButtons();

    // Save progress periodically
    let saveInterval = setInterval(() => {
        if (!player.paused) {
            saveProgress(episodeId, player.currentTime, player.duration);
        }
    }, 5000);

    // Save on pause
    player.onpause = () => {
        saveProgress(episodeId, player.currentTime, player.duration);
    };

    // Handle episode end
    player.onended = () => {
        saveProgress(episodeId, player.duration, player.duration); // Mark as watched
        clearInterval(saveInterval);
        
        // Auto-play next episode if enabled
        if (document.getElementById('autoplayNext').checked) {
            setTimeout(() => playNextEpisode(), 2000);
        }
    };

    // Store cleanup data
    player.dataset.episodeId = episodeId;
    player.dataset.intervalId = saveInterval;
}

// Update navigation buttons
function updateNavButtons() {
    const prevBtn = document.getElementById('prevEpisode');
    const nextBtn = document.getElementById('nextEpisode');
    
    // Check if there's a previous episode
    prevBtn.disabled = !(currentEpisodeIndex > 0 || currentSeason > 1);
    
    // Check if there's a next episode
    const hasNextInSeason = currentEpisodeIndex < dexterEpisodes[currentSeason].length - 1;
    const hasNextSeason = currentSeason < Object.keys(dexterEpisodes).length;
    nextBtn.disabled = !(hasNextInSeason || hasNextSeason);
}

// Play next episode
function playNextEpisode() {
    const seasonEpisodes = dexterEpisodes[currentSeason];
    
    if (currentEpisodeIndex < seasonEpisodes.length - 1) {
        // Next episode in same season
        playEpisode(currentSeason, currentEpisodeIndex + 1);
    } else if (currentSeason < Object.keys(dexterEpisodes).length) {
        // First episode of next season
        playEpisode(currentSeason + 1, 0);
        selectSeason(currentSeason); // Update season selector
    }
}

// Play previous episode
function playPreviousEpisode() {
    if (currentEpisodeIndex > 0) {
        // Previous episode in same season
        playEpisode(currentSeason, currentEpisodeIndex - 1);
    } else if (currentSeason > 1) {
        // Last episode of previous season
        const prevSeason = currentSeason - 1;
        const lastEpisode = dexterEpisodes[prevSeason].length - 1;
        playEpisode(prevSeason, lastEpisode);
        selectSeason(prevSeason); // Update season selector
    }
}

// Close player
function closePlayer() {
    const player = document.getElementById('videoPlayer');
    const container = document.getElementById('playerContainer');
    
    // Save final progress
    if (player.dataset.episodeId) {
        saveProgress(player.dataset.episodeId, player.currentTime, player.duration);
    }

    // Clear interval
    if (player.dataset.intervalId) {
        clearInterval(player.dataset.intervalId);
    }

    player.pause();
    player.src = '';
    container.style.display = 'none';
    
    // Refresh episodes to show updated progress
    displayEpisodes(currentSeason);
}

// Save progress to localStorage
function saveProgress(episodeId, currentTime, duration) {
    if (!duration) return;
    
    const percent = Math.min((currentTime / duration) * 100, 100);
    
    localStorage.setItem(`dexter_${episodeId}`, JSON.stringify({
        time: currentTime,
        duration: duration,
        percent: percent,
        lastWatched: new Date().toISOString()
    }));
}

// Get progress from localStorage
function getProgress(episodeId) {
    const data = localStorage.getItem(`dexter_${episodeId}`);
    return data ? JSON.parse(data) : { time: 0, percent: 0 };
}

// Format time (seconds to MM:SS or HH:MM:SS)
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}
