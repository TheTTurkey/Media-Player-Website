
// Playlist JS For Turkey Music
// File : playlist.js
// Author : Liam Turley
// Date : 15/05/2026


//playlist variables
let current_playlist_id = null;
let current_playlist_song_index = -1;
let current_playlist_songs = [];

// getting elements
const playlist_list_div = document.getElementById('playlist_list');
const playlist_table_body = document.getElementById('playlist_table_body');
const playlist_table = document.getElementById('playlist_table');
const playlist_empty_state = document.getElementById('playlist_empty_state');
const create_playlist_btn = document.getElementById('create_playlist_button');
const playlist_name_input = document.getElementById('playlist_name_input');
const create_playlist_confirm = document.getElementById('create_playlist_confirm');
const create_playlist_cancel = document.getElementById('create_playlist_cancel');
const create_playlist_form = document.getElementById('create_playlist_form');

//  playlist view elements
const playlist_view_div = document.getElementById('playlist_view');
const playlist_view_title = document.getElementById('playlist_view_title');
const playlist_song_table_body = document.getElementById('playlist_song_list');
const playlist_song_table = document.getElementById('playlist_song_table');
const playlist_song_empty = document.getElementById('playlist_song_empty');
const back_to_playlists_btn = document.getElementById('back_to_playlists');
const add_song_to_playlist_btn = document.getElementById('add_song_to_playlist_btn');
const add_song_modal = document.getElementById('add_song_modal');
const add_song_modal_list = document.getElementById('add_song_modal_list');
const add_song_modal_close = document.getElementById('add_song_modal_close');

// show the create form when button clicked
create_playlist_btn.addEventListener('click', () => {
    create_playlist_form.style.display = 'flex';
    playlist_name_input.focus();
});

//cancel button hides form
create_playlist_cancel.addEventListener('click', () => {
    create_playlist_form.style.display = 'none';
    playlist_name_input.value = '';
});

// create playlist button
create_playlist_confirm.addEventListener('click', async () => {
    const name = playlist_name_input.value.trim();
    if (!name) return;

    const id = await db.playlists.add({
        name: name,
        songIds: []
    });

    add_playlist_to_table(id, name, 0);
    create_playlist_form.style.display = 'none';
    playlist_name_input.value = '';
});

//enter key creates playlist too
playlist_name_input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        create_playlist_confirm.click();
    }
});

// adds playlist row to table
function add_playlist_to_table(id, name, song_count) {
    const row = document.createElement('tr');
    row.classList.add('music_row');
    row.id = `playlist_row_${id}`;
    row.innerHTML = `
        <td class="col_icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#63B3ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/>
                <path d="M17 3a2.83 2.83 0 1 1 4 4L12 16l-4 1 1-4 8.586-8.586z"/>
            </svg>
        </td>
        <td class="col_name">${name}</td>
        <td class="col_duration">${song_count} songs</td>
        <td class="col_action">
            <button class="play_song_btn open_playlist_btn" data-id="${id}" title="Open">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
            <button class="delete_song_btn delete_playlist_btn" data-id="${id}" title="Delete">✕</button>
        </td>
    `;

    // open button
    row.querySelector('.open_playlist_btn').addEventListener('click', () => {
        open_playlist(id);
    });

    //delete button
    row.querySelector('.delete_playlist_btn').addEventListener('click', async () => {
        await delete_playlist(id, row);
    });

    playlist_table_body.appendChild(row);
    playlist_table.classList.add('has_songs');
    if (playlist_empty_state) playlist_empty_state.style.display = 'none';
}

//  delete a playlist from db
async function delete_playlist(id, row) {
    await db.playlists.delete(id);
    row.remove();

    if (playlist_table_body.children.length === 0) {
        playlist_table.classList.remove('has_songs');
        if (playlist_empty_state) playlist_empty_state.style.display = '';
    }
}

// open playlist and show its songs
async function open_playlist(id) {
    current_playlist_id = id;
    const playlist = await db.playlists.get(id);
    if (!playlist) return;

    playlist_view_title.textContent = playlist.name;
    playlist_song_table_body.innerHTML = '';

    // load songs
    const song_ids = playlist.songIds || [];
    let loaded_count = 0;

    for (let i = 0; i < song_ids.length; i++) {
        const song = await db.songs.get(song_ids[i]);
        if (song) {
            add_song_to_playlist_view(song.id, song.title, song.duration ? format_time(song.duration) : '--:--', i);
            loaded_count++;
        }
    }

    if (loaded_count > 0) {
        playlist_song_table.classList.add('has_songs');
        if (playlist_song_empty) playlist_song_empty.style.display = 'none';
    } else {
        playlist_song_table.classList.remove('has_songs');
        if (playlist_song_empty) playlist_song_empty.style.display = '';
    }

    // show playlist view hide playlist list
    playlist_list_div.style.display = 'none';
    playlist_view_div.style.display = 'block';
}

//add song row to the playlist view table
function add_song_to_playlist_view(song_id, title, duration_str, index) {
    const row = document.createElement('tr');
    row.classList.add('music_row');
    row.innerHTML = `
        <td class="col_icon">${MUSIC_ICON_SVG}</td>
        <td class="col_name">${title}</td>
        <td class="col_duration">${duration_str}</td>
        <td class="col_action">
            <button class="play_song_btn" data-song-id="${song_id}" data-index="${index}" title="Play">▶</button>
            <button class="delete_song_btn remove_from_playlist_btn" data-song-id="${song_id}" title="Remove">✕</button>
        </td>
    `;

    row.querySelector('.play_song_btn').addEventListener('click', () => {
        play_from_playlist(song_id, index);
    });

    row.querySelector('.remove_from_playlist_btn').addEventListener('click', async () => {
        await remove_song_from_playlist(song_id, row);
    });

    playlist_song_table_body.appendChild(row);
}

