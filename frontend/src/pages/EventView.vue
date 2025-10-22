<template>
  <main class="events-page py-4">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Events</h1>
      <p class="lead mb-0">Find meets, comps, and socials. Map is a placeholder for geo features.</p>
    </section>

    <!-- Filters -->
    <section class="container mb-4">
      <div class="row g-2 justify-content-center">
        <div class="col-12 col-md-6 col-lg-4">
          <input v-model.trim="q" type="search" class="form-control" placeholder="Search events..." />
        </div>
        <div class="col-12 col-md-4 col-lg-3">
          <select v-model="month" class="form-select">
            <option value="">Any month</option>
            <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Mock Map -->
    <section class="container mb-4">
      <div class="position-relative border rounded bg-white" style="height: 360px; overflow: hidden;">
        <div
          v-for="e in filtered"
          :key="e.id"
          class="pin"
          :style="pinStyle(e)"
          :title="e.title"
        ></div>
        <div class="position-absolute end-0 bottom-0 m-2 small px-2 py-1 bg-white border rounded text-secondary">
          Mock map — pins positioned from lat/lng (scaled)
        </div>
      </div>
    </section>

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
              <p class="text-muted mb-2" v-if="e.location">📍 {{ e.location }}</p>
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
import { ref, computed, onMounted } from 'vue'

const q = ref('')
const month = ref('')

const events = ref([])
const error = ref(null)

onMounted(async () => {
  await getEvents()
})

async function getEvents() {
  try {
    const res = await axios.get('https://getrecentevents-5bgqwovi2q-uc.a.run.app')
    console.log(res.data);
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


const months = computed(() => {
  const year = new Date().getFullYear()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1)
    return { value: String(i), label: d.toLocaleString(undefined, { month: 'long' }) }
  })
})

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return events.value
    .filter(e => {
      const matchesQ = !term || `${e.title} ${e.summary} ${e.location}`.toLowerCase().includes(term)
      const m = new Date(e.start).getMonth()
      const matchesMonth = month.value === '' || String(m) === String(month.value)
      return matchesQ && matchesMonth
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start))
})

// Mock map pin placement: scale lat/lng to 0..1 then to canvas size
function pinStyle(e) {
  const latMin = -38.1, latMax = -37.6, lngMin = 144.85, lngMax = 145.20
  const x = (e.lng - lngMin) / (lngMax - lngMin)
  const y = 1 - (e.lat - latMin) / (latMax - latMin)
  return { left: `${x * 100}%`, top: `${y * 100}%` }
}

function day(iso) { return new Date(iso).getDate().toString().padStart(2, '0') }
function mon(iso) { return new Date(iso).toLocaleString(undefined, { month: 'short' }).toUpperCase() }
</script>

<style scoped>
.pin {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #212529; /* bootstrap dark */
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 3px rgba(33, 37, 41, 0.15);
}
</style>
