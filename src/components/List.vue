<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, watchEffect } from 'vue';
import axios, { AxiosError } from 'axios';
import SearchIcon from './icons/IconSearch.vue'
import PlusIcon from './icons/IconPlus.vue'
import TickIcon from './icons/IconTick.vue'

import Popover from './Popover.vue'
import Modal from './Modal.vue'

import TimeIcon from './icons/IconTime.vue'
import InfoIcon from './icons/IconInfo.vue'
import type { IResGetTracks } from '@/interfaces/ITrack';
import { useRoute } from 'vue-router';
import type { ItemPlaylist, Tracks } from '@/interfaces/IPlaylist';
import type { Item, IResPlaylistById } from '@/interfaces/IPlayListById';
import IconMusic from './icons/IconMusic.vue'

interface EditPlayList {
  title: string, desription: string
}
interface Album {
  cover: string;
  title: string;
  createBy: string;
  description: string;
  year: string;
  tracks: Item[];
}


export default defineComponent({
  name: 'AlbumView',
  components: { SearchIcon, InfoIcon, Popover, TimeIcon, PlusIcon, TickIcon, IconMusic, Modal },
  setup() {
    const accessToken = ref<string | null>(localStorage.getItem('access_token'));
    const searchQuery = ref(localStorage.getItem('search_music') || '');
    const searchResults = ref<IResGetTracks | null>(null);
    const searchError = ref<string | null>(null);
    const API_ENDPOINT = 'https://api.spotify.com/v1';
    const open = ref<boolean>(false);
    const openModal = ref<boolean>(false);
    const openModalEdit = ref<boolean>(false);
    const album = ref<Album>({
      cover: 'https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/radio/artist/3moR9d0X97NAtZRhHWOta5/en', // Replace with actual path
      title: 'PUN',
      description: 'PUN',
      createBy: 'PUN',
      year: '2024',
      tracks: [],
    });
    const editingPlaylist = ref<EditPlayList>({
      title: album.value?.title || '',
      desription: album.value?.description || '',
    });
    const loading = ref(true);
    const error = ref<string | null>(null);
    const tracks = ref<Tracks[]>([]);
    const playlist = ref<IResPlaylistById>();

    const route = useRoute();
    const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';


    const playlistId = ref(route.params.id);



    const clientId = import.meta.env.VITE_CLIENT_ID; // Replace with your Spotify Client ID
    const clientSecret = import.meta.env.VITE_SECRET_ID; // Replace with your Spotify Client Secret

    onMounted(async () => {
      if (!accessToken.value || !playlistId.value) return
      fetchPlaylistById();
      // fectchTracks();
    });

    watchEffect(() => {
      album.value = {
        cover: playlist.value?.images?.[0].url || '', // Replace with actual path
        title: playlist.value?.name || '',
        createBy: playlist.value?.owner?.display_name || '',
        year: playlist.value?.tracks?.items?.[0]?.added_at?.toString() || '',
        tracks: playlist.value?.tracks?.items || [],
        description: playlist.value?.description || ''
      }
      editingPlaylist.value = {
        title: playlist.value?.name || '',
        desription: playlist.value?.description || '',
      }
    })


    const fectchTracks = async () => {
      try {
        // 1. Get Access Token (Client Credentials Flow)
        if (!accessToken.value || !playlistId) return

        const tokenResponse = await axios.post(
          'https://accounts.spotify.com/api/token',
          'grant_type=client_credentials',
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            },
          }
        );

        accessToken.value = tokenResponse.data.access_token;
        // 2. Use the access token to fetch music (e.g., featured playlists)
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, // Example: Today's Top Hits playlist
          {
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
          }
        );

        if (response.data && response.data.items) {
          tracks.value = response.data.items.slice(0, 20).map((item: any) => item.track);
        } else {
          error.value = "No tracks found in the playlist"
        }

      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.response) {
          error.value = `Error: ${err.response.status} - ${err.response.data.error.message}`;
        } else if (err.request) {
          error.value = "Error: No response from server";
        } else {
          error.value = "Error: Request setup failed";
        }
        // if (err.status === 401) {
        //   localStorage.clear()
        //   window.location.reload()
        // }
      } finally {
        loading.value = false;
      }
    }
    const fetchPlaylistById = async () => {
      try {
        // if (!accessToken.value) return
        // 2. Use the access token to fetch music (e.g., featured playlists)
        const response = await axios.get(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId.value}`, {
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        });

        if (response.data) {
          playlist.value = response.data;
        } else {
          error.value = "No Playlist found"
        }

      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.response) {
          error.value = `Error: ${err.response.status} - ${err.response.data.error.message}`;
        } else if (err.request) {
          error.value = "Error: No response from server";
        } else {
          error.value = "Error: Request setup failed";
        }
        if (err.status === 401) {
          window.location.reload()
        }
      } finally {
        loading.value = false;
      }
    }
    const formatDuration = (duration: number): string => {
      const timeSeconds = Math.floor(duration / 1000);

      const minutes = Math.floor(timeSeconds / 60);
      const seconds = Math.floor(timeSeconds - (60 * 3));
      return `${minutes}:${(seconds >= 0 ? seconds : -seconds).toString().padStart(2, '0')}`;
    };

    const searchMusic = async () => {
      if (!accessToken.value || !searchQuery.value) {
        searchResults.value = [] as any;
        return;
      }
      searchError.value = null; // Clear any previous errors
      try {
        const response = await axios.get(`${API_ENDPOINT}/search`, {
          headers: { Authorization: `Bearer ${accessToken.value}` },
          params: { q: searchQuery.value, type: 'track' }
        });

        searchResults.value = response.data;
      } catch (error: any) { // Type the error as any to get more info
        const err = error as AxiosError
        console.error('Error searching music:', err);
        searchError.value = error.response?.data?.error?.message || 'An error occurred during the search.';
      }
    };

    const searchInput = async () => {
      if (playlistId) {
        // 
      } else {
        searchMusic()
      }
    }
    const openPopover = async () => {
      open.value = !open.value
    }

    const addTracksToPlaylist = async (trackUris: string[], me?: boolean) => {
      const response = await axios.post(
        `${SPOTIFY_API_BASE_URL}/playlists/${playlist.value?.id}/tracks`,
        {
          uris: trackUris,
        },
        {
          headers: { Authorization: `Bearer ${accessToken.value}` },
        }
      );
      if (me) {
        fetchPlaylistById()
      } else {
        fetchPlaylistById()
        searchMusic()
      }
      return response.data;
    }

    const removeTracksFromPlaylist = async (trackUris: string[], me?: boolean) => {
      const response = await axios.delete(
        `${SPOTIFY_API_BASE_URL}/playlists/${playlist.value?.id}/tracks`,
        {
          headers: { Authorization: `Bearer ${accessToken.value}` },
          data: {
            tracks: trackUris.map(uri => ({ uri })),
          },
        }
      );
      if (me) {
        fetchPlaylistById()
      } else {
        searchMusic()
        fetchPlaylistById()
      }
      return response.data;
    }
    const onOpenModal = () => {
      openModal.value = !openModal.value
    }

    const onOpenModalEdit = () => {
      openModalEdit.value = !openModalEdit.value
    }
    const updatePlaylist = async (newDetails: EditPlayList) => {


      const response = await axios.put(
        `${SPOTIFY_API_BASE_URL}/playlists/${playlistId.value}`,
        { name: newDetails?.title, description: newDetails?.desription },
        {
          headers: { Authorization: `Bearer ${accessToken.value}` },
        }
      );
      console.log('response', response);

      if (response.status === 200) {
        window.location.reload()
        return response.data
      }
    }

    const deletePlaylist = async () => {
      const response = await axios.delete(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId.value}/followers`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      });
      console.log('response', response);

      if (response.status === 200) {
        window.location.href = '/'
        return response.data
      }
    }
    return { openModalEdit, editingPlaylist, onOpenModalEdit, fetchPlaylistById, updatePlaylist, deletePlaylist, onOpenModal, album, formatDuration, searchMusic, searchQuery, open, openPopover, searchResults, searchError, searchInput, addTracksToPlaylist, removeTracksFromPlaylist, openModal };
  },
});
</script>
<template>

  <div class="album-view">
    <div class="album-head">
      <div class="album-img">
        <img v-if="album.cover" :src="album.cover" alt="Album Cover" class="album-cover" />
        <IconMusic v-else class="icon-music" />
      </div>
      <div class="album-info">
        <h1 class="album-title">{{ album.title }}</h1>
        <p>{{ album.description || '' }}</p>
        <p class="album-details">
          <span class="album-label">Create by:</span> {{ album.createBy }}, {{ album.tracks.length
          }}
          songs
        </p>
        <div class="actions">
          <button class="play-button">
            PLAY
          </button>

          <Modal :open-modal="openModal" :on-open="() => {
            onOpenModal()
            openPopover()
          }" :onSubmit="() => {
            deletePlaylist()
            fetchPlaylistById()
          }">
            <template #title>Delete from Your Library?</template>
            <template #message>This will delete My Playlist #3 from Your Library.</template>
            <template #confirm>Delete Playlist</template>
          </Modal>

          <Modal :open-modal="openModalEdit" :on-open="() => {
            console.log('>>>');

            onOpenModalEdit()
            openPopover()
          }" :onSubmit="() => {
            if (!editingPlaylist) return
            updatePlaylist(editingPlaylist)
            fetchPlaylistById()
          }">
            <template #title>Update {{ album.title }} from Your Library?</template>
            <template #message>
              <div class="form-update">
                <input type="text" v-model="editingPlaylist.title" class="input-search" placeholder="Title Playlisr" />
                <input type="text" v-model="editingPlaylist.desription" class="input-search"
                  placeholder="Description Playlisr" />
              </div>
            </template>
            <template #confirm>Update Playlist</template>
          </Modal>
          <Popover :show-popover="open" position="0%" :on-open="openPopover">
            <template #open>
              <div class="more-button" @click="openPopover">
                <InfoIcon class="info-icon" />
              </div>
            </template>
            <template #content>
              <p class="list-more" @click="onOpenModalEdit">Edit Detail</p>
              <p class="list-more" @click="onOpenModal">Delete</p>
            </template>
          </Popover>
        </div>
      </div>
    </div>

    <div class="search-music">
      <div class="search">
        <SearchIcon class="search-icon" />
        <input type="text" v-model="searchQuery" class="input-search" placeholder="Search for music"
          @keyup.enter="searchMusic" />
      </div>
      <p v-if="searchError">{{ searchError }}</p>
    </div>
    <table class="track-list">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Album</th>
          <th>Date added</th>
          <th>
            <TimeIcon class="icon-time" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="searchResults && searchResults.tracks && searchResults.tracks.items"
          v-for="(item, index) in searchResults.tracks.items" :key="item.id">
          <td>
            <div class="action">
              <TickIcon v-if="album.tracks?.map(track => track.track.id).includes(item.id)" class="icon-tick"
                @click="removeTracksFromPlaylist([item.uri])" />
              <PlusIcon v-else class="icon-plus" @click="addTracksToPlaylist([item.uri])" />
            </div>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.album.name }}</td>
          <td>{{ item.album.release_date }}</td>
          <td>{{ formatDuration(item.duration_ms) }}</td>
        </tr>

        <tr v-if="album && album.tracks" v-for="(item, index) in album.tracks" :key="item.track.id">
          <td>
            <div class="action">
              <!-- <PlusIcon class="icon-plus" @click="addTracksToPlaylist([item.track.uri], true)" /> -->
              <TickIcon class="icon-tick" @click="removeTracksFromPlaylist([item.track.uri], true)" />
            </div>
          </td>
          <td>{{ item.track.name }}</td>
          <td>{{ item.track.album.name }}</td>
          <td>{{ item.track.album.release_date }}</td>
          <td>{{ formatDuration(item.track.duration_ms) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.form-update {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;

  input {
    border: 1px solid #1f1f1f;
    border-radius: 500px;
    max-width: 450px;
    width: 100%;
    height: 48px;
    padding: 0 16px 0 16px;
    color: #1f1f1f;

    &:focus-visible {
      outline: 0px;
    }
  }
}

.list-more {
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #b3b3b350;
    border-radius: 5px;
    padding: 10px;
  }
}

.album-img {
  display: flex;
  width: 200px;
  height: 200px;
  align-items: center;
  justify-content: center;
  background-color: #282828;
  border-radius: 4px;
  margin-bottom: 20px;

  .icon-music {
    width: 80px;
    height: 80px;
  }

  .album-cover {
    width: 200px;
    height: 200px;
    border-radius: 4px;

  }
}


th {
  color: #b3b3b3;
}

tr {
  .action {
    display: flex;
    align-items: center;
  }

  &:hover {
    background-color: #b3b3b350;
    border-radius: 5px;
    padding: 5px;
  }
}

.icon-time {
  fill: #b3b3b3;
  width: 16px;
  height: 16px;
}

.icon-plus {
  fill: #b3b3b3;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.icon-tick {
  fill: #1ed760;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.album-head {
  display: flex;
  align-items: end;
  gap: 20px;
}

.album-label {
  color: #b3b3b3;
}

.album-view {
  background-color: #121212;
  color: #fff;
  padding: 20px;
  min-height: 100vh;
  height: auto;
  border-radius: 10px;
}



/* Add more styles as needed */
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  /* Adjust spacing as needed */
  margin-bottom: 20px;
  margin-top: 20px;
}

.more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .info-icon {
    width: 24px;
    height: 24px;
    fill: #fff;
  }
}

.play-button {
  background-color: #1ed760;
  /* Spotify green */
  color: black;
  border: none;
  border-radius: 500px;
  cursor: pointer;
}

.track-list {
  width: 100%;
  border-collapse: collapse;
  /* Prevents double borders */
}

.track-list th,
.track-list td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #282828;
  /* Slightly lighter border */
}

.track-list th {
  position: sticky;
  top: 0;
  background-color: #121212;
}

.search-music {
  width: 100%;
  margin-bottom: 20px;

  .search {
    position: relative;
    width: 100%;

    .input-search {
      background: #1f1f1f;
      border-radius: 500px;
      max-width: 450px;
      width: 100%;
      height: 48px;
      padding: 0 16px 0 50px;
      color: white;
      border: 0px;

      &:focus-visible {
        outline: 0px;
      }
    }

    .search-icon {
      fill: white;
      width: 20px;
      height: 20px;
      position: absolute;
      top: 30%;
      left: 10px;
    }

  }
}
</style>