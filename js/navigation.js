// Navigation js For Turkey Music
// File : navigation.js
// Author : Liam Turley
// Date : 15/05/2026

// getting page elements
const library = document.getElementById('library');
const playlist = document.getElementById('playlist');
const library_button = document.getElementById('lib_link');
const playlist_button = document.getElementById('pla_link');
const about_button = document.getElementById('abo_link');
const about = document.getElementById('about');
//nav buttons
const nav_buttons = [library_button, playlist_button, about_button];

// changes active button
function set_active_nav(active_btn) {
    nav_buttons.forEach(btn => btn.classList.remove('active'));
    active_btn.classList.add('active');
}


//library button click
library_button.addEventListener('click', () => {
    library.style.display = "block";
    playlist.style.display = "none";
    about.style.display = "none";
    audio_box.style.display = "flex";
    set_active_nav(library_button);
});
// playlist button click
playlist_button.addEventListener('click', () => {
    playlist.style.display = "block";
    library.style.display = "none";
    about.style.display = "none";
    audio_box.style.display = "flex";
    set_active_nav(playlist_button);
});

//about button click
about_button.addEventListener('click', () => {
    about.style.display = "block";
    playlist.style.display = "none";
    library.style.display = "none";
    audio_box.style.display = "none";
    set_active_nav(about_button);
});
