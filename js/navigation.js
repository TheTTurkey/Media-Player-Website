const library = document.getElementById('library');
const playlist = document.getElementById('playlist');
const library_button = document.getElementById('lib_link');
const playlist_button = document.getElementById('pla_link');
const about_button = document.getElementById('abo_link');
const about = document.getElementById('about');




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
