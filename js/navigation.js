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
