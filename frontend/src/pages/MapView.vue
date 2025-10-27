<template>
  <main class="events-page py-4 d-flex flex-column">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Events Finder</h1>
      <p class="lead mb-0">
        Find upcoming meets, comps, and socials, displayed live on the map.
      </p>
    </section>

    <!-- 🗺️ Map -->
    <div v-if="!error" id="map" style="height:400px; width: 80%"></div>

    <!-- Error -->
    <div v-else class="alert alert-danger text-center container mt-3">
      {{ error }}
    </div>

    <div class="mt-5">
    <h3 class="mb-3 d-flex justify-content-center">Nearby Events</h3>

    <DataTable :value="events" paginator :rows="5" responsiveLayout="scroll" class="w-100">
      <Column field="date" header="Date">
        <template #body="{ data }">{{ formatDate(data.start) }}</template>
      </Column>
      <Column field="title" header="Name"></Column>
      <Column field="location" header="Location">
        <template #body="{ data }">{{ data.street }}, {{ data.suburb }}</template>
      </Column>
      <Column field="distance" header="Distance (km)">
        <template #body="{ data }">{{ data.distance?.toFixed(1) || '-' }}</template>
      </Column>
      <Column header="Action">
          <template #body="{ data }">
            <EventRegistrationButton :event="data" @updated="syncEventStatus" />
          </template>
        </Column>
    </DataTable>
  </div>

  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import mapboxgl from "mapbox-gl";
import axios from "axios";

import DataTable from "primevue/datatable";
import Column from "primevue/column";

import EventRegistrationButton from "@/components/EventRegistrationButton.vue";

const events = ref([]);
const mapInstance = ref(null);
const error = ref(null);

onMounted(async () => {
  await loadMap();
  await loadEvents();
  await syncUserStatuses();
});

async function loadMap() {
  try {
    const res = await axios.get("https://getmapdata-5bgqwovi2q-uc.a.run.app");
    if (!res.data.success) throw new Error(res.data.message);

    const { token, center, zoom, markers } = res.data.map;
    mapboxgl.accessToken = token;

    mapInstance.value = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/standard",
      center,
      zoom,
    });

    mapInstance.value.addControl(new mapboxgl.NavigationControl());
    mapInstance.value.on("load", () => {
      markers.forEach((m) => {
        new mapboxgl.Marker({ color: "red" })
          .setLngLat(m.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${m.popup}</strong>`))
          .addTo(mapInstance.value);
      });
    });
  } catch (err) {
    console.error("❌ Map initialization failed:", err);
    error.value = "Could not load map data.";
  }
}

async function loadEvents() {
  try {
    const res = await axios.get("https://getupcomingevents-5bgqwovi2q-uc.a.run.app");
    events.value = res.data.events || [];
  } catch (err) {
    console.error("Error fetching events:", err);
  }
}

async function syncUserStatuses() {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user?.uid) return;
  for (const e of events.value) {
    const res = await axios.post(
      "https://geteventregistrationstatus-5bgqwovi2q-uc.a.run.app",
      { eventId: e.id, uid: user.uid },
      { headers: { "Content-Type": "application/json" } }
    );
    e.userStatus = res.data?.status || null;
  }
}

function syncEventStatus({ id, status }) {
  const event = events.value.find((e) => e.id === id);
  if (event) event.userStatus = status;
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

</script>


<style scoped>
.text-warning {
  color: #ffc107 !important;
}
</style>
