<template>
  <div v-if="showHeader" class="d-flex flex-column align-items-center">
    <h1 class="mt-3 text-center">Clayton Pool Association</h1>

    <nav class="mt-3 w-100">
      <ul class="nav nav-pills nav-justified px-3 flex-wrap">
        <li class="nav-item">
          <RouterLink class="nav-link" to="/">Home</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/events">Events</RouterLink>
        </li>

        <!-- 👇 Show only if logged in and role is admin -->
        <li v-if="isAdmin" class="nav-item">
          <RouterLink class="nav-link" to="/admin">Admin Dashboard</RouterLink>
        </li>

        <!-- AUTH SLOT -->
        <li v-if="isLoggedIn" class="nav-item">
          <div class="nav-link" @click="logout" style="cursor: pointer">
            Logout
          </div>
        </li>

        <li v-else class="nav-item">
          <RouterLink class="nav-link" to="/loginregister">
            Login | Register
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>

  <RouterView
    class="mt-4 flex-column align-items-center w-100"
    style="width: 95%"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// hide header for special API pages
const showHeader = computed(() => !['GetEventAPI', 'GetSummaryAPI'].includes(route.name))

/* ---------- cookie helpers ---------- */
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + encodeURIComponent(name) + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : null
}
function eraseCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; samesite=lax`
}

/* ---------- session state ---------- */
const sessionUser = ref(null)

function refreshAuth() {
  try {
    sessionUser.value = JSON.parse(localStorage.getItem('sessionUser') || 'null')
  } catch {
    sessionUser.value = null
  }
}

const isLoggedIn = computed(() => {
  const success = getCookie('loginSuccess') === 'true'
  return !!sessionUser.value && success
})

// ✅ computed admin checker
const isAdmin = computed(() => {
  return isLoggedIn.value && sessionUser.value?.role === 'admin'
})

/* ---------- logout ---------- */
function logout() {
  localStorage.removeItem('sessionUser')
  eraseCookie('sessionUser')
  eraseCookie('loginSuccess')
  refreshAuth()
  router.push('/') // optional redirect
}

/* ---------- storage sync ---------- */
function onStorage(e) {
  if (e.key === 'sessionUser' || e.key === null) refreshAuth()
}

onMounted(() => {
  refreshAuth()
  window.addEventListener('storage', onStorage)
})
onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage)
})
</script>


<style scoped>
/* optional: make the logout button look like other pills */
button.nav-link {
  color: var(--bs-nav-pills-link-active-color, #0d6efd);
  text-decoration: none;
}
button.nav-link:hover {
  text-decoration: none;
}
</style>
