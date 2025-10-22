<template>
  <main class="events-page py-4 d-flex flex-column">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Events</h1>
      <p class="lead mb-0">Find meets, comps, and socials — displayed live on the map.</p>
    </section>


    <!-- 🗺️ Real Mapbox Map -->
    <div id="map" style="height:400px; width: 80%"></div>

    <!-- List -->
    <div v-if="error" class="alert alert-danger text-center container mt-3">
      {{ error }}
    </div>

    <section v-else class="container">
      <div class="row g-3">
        <div v-for="e in filtered" :key="e.id" class="col-12 col-md-6">
          <div class="card h-100 d-flex">
            <div class="card-body">
              <div class="d-flex align-items-center mb-2">
                <div class="text-center bg-dark text-white rounded p-2 me-3" style="min-width:68px;">
                  <div class="fw-bold fs-5">{{ day(e.start) }}</div>
                  <div class="small">{{ mon(e.start) }}</div>
                </div>
                <h5 class="mb-0">{{ e.title }}</h5>
              </div>
              <p class="text-muted mb-2">📍 {{ e.street }}, {{ e.suburb }}, {{ e.state }}</p>
              <p class="mb-3 mx-2">{{ e.summary }}</p>
              <router-link class="btn btn-dark btn-sm" :to="`/events/${e.id}`">Details</router-link>
              <RatingWidget :item-id="e.id" kind="event" class="mt-3" />
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="col-12">
          <div class="border rounded p-4 text-center text-secondary">No events found.</div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import RatingWidget from '../components/RatingWidget.vue'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import { ref, computed, onMounted } from 'vue'

mapboxgl.accessToken = 'pk.eyJ1IjoiemFuZWdvbWVzIiwiYSI6ImNrdWdkbTAyaTBwbDIybm9reDc2YTN1cTUifQ.VjtSCzzUg7gg64u2HaAnBg'

let mapInstance = null
const q = ref('')
const month = ref('')
const events = ref([])
const error = ref(null)

onMounted(async () => {
  await getEvents()
  initMap()
})

async function getEvents() {
  try {
    const res = await axios.get('https://getrecentevents-5bgqwovi2q-uc.a.run.app')
    if (res.data?.success && Array.isArray(res.data.events)) {
      events.value = res.data.events
    } else {
      throw new Error('Unexpected API response')
    }
  } catch (err) {
    console.error('Error fetching events:', err)
    error.value = 'Failed to load events.'
  }
}

function initMap() {

  mapInstance = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [144.9631, -37.8136],
    zoom: 10,
  })

  mapInstance.addControl(new mapboxgl.NavigationControl())

  mapInstance.on('load', () => {
    console.log('🗺️ Map loaded')
    addMarkers(events.value)
  })

}

function addMarkers(eventsList) {
  if (!mapInstance) return

  // Remove previous markers
  document.querySelectorAll('.mapboxgl-marker').forEach(m => m.remove())

  const raw = JSON.parse(JSON.stringify(eventsList))
  console.log('✅ Adding markers:', raw)

  raw.forEach(e => {
    if (typeof e.lng !== 'number' || typeof e.lat !== 'number') return

    console.log(e.lng, e.lat)

    // Create a default marker with popup (classic Mapbox style)
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<strong>${e.title}</strong><br>${e.street}, ${e.suburb}`)

    new mapboxgl.Marker({ color: 'red', rotation: 0 }) // red pin
      .setLngLat([e.lng, e.lat])
      .setPopup(popup)
      .addTo(mapInstance)
  })

  // Fit map bounds
  if (raw.length) {
    const bounds = new mapboxgl.LngLatBounds()
    raw.forEach(e => bounds.extend([e.lng, e.lat]))
    mapInstance.fitBounds(bounds, { padding: 50 })
  }
}


const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return events.value
    .filter(e => {
      const matchesQ = !term || `${e.title} ${e.summary} ${e.street} ${e.suburb}`.toLowerCase().includes(term)
      const m = new Date(e.start).getMonth()
      const matchesMonth = month.value === '' || String(m) === String(month.value)
      return matchesQ && matchesMonth
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start))
})

function day(iso) { return new Date(iso).getDate().toString().padStart(2, '0') }
function mon(iso) { return new Date(iso).toLocaleString(undefined, { month: 'short' }).toUpperCase() }
</script>

<style scoped>
</style>