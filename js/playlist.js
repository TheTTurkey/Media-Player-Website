
// Playlist JS For Turkey Music
// File : playlist.js
// Author : Liam Turley
// Date : 15/05/2026


//playlist variables
let currentPlaylistId = null;
let currentPlaylistSongIndex = -1;
let currentPlaylistSongs = [];

// getting elements
const playlistListDiv = document.getElementById('playlist_list');
const playlistTableBody = document.getElementById('playlist_table_body');
const playlistTable = document.getElementById('playlist_table');
const playlistEmptyState = document.getElementById('playlist_empty_state');
const createPlaylistBtn = document.getElementById('create_playlist_button');
const playlistNameInput = document.getElementById('playlist_name_input');
const createPlaylistConfirm = document.getElementById('create_playlist_confirm');
const createPlaylistCancel = document.getElementById('create_playlist_cancel');
const createPlaylistForm = document.getElementById('create_playlist_form');

//  playlist view elements
const playlistViewDiv = document.getElementById('playlist_view');
const playlistViewTitle = document.getElementById('playlist_view_title');
const playlistSongTableBody = document.getElementById('playlist_song_list');
const playlistSongTable = document.getElementById('playlist_song_table');
const playlistSongEmpty = document.getElementById('playlist_song_empty');
const backToPlaylistsBtn = document.getElementById('back_to_playlists');
const addSongToPlaylistBtn = document.getElementById('add_song_to_playlist_btn');
const addSongModal = document.getElementById('add_song_modal');
const addSongModalList = document.getElementById('add_song_modal_list');
const addSongModalClose = document.getElementById('add_song_modal_close');

// show the create form when button clicked
createPlaylistBtn.addEventListener('click', () => {
    createPlaylistForm.style.display = 'flex';
    playlistNameInput.focus();
});

//cancel button hides form
createPlaylistCancel.addEventListener('click', () => {
    createPlaylistForm.style.display = 'none';
    playlistNameInput.value = '';
});

// create playlist button
createPlaylistConfirm.addEventListener('click', async () => {
    const name = playlistNameInput.value.trim();
    if (!name) return;

    const id = await db.playlists.add({
        name: name,
        songIds: []
    });

    addPlaylistToTable(id, name, 0);
    createPlaylistForm.style.display = 'none';
    playlistNameInput.value = '';
});

//enter key creates playlist too
playlistNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        createPlaylistConfirm.click();
    }
});

// adds playlist row to table
function addPlaylistToTable(id, name, songCount) {
    const row = document.createElement('tr');
    row.classList.add('music-row');
    row.id = `playlist-row-${id}`;
    row.innerHTML = `
        <td class="col-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#63B3ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/>
                <path d="M17 3a2.83 2.83 0 1 1 4 4L12 16l-4 1 1-4 8.586-8.586z"/>
            </svg>
        </td>
        <td class="col-name">${name}</td>
        <td class="col-duration">${songCount} songs</td>
        <td class="col-action">
            <button class="play-song-btn open-playlist-btn" data-id="${id}" title="Open">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
            <button class="delete-song-btn delete-playlist-btn" data-id="${id}" title="Delete">✕</button>
        </td>
    `;

    // open button
    row.querySelector('.open-playlist-btn').addEventListener('click', () => {
        openPlaylist(id);
    });

    //delete button
    row.querySelector('.delete-playlist-btn').addEventListener('click', async () => {
        await deletePlaylist(id, row);
    });

    playlistTableBody.appendChild(row);
    playlistTable.classList.add('has-songs');
    if (playlistEmptyState) playlistEmptyState.style.display = 'none';
}

//  delete a playlist from db
async function deletePlaylist(id, row) {
    await db.playlists.delete(id);
    row.remove();

    if (playlistTableBody.children.length === 0) {
        playlistTable.classList.remove('has-songs');
        if (playlistEmptyState) playlistEmptyState.style.display = '';
    }
}

// open playlist and show its songs
async function openPlaylist(id) {
    currentPlaylistId = id;
    const playlist = await db.playlists.get(id);
    if (!playlist) return;

    playlistViewTitle.textContent = playlist.name;
    playlistSongTableBody.innerHTML = '';

    // load songs
    const songIds = playlist.songIds || [];
    let loadedCount = 0;

    for (let i = 0; i < songIds.length; i++) {
        const song = await db.songs.get(songIds[i]);
        if (song) {
            addSongToPlaylistView(song.id, song.title, song.duration ? format_time(song.duration) : '--:--', i);
            loadedCount++;
        }
    }

    if (loadedCount > 0) {
        playlistSongTable.classList.add('has-songs');
        if (playlistSongEmpty) playlistSongEmpty.style.display = 'none';
    } else {
        playlistSongTable.classList.remove('has-songs');
        if (playlistSongEmpty) playlistSongEmpty.style.display = '';
    }

    // show playlist view hide playlist list
    playlistListDiv.style.display = 'none';
    playlistViewDiv.style.display = 'block';
}

//add song row to the playlist view table
function addSongToPlaylistView(songId, title, durationStr, index) {
    const row = document.createElement('tr');
    row.classList.add('music-row');
    row.innerHTML = `
        <td class="col-icon">${MUSIC_ICON_SVG}</td>
        <td class="col-name">${title}</td>
        <td class="col-duration">${durationStr}</td>
        <td class="col-action">
            <button class="play-song-btn" data-song-id="${songId}" data-index="${index}" title="Play">▶</button>
            <button class="delete-song-btn remove-from-playlist-btn" data-song-id="${songId}" title="Remove">✕</button>
        </td>
    `;

    row.querySelector('.play-song-btn').addEventListener('click', () => {
        playFromPlaylist(songId, index);
    });

    row.querySelector('.remove-from-playlist-btn').addEventListener('click', async () => {
        await removeSongFromPlaylist(songId, row);
    });

    playlistSongTableBody.appendChild(row);
}

