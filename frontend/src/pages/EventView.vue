<!-- ============================= -->
<!-- EventsPage.vue (mock map)     -->
<!-- ============================= -->
<template>
  <main class="page events">
    <section class="hero--sm">
      <h1>Events</h1>
      <p class="lead">Find meets, comps, and socials. Map is a placeholder for geo features.</p>
    </section>

    <section class="container filters">
      <input v-model.trim="q" class="input" placeholder="Search events..." />
      <select v-model="month" class="select">
        <option value="">Any month</option>
        <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
    </section>

    <!-- Mock map -->
    <section class="container map">
      <div class="map__canvas">
        <div
          v-for="e in filtered"
          :key="e.id"
          class="pin"
          :style="pinStyle(e)"
          :title="e.title"
        ></div>
        <div class="map__legend">Mock map – pins positioned from lat/lng (scaled)</div>
      </div>
    </section>

    <!-- List -->
    <section class="container list">
      <article v-for="e in filtered" :key="e.id" class="event">
        <div class="event__date">
          <span class="day">{{ day(e.start) }}</span>
          <span class="mon">{{ mon(e.start) }}</span>
        </div>
        <div class="event__body">
          <h2 class="title">{{ e.title }}</h2>
          <p class="meta">📍 {{ e.location }} · {{ long(e.start) }}</p>
          <p class="desc">{{ e.summary }}</p>
          <router-link class="btn btn--sm" :to="`/events/${e.id}`">Details</router-link>
        </div>
      </article>
      <div v-if="filtered.length===0" class="empty">No events found.</div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => [
      { id: 'open', title: 'Open Night', start: '2025-09-06T18:30:00', location: 'Main Hall', summary: 'Meet & greet + free play.', lat: -37.8136, lng: 144.9631 },
      { id: 'clinic', title: 'Coaching Clinic', start: '2025-09-12T10:00:00', location: 'Training Room', summary: 'Small group session.', lat: -37.7000, lng: 145.0000 },
      { id: 'league-r1', title: 'League Round 1', start: '2025-10-01T19:00:00', location: 'Court 2', summary: 'First round of league.', lat: -37.9000, lng: 145.1000 },
      { id: 'social', title: 'Friday Social', start: '2025-09-19T19:30:00', location: 'Lounge', summary: 'Casual matches + pizza.', lat: -37.8200, lng: 144.9900 }
    ]
  }
})

const q = ref('')
const month = ref('')

const months = computed(() => {
  const year = new Date().getFullYear()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1)
    return { value: String(i), label: d.toLocaleString(undefined, { month: 'long' }) }
  })
})

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return props.events.filter(e => {
    const matchesQ = !term || `${e.title} ${e.summary} ${e.location}`.toLowerCase().includes(term)
    const m = new Date(e.start).getMonth()
    const matchesMonth = month.value === '' || String(m) === String(month.value)
    return matchesQ && matchesMonth
  }).sort((a,b)=> new Date(a.start) - new Date(b.start))
})

// Mock map pin placement: scale lat/lng to 0..1 then to canvas size
function pinStyle(e){
  const latMin=-38.1, latMax=-37.6, lngMin=144.85, lngMax=145.20
  const x = (e.lng - lngMin) / (lngMax - lngMin)
  const y = 1 - (e.lat - latMin) / (latMax - latMin)
  return { left: `${x*100}%`, top: `${y*100}%` }
}

function day(iso){ return new Date(iso).getDate().toString().padStart(2,'0') }
function mon(iso){ return new Date(iso).toLocaleString(undefined,{ month:'short'}).toUpperCase() }
function long(iso){ return new Date(iso).toLocaleString(undefined,{ year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'}) }
</script>

<style scoped>
.page { display: grid; gap: 1.5rem; }
.hero--sm { padding: 1.5rem 0 0; text-align: center; }
.container { width: min(1100px, 92%); margin: 0 auto; }
.filters { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }
.input, .select { padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 10px; min-width: 220px; }
.map__canvas { position: relative; height: 360px; border-radius: 16px; border: 1px solid #e5e7eb; background: repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px); overflow: hidden; }
.pin { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #111827; transform: translate(-50%, -50%); box-shadow: 0 0 0 3px rgba(17,24,39,.15); }
.map__legend { position: absolute; right: 8px; bottom: 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 4px 8px; font-size: .85rem; color: #374151; }
.list { display: grid; gap: 0.8rem; }
.event { display: grid; grid-template-columns: 76px 1fr; gap: 0.8rem; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; padding: 1rem; }
.event__date { display: grid; place-items: center; background: #111827; color: #fff; border-radius: 10px; font-weight: 700; }
.day { font-size: 1.35rem; line-height: 1; }
.mon { font-size: 0.75rem; letter-spacing: 1px; opacity: 0.9; }
.title { margin: 0; font-size: 1.15rem; }
.meta { margin: 0.2rem 0 0.5rem; color: #6b7280; }
.desc { margin: 0 0 0.6rem; color: #374151; }
.btn { border: 1px solid #111827; background: #111827; color: #fff; padding: 0.45rem 0.8rem; border-radius: 10px; text-decoration: none; }
</style>