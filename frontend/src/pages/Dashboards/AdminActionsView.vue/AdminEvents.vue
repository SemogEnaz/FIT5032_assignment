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
        <div class="card d-flex">
          <form @submit.prevent="saveEvent" class="d-flex flex-column gap-2">

            <!--Title-->
            <input v-model.trim="f.title" class="form-control" placeholder="Event title" required />
            <!--Summary-->
            <textarea v-model.trim="f.summary" class="form-control" rows="3" placeholder="Summary / description"></textarea>
            <!--Image-->
            <input v-model.trim="f.image" class="form-control" placeholder="Image URL (optional)" />
            <!--Address-->
            <div class="d-flex flex-column">
              <label class="form-label small">Address</label>
              <div class="d-flex flex-column flex-sm-row gap-1">
                <input v-model.trim="f.street" class="form-control" placeholder="Street Address" required />
                <input v-model.trim="f.suburb" class="form-control" placeholder="Suburb" required />
                <input v-model.trim="f.state" class="form-control" placeholder="State" required />
              </div>
            </div>

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

            <div class="d-flex gap-2 flex-wrap mt-2">
              <button class="btn btn-dark" type="submit">Create</button>
              <button class="btn btn-outline-dark" type="button" @click="reset">Clear</button>
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

const f = reactive({
  title: '',
  summary: '',
  location: '',
  start: '',
  end: '',
  image: '',
  street: '',
  suburb: '',
  state: '',
  lat: null,
  lng: null,
})

const preview = computed(() => ({
  title: f.title,
  summary: f.summary,
  start: f.start ? new Date(f.start).toISOString() : '',
  end: f.end ? new Date(f.end).toISOString() : '',
  street: f.street,
  suburb: f.suburb,
  state: f.state,
  image: f.image,
}))

async function saveEvent() {
  try {
    const payload = {
      title: f.title,
      summary: f.summary,
      start: new Date(f.start).toISOString(),
      end: new Date(f.end).toISOString(),
      street: f.street,
      suburb: f.suburb,
      state: f.state,
      image: f.image,
    }

    console.log(payload);

    const res = await fetch('https://createevent-5bgqwovi2q-uc.a.run.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to create event')
    alert('✅ Event created successfully!')
    console.log('Created event:', data)
    reset()
  } catch (e) {
    console.error('❌ Error creating event:', e)
    alert(`Failed: ${e.message}`)
  }
}

function reset() {
  Object.keys(f).forEach(k => f[k] = (typeof f[k] === 'number' ? null : ''))
}
</script>

<style scoped>
.container { width: min(1100px, 92%); margin: 0 auto; }
.card { padding:1rem; border:1px solid #e5e7eb; border-radius:14px; background:#fff; }
.link-more { text-decoration:none; font-weight:600; }
pre { white-space:pre-wrap; word-break:break-word; }
</style>