// plays song from playlist
async function playFromPlaylist(songId, index) {
    const playlist = await db.playlists.get(currentPlaylistId);
    if (!playlist) return;

    currentPlaylistSongs = playlist.songIds || [];
    currentPlaylistSongIndex = index;

    await playSong(songId);

    //highlight the row thats playing
    playlistSongTableBody.querySelectorAll('.music-row').forEach(r => r.classList.remove('active'));
    const rows = playlistSongTableBody.querySelectorAll('.music-row');
    if (rows[index]) rows[index].classList.add('active');
}

//remove song from playlist
async function removeSongFromPlaylist(songId, row) {
    const playlist = await db.playlists.get(currentPlaylistId);
    if (!playlist) return;

    playlist.songIds = (playlist.songIds || []).filter(id => id !== songId);
    await db.playlists.put(playlist);

    row.remove();

    if (playlistSongTableBody.children.length === 0) {
        playlistSongTable.classList.remove('has-songs');
        if (playlistSongEmpty) playlistSongEmpty.style.display = '';
    }

    //update the song count
    updatePlaylistSongCount(currentPlaylistId, playlist.songIds.length);
}

// updates song count text
function updatePlaylistSongCount(playlistId, count) {
    const row = document.getElementById(`playlist-row-${playlistId}`);
    if (row) {
        const durationCell = row.querySelector('.col-duration');
        if (durationCell) durationCell.textContent = `${count} songs`;
    }
}

//back button
backToPlaylistsBtn.addEventListener('click', () => {
    playlistViewDiv.style.display = 'none';
    playlistListDiv.style.display = 'block';
    currentPlaylistId = null;
});

// add song button - shows modal with library songs
addSongToPlaylistBtn.addEventListener('click', async () => {
    addSongModalList.innerHTML = '';

    const songs = await db.songs.toArray();
    if (songs.length === 0) {
        addSongModalList.innerHTML = '<p class="modal-empty">No songs uploaded yet</p>';
    } else {
        const playlist = await db.playlists.get(currentPlaylistId);
        const existingIds = playlist ? (playlist.songIds || []) : [];

        for (const song of songs) {
            const alreadyAdded = existingIds.includes(song.id);
            const item = document.createElement('div');
            item.classList.add('modal-song-item');
            if (alreadyAdded) item.classList.add('already-added');

            item.innerHTML = `
                <span class="modal-song-icon">${MUSIC_ICON_SVG}</span>
                <span class="modal-song-name">${song.title}</span>
                <button class="modal-add-btn" data-id="${song.id}" ${alreadyAdded ? 'disabled' : ''}>
                    ${alreadyAdded ? 'Added' : 'Add'}
                </button>
            `;

            if (!alreadyAdded) {
                item.querySelector('.modal-add-btn').addEventListener('click', async (e) => {
                    const btn = e.target;
                    await addSongToPlaylist(song.id);
                    btn.textContent = 'Added';
                    btn.disabled = true;
                    item.classList.add('already-added');
                });
            }

            addSongModalList.appendChild(item);
        }
    }

    addSongModal.style.display = 'flex';
});

//close modal
addSongModalClose.addEventListener('click', () => {
    addSongModal.style.display = 'none';
    if (currentPlaylistId) openPlaylist(currentPlaylistId);
});

// close if you click outside the modal
addSongModal.addEventListener('click', (e) => {
    if (e.target === addSongModal) {
        addSongModal.style.display = 'none';
        if (currentPlaylistId) openPlaylist(currentPlaylistId);
    }
});

// add song to current playlist in db
async function addSongToPlaylist(songId) {
    const playlist = await db.playlists.get(currentPlaylistId);
    if (!playlist) return;

    if (!playlist.songIds) playlist.songIds = [];
    playlist.songIds.push(songId);
    await db.playlists.put(playlist);

    updatePlaylistSongCount(currentPlaylistId, playlist.songIds.length);
}

//auto play next song when one ends
audio_player.addEventListener('ended', async () => {
    if (currentPlaylistSongs.length > 0 && currentPlaylistSongIndex >= 0) {
        const nextIndex = currentPlaylistSongIndex + 1;
        if (nextIndex < currentPlaylistSongs.length) {
            const nextSongId = currentPlaylistSongs[nextIndex];
            currentPlaylistSongIndex = nextIndex;
            await playSong(nextSongId);

            // highlight next row
            playlistSongTableBody.querySelectorAll('.music-row').forEach(r => r.classList.remove('active'));
            const rows = playlistSongTableBody.querySelectorAll('.music-row');
            if (rows[nextIndex]) rows[nextIndex].classList.add('active');
        } else {
            // end of playlist
            play_button.innerHTML = PLAY_SVG;
            play_button.classList.remove('playing');
            currentPlaylistSongIndex = -1;
        }
    } else {
        play_button.innerHTML = PLAY_SVG;
        play_button.classList.remove('playing');
    }
});

//load playlists when page loads
async function loadPlaylistsFromDB() {
    const playlists = await db.playlists.toArray();
    for (const pl of playlists) {
        const count = pl.songIds ? pl.songIds.length : 0;
        addPlaylistToTable(pl.id, pl.name, count);
    }
}

loadPlaylistsFromDB();
