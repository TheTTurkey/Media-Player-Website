
// Music Player, Dexie, Upload Table JS For Turkey Music
// File : player.js
// Author : Liam Turley
// Date : 15/05/2026

//getting all the elements from the html
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

// setting up dexie database
const db = new Dexie("music");

db.version(1).stores({
    songs: "++id, title",
    playlists: "++id, name"
});

//saves a song to the database
async function store_mp3(title, file, file_duration) {
    const id = await db.songs.add({
        title: title,
        mp3Blob: file,
        duration: file_duration
    });
    return id;
}

// svg icons for play and pause buttons
const PLAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const PAUSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
const MUSIC_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#63B3ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;

// adds a song to the library table
function add_song_to_list(id, title, song_duration) {
    const row = document.createElement('tr');
    row.classList.add('music_row');
    row.innerHTML = `
        <td class="col_icon">${MUSIC_ICON_SVG}</td>
        <td class="col_name">${title}</td>
        <td class="col_duration">${song_duration}</td>
        <td class="col_action">
            <button class="play_song_btn" data-id="${id}" title="Play">▶</button>
            <button class="delete_song_btn" data-id="${id}" title="Delete">✕</button>
        </td>
    `;

    //play button click
    row.querySelector('.play_song_btn').addEventListener('click', () => {
        play_song(id, title);
    });

    // delete button click
    row.querySelector('.delete_song_btn').addEventListener('click', async () => {
        await delete_song(id, row);
    });

    // add row to table
    music_list.appendChild(row);

    //show the table
    document.getElementById('music_table').classList.add('has_songs');

    // hide empty state
    const empty_state = document.getElementById('library_empty_state');
    if (empty_state) empty_state.style.display = 'none';
}

//deletes a song from database and removes from table
async function delete_song(id, row) {
    await db.songs.delete(id);

    // if this song was playing, stop it
    if (row.classList.contains('active')) {
        audio_player.pause();
        audio_player.removeAttribute('src');
        audio_upload_label.textContent = '';
        play_button.innerHTML = PLAY_SVG;
        play_button.classList.remove('playing');
        duration.textContent = '0:00';
        current_time.textContent = '0:00';
        progress_bar.value = 0;
        update_slider_trail(progress_bar);
    }

    //remove the row
    row.remove();

    // if no songs left show empty state again
    if (music_list.children.length === 0) {
        document.getElementById('music_table').classList.remove('has_songs');
        const empty_state = document.getElementById('library_empty_state');
        if (empty_state) empty_state.style.display = '';
    }
}

// gets the duration of an audio file
function get_duration(file) {
    return new Promise((resolve) => {
        const temp_audio = new Audio();
        temp_audio.src = URL.createObjectURL(file);
        temp_audio.addEventListener('loadedmetadata', () => {
            resolve(temp_audio.duration);
        });
        temp_audio.addEventListener('error', () => {
            resolve(0);
        });
    });
}

//plays a song from the database
async function play_song(id, title) {
    const song = await db.songs.get(id);
    if (song) {
        // set audio source and play
        audio_player.src = URL.createObjectURL(song.mp3Blob);
        audio_player.play();
        audio_upload_label.textContent = title || song.title;
        play_button.innerHTML = PAUSE_SVG;
        play_button.classList.add('playing');

        document.querySelectorAll('.music_row').forEach(r => r.classList.remove('active'));
        const btn = document.querySelector(`.play_song_btn[data-id="${id}"]`);
        if (btn) btn.closest('tr').classList.add('active');
    }
}

// does time
const format_time = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
};

//loads all songs
async function load_songs_from_db() {
    const songs = await db.songs.toArray();
    for (const song of songs) {
        const dur = song.duration ? format_time(song.duration) : '--:--';
        add_song_to_list(song.id, song.title, dur);
    }
}

load_songs_from_db();

//when user uploads a file
audio_upload.addEventListener('change', async () => {
    if (audio_upload.files.length > 0) {
        const file = audio_upload.files[0];
        const full_name = file.name;
        const name_without_ext = full_name.replace(/\.[^/.]+$/, "");

        const file_duration = await get_duration(file);
        const id = await store_mp3(name_without_ext, file, file_duration);

        add_song_to_list(id, name_without_ext, format_time(file_duration));

        //set it as current song
        audio_player.src = URL.createObjectURL(file);
        audio_upload_label.textContent = name_without_ext;
    }
});

// play/pause button
play_button.addEventListener('click', () => {
    if (audio_player.src) {
        if (audio_player.paused) {
            audio_player.play();
            play_button.innerHTML = PAUSE_SVG;
            play_button.classList.add('playing');
        } else {
            audio_player.pause();
            play_button.innerHTML = PLAY_SVG;
            play_button.classList.remove('playing');
        }
    }
});

// updates the slider color trail
const update_slider_trail = (slider) => {
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #63B3ED ${percent}%, #232B3E ${percent}%)`;
};

//volume slider
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

// update progress bar as song plays
audio_player.addEventListener('timeupdate', () => {
    const progress = (audio_player.currentTime / audio_player.duration) * 100;
    progress_bar.value = progress;
    current_time.textContent = format_time(audio_player.currentTime);
    update_slider_trail(progress_bar);
});

audio_upload_button.addEventListener('click', () => {
    audio_upload.click();
});
