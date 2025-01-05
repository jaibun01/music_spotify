<script lang="ts">
import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import axios from 'axios'
import IconPlus from './icons/IconPlus.vue'
import IconArrow from './icons/IconArrow.vue'
import IconMusic from './icons/IconMusic.vue'

import type { ItemPlaylist } from '@/interfaces/IPlaylist'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'LeftSidebar',
  components: { IconPlus, IconArrow, IconMusic },

  setup() {
    const accessToken = ref<string | null>(localStorage.getItem('access_token'))
    const loading = ref(true)
    const error = ref<string | null>(null)
    const tracks = ref<ItemPlaylist[]>([])
    const newPlaylistName = ref('')
    const createError = ref<string | null>(null)
    const updateError = ref<string | null>(null)
    const router = useRouter()
    onMounted(() => {
      if (!accessToken.value) return
      fetchPlaylist()
    })
    const spotifyApi = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })
    const fetchPlaylist = async () => {
      try {
        // if (!accessToken.value) return
        // 2. Use the access token to fetch music (e.g., featured playlists)
        const response = await spotifyApi.get(
          `/me/playlists`, // Example: Today's Top Hits playlist
        )

        if (response.data && response.data.items) {
          tracks.value = response.data.items.slice(0, 20).map((item: ItemPlaylist) => item)
        } else {
          error.value = 'No tracks found in the playlist'
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        if (err.response) {
          error.value = `Error: ${err.response.status} - ${err.response.data.error.message}`
        } else if (err.request) {
          error.value = 'Error: No response from server'
        } else {
          error.value = 'Error: Request setup failed'
        }
        if (err.status === 401) {
          localStorage.clear()
          window.location.reload()
        }
      } finally {
        loading.value = false
      }
    }
    const createPlaylist = async () => {
      if (tracks.value.length < 1) return
      createError.value = null // Clear previous errors
      try {
        const response = await spotifyApi.post(`/users/${tracks.value[0].owner.id}/playlists`, {
          name: newPlaylistName.value || `My Playlist #${tracks.value.length + 1}`,
          // public: false, // Or true if you want it public
        })
        // playlists.value.push({ id: response.data.id, name: response.data.name });
        // console.log('response', response.data);
        if (response.data) {
          fetchPlaylist()
          newPlaylistName.value = '' // Clear input field
        }
      } catch (error: any) {
        console.error('Error creating playlist:', error)
        createError.value = error.response?.data?.error?.message || 'Failed to create playlist.'
      }
    }

    const clickToDetial = (id: string) => {
      window.location.href = `/playlist/${id}`
      // router.push(`/playlist/${id}`)
    }
    return { tracks, clickToDetial, createPlaylist }
  },
})
</script>
<template>
  <div class="left-sidebar">
    <div class="l_header">
      <div class="inner-head">
        <!-- $router.go(-1) -->
        <IconArrow class="icon-arrow" @click="$router.push('/')" />
        <p>Your Library</p>
      </div>
      <IconPlus class="icon-plus" @click="createPlaylist" />
    </div>
    <div v-if="tracks && tracks.length > 0" class="l_playlist">
      <!-- @click="$router.push(`/playlist/${track.id}`)" -->
      <div
        class="list"
        v-for="(track, index) in tracks"
        :key="index"
        @click="clickToDetial(track.id)"
      >
        <div class="img">
          <img v-if="track?.images?.[0]?.url" :src="track?.images?.[0].url" :alt="track?.name" />
          <IconMusic v-else class="icon-music" />
        </div>
        <div class="info">
          <p class="title">{{ track?.name || '' }}</p>
          <p class="sub">Playlist • {{ track?.owner?.display_name || '' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.left-sidebar {
  width: 340px;
  background-color: #121212;
  border-radius: 10px;
  padding: 10px 7px;
  color: #b3b3b3;

  .l_header {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;

    .inner-head {
      display: flex;
      align-items: center;
      gap: 10px;

      .icon-arrow {
        rotate: 180deg;
        width: 20px;
        height: 20px;
        fill: #b3b3b3;
        cursor: pointer;
      }
    }

    p {
      font-weight: 700;
      font-size: 18px;
    }

    .icon-plus {
      width: 20px;
      height: 20px;
      fill: #b3b3b3;
      cursor: pointer;
    }
  }

  .l_playlist {
    cursor: pointer;
    padding: 5px;

    .icon-music {
      width: 20px;
      height: 20px;
      fill: #b3b3b3;
    }

    .img {
      width: 44px;
      height: 44px;
      border: 0.5px solid #b3b3b320;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 44px;
        height: 44px;
        border-radius: 5px;
      }
    }

    .list {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
      padding: 5px;

      &:hover {
        background-color: #b3b3b350;
        border-radius: 5px;
        padding: 5px;
      }

      .title {
        color: white;
        font-size: 16px;
      }

      .sub {
        font-size: 14px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        line-clamp: 1;
        -webkit-line-clamp: 1;
      }
    }
  }
}

@media screen and (max-width: 600px) {
  .left-sidebar {
    width: 100%;
  }
}
</style>
