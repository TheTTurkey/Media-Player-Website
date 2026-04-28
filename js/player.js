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

const db = new Dexie("Music");

db.version(1).stores({
    songs: "++id, name"
});





audio_upload.addEventListener('change', () => {
    const file = audio_upload.files[0];
    const url = URL.createObjectURL(file);
    audio_player.src = url;
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

const format_time = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
};

audio_player.addEventListener('timeupdate', () => {
    const progress = (audio_player.currentTime / audio_player.duration) * 100;
    progress_bar.value = progress;
    current_time.textContent = format_time(audio_player.currentTime);
    update_slider_trail(progress_bar);
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
