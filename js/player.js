const audio_player = document.getElementById('audio_player');
const audio_upload = document.getElementById('music_upload');
const play_button = document.getElementById('play_button');
const volume_control = document.getElementById('volume_control');
const volume_output = document.getElementById('volume_output');
const progress_bar = document.getElementById('progress_bar');
const current_time = document.getElementById('current_time');
const duration = document.getElementById('duration');
const audio_upload_button = document.getElementById('music_upload_button');
const audio_upload_label = document.getElementById('music_upload_label');
const music_list = document.getElementById('music_list');

const db = new Dexie("music");

db.version(1).stores({
    songs: "++id, title"
});

async function storeMp3(title, file, fileDuration) {
    const id = await db.songs.add({
        title: title,
        mp3Blob: file,
        duration: fileDuration
    });
    return id;
}

// SVG music note icon
const MUSIC_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#58A6FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;

function addSongToList(id, title, songDuration) {
    const row = document.createElement('tr');
    row.classList.add('music-row');
    row.innerHTML = `
        <td class="col-icon">${MUSIC_ICON_SVG}</td>
        <td class="col-name">${title}</td>
        <td class="col-duration">${songDuration}</td>
        <td class="col-action">
            <button class="play-song-btn" data-id="${id}" title="Play">▶</button>
            <button class="delete-song-btn" data-id="${id}" title="Delete">✕</button>
        </td>
    `;

    // Wire up the play button
    row.querySelector('.play-song-btn').addEventListener('click', () => {
        playSong(id, title);
    });

    // Wire up the delete button
    row.querySelector('.delete-song-btn').addEventListener('click', async () => {
        await deleteSong(id, row);
    });

    music_list.appendChild(row);

    // Show the table now that it has content
    document.getElementById('music_table').classList.add('has-songs');
}

async function deleteSong(id, row) {
    // Remove from IndexedDB
    await db.songs.delete(id);

    // If this song is currently playing, stop it
    const playBtn = row.querySelector('.play-song-btn');
    if (row.classList.contains('active')) {
        audio_player.pause();
        audio_player.removeAttribute('src');
        audio_upload_label.textContent = '';
        play_button.textContent = 'Play';
        duration.textContent = '0:00';
        current_time.textContent = '0:00';
        progress_bar.value = 0;
        update_slider_trail(progress_bar);
    }

    // Remove the row with a fade-out
    row.style.transition = 'opacity 0.3s ease';
    row.style.opacity = '0';
    setTimeout(() => {
        row.remove();
        // Hide the table if no songs left
        if (music_list.children.length === 0) {
            document.getElementById('music_table').classList.remove('has-songs');
        }
    }, 300);
}

function getDuration(file) {
    return new Promise((resolve) => {
        const tempAudio = new Audio();
        const url = URL.createObjectURL(file);
        tempAudio.src = url;
        tempAudio.addEventListener('loadedmetadata', () => {
            resolve(tempAudio.duration);
            URL.revokeObjectURL(url);
        });
        tempAudio.addEventListener('error', () => {
            resolve(0);
            URL.revokeObjectURL(url);
        });
    });
}

async function playSong(id, title) {
    const song = await db.songs.get(id);
    if (song) {
        if (audio_player.src) {
            URL.revokeObjectURL(audio_player.src);
        }
        const audioUrl = URL.createObjectURL(song.mp3Blob);
        audio_player.src = audioUrl;
        audio_player.play();
        audio_upload_label.textContent = title || song.title;
        play_button.textContent = 'Pause';

        // Highlight active row
        document.querySelectorAll('.music-row').forEach(r => r.classList.remove('active'));
        const btn = document.querySelector(`.play-song-btn[data-id="${id}"]`);
        if (btn) btn.closest('tr').classList.add('active');
    }
}

const format_time = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
};

// Load existing songs from DB on page load
async function loadSongsFromDB() {
    const songs = await db.songs.toArray();
    for (const song of songs) {
        const dur = song.duration ? format_time(song.duration) : '--:--';
        addSongToList(song.id, song.title, dur);
    }
}

loadSongsFromDB();

audio_upload.addEventListener('change', async () => {
    if (audio_upload.files.length > 0) {
        const file = audio_upload.files[0];
        const fullName = file.name;
        const nameWithoutExt = fullName.replace(/\.[^/.]+$/, "");

        // Get the duration before storing
        const fileDuration = await getDuration(file);

        // Store in DB
        const id = await storeMp3(nameWithoutExt, file, fileDuration);

        // Add to the list
        addSongToList(id, nameWithoutExt, format_time(fileDuration));

        // Also load it into the player
        const url = URL.createObjectURL(file);
        audio_player.src = url;
        audio_upload_label.textContent = nameWithoutExt;
    }
});

play_button.addEventListener('click', () => {
    if (audio_player.src) {
        if (audio_player.paused) {
            audio_player.play();
            play_button.textContent = 'Pause';
        } else {
            audio_player.pause();
            play_button.textContent = 'Play';
        }
    }
});

const update_slider_trail = (slider) => {
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #58A6FF ${percent}%, #30363D ${percent}%)`;
};

volume_control.addEventListener('input', () => {
    const volume = volume_control.value / 100;
    audio_player.volume = volume;
    volume_output.value = volume_control.value;
    update_slider_trail(volume_control);
});

update_slider_trail(volume_control);

audio_player.addEventListener('loadedmetadata', () => {
    progress_bar.value = Math.floor(audio_player.duration);
    duration.textContent = format_time(audio_player.duration);
});

progress_bar.addEventListener('input', () => {
    audio_player.currentTime = progress_bar.value;
    update_slider_trail(progress_bar);
});



audio_player.addEventListener('timeupdate', () => {
    const progress = (audio_player.currentTime / audio_player.duration) * 100;
    progress_bar.value = progress;
    current_time.textContent = format_time(audio_player.currentTime);
    update_slider_trail(progress_bar);
});

audio_upload_button.addEventListener('click', () => {
    audio_upload.click();
});

