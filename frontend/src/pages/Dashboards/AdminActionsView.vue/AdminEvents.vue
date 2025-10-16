<template>
  <main class="admin-events py-4">
    <section class="container mb-4">
      <div class="d-flex align-items-baseline justify-content-between gap-2">
        <div>
          <h1 class="mb-1">Create Event</h1>
          <p class="text-muted mb-0">Calendar-shaped payload for easy API plug-in later.</p>
        </div>
        <router-link class="link-more" to="/admin">← Admin home</router-link>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="card" style="grid-template-columns:1fr;">
          <form @submit.prevent="createEvent" class="d-grid gap-2">
            <input v-model.trim="f.summary" class="form-control" placeholder="Title / Summary" required />
            <input v-model.trim="f.location" class="form-control" placeholder="Location (optional)" />
            <textarea v-model.trim="f.description" class="form-control" rows="3" placeholder="Description (optional)"></textarea>

            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small">Start</label>
                <input v-model="f.start" type="datetime-local" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label small">End</label>
                <input v-model="f.end" type="datetime-local" class="form-control" required />
              </div>
            </div>

            <label class="form-label small mb-0">Invitees (comma-separated emails)</label>
            <input v-model.trim="f.attendeesCsv" class="form-control" placeholder="alice@ex.com, bob@ex.com" />

            <div class="d-flex gap-2 flex-wrap mt-2">
              <button class="btn btn-dark" type="submit">Create</button>
              <button class="btn btn-outline-dark" type="button" @click="reset()">Clear</button>
            </div>
          </form>
        </div>

        <div class="mt-3 small text-muted">
          <strong>Preview payload:</strong>
          <pre class="mt-2 bg-light p-2 rounded">{{ preview }}</pre>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive } from 'vue'

const calendarId = 'clayton-pool-association@calendar.example'

const f = reactive({
  summary: '',
  description: '',
  location: '',
  start: '', // 'YYYY-MM-DDTHH:mm'
  end: '',
  attendeesCsv: ''
})

const preview = computed(() => {
  const attendees = (f.attendeesCsv || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(email => ({ email }))
  return {
    calendarId,
    summary: f.summary,
    description: f.description || undefined,
    location: f.location || undefined,
    start: { dateTime: f.start ? new Date(f.start).toISOString() : undefined },
    end:   { dateTime: f.end   ? new Date(f.end).toISOString()   : undefined },
    attendees
  }
})

function createEvent() {
  alert('Mock create:\n' + JSON.stringify(preview.value, null, 2))
  reset()
}
function reset() {
  f.summary = f.description = f.location = f.attendeesCsv = ''
  f.start = f.end = ''
}
</script>

<style scoped>
.container { width: min(1100px, 92%); margin: 0 auto; }
.card { padding:1rem; border:1px solid #e5e7eb; border-radius:14px; background:#fff; }
.link-more { text-decoration:none; font-weight:600; }
pre { white-space:pre-wrap; word-break:break-word; }
</style>
