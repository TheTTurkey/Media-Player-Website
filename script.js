const audioplayer = document.getElementById('audio_player');
const audio_upload = document.getElementById('music_upload');
const play_button = document.getElementById('play_button');
const volume_control = document.getElementById('volume_control');
const volume_output = document.getElementById('volume_output');
const progress_bar = document.getElementById('progress_bar');
const current_time = document.getElementById('current_time');
const duration = document.getElementById('duration');
const audio_upload_button = document.getElementById('music_upload_button');
const audio_upload_label = document.getElementById('music_upload_label');
const library = document.getElementById('Library');
const playlist = document.getElementById('Playlist');
const library_button = document.getElementById('lib_link');
const playlist_button = document.getElementById('pla_link');
const about_button = document.getElementById('abo_link');
const about = document.getElementById('About');


library_button.addEventListener('click', () => {
        library.style.display = "block"; 
        playlist.style.display = "none";
        about.style.display = "none";
});

playlist_button.addEventListener('click', () => {
        playlist.style.display = "block"; 
        library.style.display = "none";
        about.style.display = "none";
});

about_button.addEventListener('click', () => {
        about.style.display = "block"; 
        playlist.style.display = "none";
        library.style.display = "none";
});



audio_upload.addEventListener('change', () => {
    const file = audio_upload.files[0];
    const url = URL.createObjectURL(file);
    audioplayer.src = url;
});

play_button.addEventListener('click', () => {
    if (audioplayer.src) {
        if (audioplayer.paused) {
            audioplayer.play();
            play_button.textContent = 'Pause';
        } else {
            audioplayer.pause();
            play_button.textContent = 'Play';
        }
    }
});

volume_control.addEventListener('input', () => {
    const volume = volume_control.value / 100;
    audioplayer.volume = volume;
    volume_output.value = volume_control.value;
});

audioplayer.addEventListener('loadedmetadata', () => {
    progress_bar.value = Math.floor(audioplayer.duration);
    duration.textContent = formatTime(audioplayer.duration);
});

progress_bar.addEventListener('input', () => {
    audioplayer.currentTime = progress_bar.value;
});

const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
};

audioplayer.addEventListener('timeupdate', () => {
    const progress = (audioplayer.currentTime / audioplayer.duration) * 100;
    progress_bar.value = progress;
    current_time.textContent = formatTime(audioplayer.currentTime); 
});

audio_upload_button.addEventListener('click', () => {
    audio_upload.click();
});

audio_upload.addEventListener('change', () => {
    if (audio_upload.files.length > 0) {
        const fullName = audio_upload.files[0].name;
        const nameWithoutExt = fullName.replace(/\.[^/.]+$/, "");
        audio_upload_label.textContent = nameWithoutExt;
    } else {
        audio_upload_label.textContent = '';
    }
});