// plays song from playlist
async function play_from_playlist(song_id, index) {
    const playlist = await db.playlists.get(current_playlist_id);
    if (!playlist) return;

    current_playlist_songs = playlist.songIds || [];
    current_playlist_song_index = index;

    await play_song(song_id);

    //highlight the row thats playing
    playlist_song_table_body.querySelectorAll('.music_row').forEach(r => r.classList.remove('active'));
    const rows = playlist_song_table_body.querySelectorAll('.music_row');
    if (rows[index]) rows[index].classList.add('active');
}

//remove song from playlist
async function remove_song_from_playlist(song_id, row) {
    const playlist = await db.playlists.get(current_playlist_id);
    if (!playlist) return;

    playlist.songIds = (playlist.songIds || []).filter(id => id !== song_id);
    await db.playlists.put(playlist);

    row.remove();

    if (playlist_song_table_body.children.length === 0) {
        playlist_song_table.classList.remove('has_songs');
        if (playlist_song_empty) playlist_song_empty.style.display = '';
    }

    //update the song count
    update_playlist_song_count(current_playlist_id, playlist.songIds.length);
}

// updates song count text
function update_playlist_song_count(playlist_id, count) {
    const row = document.getElementById(`playlist_row_${playlist_id}`);
    if (row) {
        const duration_cell = row.querySelector('.col_duration');
        if (duration_cell) duration_cell.textContent = `${count} songs`;
    }
}

//back button
back_to_playlists_btn.addEventListener('click', () => {
    playlist_view_div.style.display = 'none';
    playlist_list_div.style.display = 'block';
    current_playlist_id = null;
});

// add song button - shows modal with library songs
add_song_to_playlist_btn.addEventListener('click', async () => {
    add_song_modal_list.innerHTML = '';

    const songs = await db.songs.toArray();
    if (songs.length === 0) {
        add_song_modal_list.innerHTML = '<p class="modal_empty">No songs uploaded yet</p>';
    } else {
        const playlist = await db.playlists.get(current_playlist_id);
        const existing_ids = playlist ? (playlist.songIds || []) : [];

        for (const song of songs) {
            const already_added = existing_ids.includes(song.id);
            const item = document.createElement('div');
            item.classList.add('modal_song_item');
            if (already_added) item.classList.add('already_added');

            item.innerHTML = `
                <span class="modal_song_icon">${MUSIC_ICON_SVG}</span>
                <span class="modal_song_name">${song.title}</span>
                <button class="modal_add_btn" data-id="${song.id}" ${already_added ? 'disabled' : ''}>
                    ${already_added ? 'Added' : 'Add'}
                </button>
            `;

            if (!already_added) {
                item.querySelector('.modal_add_btn').addEventListener('click', async (e) => {
                    const btn = e.target;
                    await add_song_to_playlist(song.id);
                    btn.textContent = 'Added';
                    btn.disabled = true;
                    item.classList.add('already_added');
                });
            }

            add_song_modal_list.appendChild(item);
        }
    }

    add_song_modal.style.display = 'flex';
});

//close modal
add_song_modal_close.addEventListener('click', () => {
    add_song_modal.style.display = 'none';
    if (current_playlist_id) open_playlist(current_playlist_id);
});

// close if you click outside the modal
add_song_modal.addEventListener('click', (e) => {
    if (e.target === add_song_modal) {
        add_song_modal.style.display = 'none';
        if (current_playlist_id) open_playlist(current_playlist_id);
    }
});

// add song to current playlist in db
async function add_song_to_playlist(song_id) {
    const playlist = await db.playlists.get(current_playlist_id);
    if (!playlist) return;

    if (!playlist.songIds) playlist.songIds = [];
    playlist.songIds.push(song_id);
    await db.playlists.put(playlist);

    update_playlist_song_count(current_playlist_id, playlist.songIds.length);
}

//auto play next song when one ends
audio_player.addEventListener('ended', async () => {
    if (current_playlist_songs.length > 0 && current_playlist_song_index >= 0) {
        const next_index = current_playlist_song_index + 1;
        if (next_index < current_playlist_songs.length) {
            const next_song_id = current_playlist_songs[next_index];
            current_playlist_song_index = next_index;
            await play_song(next_song_id);

            // highlight next row
            playlist_song_table_body.querySelectorAll('.music_row').forEach(r => r.classList.remove('active'));
            const rows = playlist_song_table_body.querySelectorAll('.music_row');
            if (rows[next_index]) rows[next_index].classList.add('active');
        } else {
            // end of playlist
            play_button.innerHTML = PLAY_SVG;
            play_button.classList.remove('playing');
            current_playlist_song_index = -1;
        }
    } else {
        play_button.innerHTML = PLAY_SVG;
        play_button.classList.remove('playing');
    }
});

//load playlists when page loads
async function load_playlists_from_db() {
    const playlists = await db.playlists.toArray();
    for (const pl of playlists) {
        const count = pl.songIds ? pl.songIds.length : 0;
        add_playlist_to_table(pl.id, pl.name, count);
    }
}

load_playlists_from_db();
