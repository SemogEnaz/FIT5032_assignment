<template>
  <main class="user-dash py-4">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Your Dashboard</h1>
      <p class="text-muted mb-0">Welcome back! Here’s what’s coming up, what you’ve missed, and a quick way to stay in the loop.</p>
    </section>

    <!-- Upcoming (from “calendar API”) -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Upcoming Events</h2>
          <router-link class="link-more" to="/events">Browse all events →</router-link>
        </div>

        <div class="cards">
          <article v-for="e in upcomingMine" :key="e.id" class="card">
            <div class="card__date">
              <div class="card__day">{{ day(e.start.dateTime) }}</div>
              <div class="card__mon">{{ mon(e.start.dateTime) }}</div>
            </div>
            <div>
              <h3 class="card__title">{{ e.summary }}</h3>
              <p class="card__meta">{{ formatRange(e.start.dateTime, e.end.dateTime) }} · {{ e.location || 'TBA' }}</p>
              <p class="card__desc">{{ e.description }}</p>
              <router-link class="btn btn--sm" :to="`/events/${e.id}`">View details</router-link>
            </div>
          </article>

          <div v-if="upcomingMine.length === 0" class="empty">
            <p>No upcoming registrations. Explore the <router-link to="/events">events</router-link> page to join one!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Recently finished (top 3) -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Recently Finished</h2>
          <router-link class="link-more" to="/events">See past events →</router-link>
        </div>

        <div class="cards">
          <article v-for="e in top3PastMine" :key="e.id" class="card">
            <div class="card__date">
              <div class="card__day">{{ day(e.start.dateTime) }}</div>
              <div class="card__mon">{{ mon(e.start.dateTime) }}</div>
            </div>
            <div>
              <h3 class="card__title">{{ e.summary }}</h3>
              <p class="card__meta">Ended {{ formatLongDate(e.end.dateTime) }} · {{ e.location || 'TBA' }}</p>
              <p class="card__desc">{{ e.description }}</p>
              <router-link class="btn btn--sm" :to="`/events/${e.id}`">Event recap</router-link>
            </div>
          </article>

          <div v-if="top3PastMine.length === 0" class="empty">
            <p>No previous events yet.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Newsletter</h2>
        </div>

        <div class="newsletter card" style="grid-template-columns:1fr;">
          <form @submit.prevent="subscribe" class="d-flex flex-wrap gap-2">
            <input v-model.trim="newsletterEmail" type="email" class="form-control" placeholder="you@example.com" required />
            <button class="btn btn--primary" type="submit">Subscribe</button>
          </form>
          <p v-if="newsletterMsg" class="text-success mt-2">{{ newsletterMsg }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

/**
 * MOCK: current user identity used to match calendar attendees.
 * When you wire a real provider, use the signed-in email / uid.
 */
const myEmail = 'zane@example.com'

/**
 * MOCK “Calendar API” data (Google Calendar–like)
 * Later: replace with a real fetch (timeMin/timeMax, q, calendarId).
 */
const siteCalendarId = 'clayton-pool-association@calendar.example' // unique per site
const events = ref([
  {
    id: 'league-r1',
    calendarId: siteCalendarId,
    summary: 'League Round 1',
    description: 'Opening round of the season. Warm-up from 6:30pm.',
    location: 'Court 2',
    start: { dateTime: '2025-10-28T19:00:00' },
    end:   { dateTime: '2025-10-28T21:00:00' },
    attendees: [{ email: myEmail }, { email: 'coach@cpa.org' }]
  },
  {
    id: 'clinic-1',
    calendarId: siteCalendarId,
    summary: 'Coaching Clinic',
    description: 'Small group technique clinic.',
    location: 'Training Room',
    start: { dateTime: '2025-11-04T10:00:00' },
    end:   { dateTime: '2025-11-04T12:00:00' },
    attendees: [{ email: 'someone@ex.com' }]
  },
  {
    id: 'open-night',
    calendarId: siteCalendarId,
    summary: 'Club Open Night',
    description: 'Meet the community & try the tables.',
    location: 'Main Hall',
    start: { dateTime: '2025-09-06T18:30:00' },
    end:   { dateTime: '2025-09-06T21:00:00' },
    attendees: [{ email: myEmail }]
  },
  {
    id: 'social-fri',
    calendarId: siteCalendarId,
    summary: 'Friday Social',
    description: 'Casual matches + pizza.',
    location: 'Lounge',
    start: { dateTime: '2025-09-19T19:30:00' },
    end:   { dateTime: '2025-09-19T22:00:00' },
    attendees: [{ email: myEmail }]
  }
])

const now = new Date()

const mine = computed(() =>
  events.value.filter(e =>
    e.calendarId === siteCalendarId &&
    (e.attendees || []).some(a => a.email?.toLowerCase() === myEmail.toLowerCase())
  )
)

const upcomingMine = computed(() =>
  mine.value
    .filter(e => new Date(e.start.dateTime) >= now)
    .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime))
)

const pastMine = computed(() =>
  mine.value
    .filter(e => new Date(e.end.dateTime) < now)
    .sort((a, b) => new Date(b.end.dateTime) - new Date(a.end.dateTime))
)

const top3PastMine = computed(() => pastMine.value.slice(0, 3))

// Newsletter
const newsletterEmail = ref('')
const newsletterMsg = ref('')
function subscribe() {
  // later: POST to server; for now just mock success
  newsletterMsg.value = `Subscribed ${newsletterEmail.value} — welcome!`
  newsletterEmail.value = ''
}

// UI helpers
function day(iso) { return new Date(iso).getDate().toString().padStart(2, '0') }
function mon(iso) { return new Date(iso).toLocaleString(undefined, { month: 'short' }).toUpperCase() }
function formatLongDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}
function formatRange(startIso, endIso) {
  const s = new Date(startIso), e = new Date(endIso)
  const date = s.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  const st = s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  const et = e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${st}–${et}`
}
</script>

<style scoped>
.container { width: min(1100px, 92%); margin: 0 auto; }
.section { padding: 1rem 0 0.5rem; }
.section__header { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
.section__title { font-size: clamp(1.4rem, 2.5vw, 2rem); margin:0; }
.link-more { text-decoration:none; font-weight:600; }

.cards { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px,1fr)); gap:1rem; }
.card { display:grid; grid-template-columns:76px 1fr; gap:0.75rem; padding:1rem; border:1px solid #e5e7eb; border-radius:14px; background:#fff; box-shadow:0 1px 0 rgba(0,0,0,.04); }
.card__date { display:grid; place-items:center; background:#111827; color:#fff; border-radius:10px; font-weight:700; }
.card__day { font-size:1.35rem; line-height:1; }
.card__mon { font-size:.75rem; letter-spacing:1px; opacity:.9; }
.card__title { margin:0; font-size:1.05rem; }
.card__meta { margin:.2rem 0 .5rem; color:#6b7280; font-size:.9rem; }
.card__desc { color:#374151; margin:0 0 .75rem; }

.empty { border:2px dashed #e5e7eb; border-radius:12px; padding:1rem; text-align:center; color:#6b7280; }
.newsletter { padding:1rem; border:1px solid #e5e7eb; border-radius:14px; background:#fff; }
</style>
