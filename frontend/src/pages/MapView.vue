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
    <div id="map" style="height:400px; width: 80%"></div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger text-center container mt-3">
      {{ error }}
    </div>

  </main>
</template>

<script setup>
import axios from "axios";
import mapboxgl from "mapbox-gl";
import { ref, onMounted } from "vue";

mapboxgl.accessToken =
  "pk.eyJ1IjoiemFuZWdvbWVzIiwiYSI6ImNrdWdkbTAyaTBwbDIybm9reDc2YTN1cTUifQ.VjtSCzzUg7gg64u2HaAnBg";

let mapInstance = null;
const events = ref([]);
const error = ref(null);

onMounted(async () => {
  await getEvents();
  initMap();
});

async function getEvents() {
  try {
    const res = await axios.get(
      "https://getupcomingevents-5bgqwovi2q-uc.a.run.app"
    );
    if (res.data?.success && Array.isArray(res.data.events)) {
      events.value = res.data.events.map((e) => ({
        ...e,
        avgRating: e.avgRating || 0,
        ratingCount: e.ratingCount || 0,
        userStatus: null, // 👈 placeholder until we sync
      }));
    } else {
      throw new Error("Unexpected API response");
    }
  } catch (err) {
    console.error("Error fetching events:", err);
    error.value = "Failed to load events.";
  }
}

/**
 * 🗺️ Initialize map
 */
function initMap() {
  mapInstance = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/standard",
    center: [144.9631, -37.8136],
    zoom: 10,
  });

  mapInstance.addControl(new mapboxgl.NavigationControl());

  mapInstance.on("load", () => {
    addMarkers(events.value);
  });
}

function addMarkers(eventsList) {
  if (!mapInstance) return;
  document.querySelectorAll(".mapboxgl-marker").forEach((m) => m.remove());

  const raw = JSON.parse(JSON.stringify(eventsList));
  raw.forEach((e) => {
    if (typeof e.lng !== "number" || typeof e.lat !== "number") return;

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<strong>${e.title}</strong><br>${e.street}, ${e.suburb}`
    );

    new mapboxgl.Marker({ color: "red" })
      .setLngLat([e.lng, e.lat])
      .setPopup(popup)
      .addTo(mapInstance);
  });

  if (raw.length) {
    const bounds = new mapboxgl.LngLatBounds();
    raw.forEach((e) => bounds.extend([e.lng, e.lat]));
    mapInstance.fitBounds(bounds, { padding: 50 });
  }
}
</script>


<style scoped>
.text-warning {
  color: #ffc107 !important;
}
</style>
