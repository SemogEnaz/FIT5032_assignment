<template>
  <main class="container admin-events py-4">
    <div class="position-relative my-4">
      <RouterLink to="/admin" class="link position-absolute start-0 top-50 translate-middle-y fw-semibold text-decoration-none">← Admin home</RouterLink>
      <h1 class="text-center mb-0">Create Event</h1>
    </div>

    <section class="section">
      <div class="">
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
            </div>

            <div class="d-flex gap-2 flex-wrap mt-2">
              <button class="btn btn-dark" type="submit">Create</button>
              <button class="btn btn-outline-dark" type="button" @click="reset">Clear</button>
            </div>
          </form>
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
  image: '',
  street: '',
  suburb: '',
  state: '',
  start: '',
  lat: null,
  lng: null,
})

const preview = computed(() => ({
  title: f.title,
  summary: f.summary,
  start: f.start ? new Date(f.start).toISOString() : '',
  street: f.street,
  suburb: f.suburb,
  state: f.state,
  lat: f.lat,
  lng: f.lng,
  image: f.image,
}));

async function getLatLng() {
  try {
    const res = await fetch("https://us-central1-fit5032-week6-da697.cloudfunctions.net/getLatLngFromAddress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        street: f.street,
        suburb: f.suburb,
        state: f.state,
        country: "Australia",
      }),
    });
    const data = await res.json();
    if (data.success) {
      f.lat = data.lat;
      f.lng = data.lng;
      console.log("✅ Coordinates:", data.lat, data.lng);
    } else {
      alert("⚠️ Could not get coordinates: " + data.message);
    }
  } catch (err) {
    console.error("❌ Error fetching coordinates:", err);
  }
}

async function saveEvent() {
  try {

    await getLatLng();

    const payload = {
      title: f.title,
      summary: f.summary,
      start: new Date(f.start).toISOString(),
      street: f.street,
      suburb: f.suburb,
      state: f.state,
      lat: f.lat,
      lng: f.lng,
      image: f.image,
      intrest: 0, attendance: 0
    };

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
