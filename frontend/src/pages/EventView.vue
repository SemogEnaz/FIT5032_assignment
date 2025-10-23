<template>
  <main class="events-page py-4 d-flex flex-column">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Events</h1>
      <p class="lead mb-0">
        Find meets, comps, and socials — displayed live on the map.
      </p>
    </section>

    <!-- 🗺️ Map -->
    <div id="map" style="height:400px; width: 80%"></div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger text-center container mt-3">
      {{ error }}
    </div>

    <!-- Event List -->
    <section v-else class="container">
      <div class="row g-3">
        <div v-for="e in filtered" :key="e.id" class="col-12 col-md-6">
          <div class="card h-100 d-flex">
            <div class="card-body">
              <div class="d-flex align-items-center mb-2 justify-content-between">
                <div class="d-flex align-items-center">
                  <div
                    class="text-center bg-dark text-white rounded p-2 me-3"
                    style="min-width:68px;"
                  >
                    <div class="fw-bold fs-5">{{ day(e.start) }}</div>
                    <div class="small">{{ mon(e.start) }}</div>
                  </div>
                  <h5 class="mb-0">{{ e.title }}</h5>
                </div>

                <!-- ⭐ Rating display -->
                <div v-if="e.avgRating" class="text-warning small">
                  ★ {{ e.avgRating.toFixed(1) }} ({{ e.ratingCount }})
                </div>
                <div v-else class="text-muted small">No ratings</div>
              </div>

              <p class="text-muted mb-2">
                📍 {{ e.street }}, {{ e.suburb }}, {{ e.state }}
              </p>
              <p class="mb-3 mx-2">{{ e.summary }}</p>

              <button class="btn btn-dark btn-sm" @click="registerForEvent(e.id)">
                Register
              </button>

              <!-- Rating widget component -->
              <RatingWidget
                :item-id="e.id"
                kind="event"
                class="mt-3"
                @rated="updateEventRating"
              />
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="col-12">
          <div class="border rounded p-4 text-center text-secondary">
            No events found.
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import RatingWidget from "../components/RatingWidget.vue";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import { ref, computed, onMounted } from "vue";

mapboxgl.accessToken =
  "pk.eyJ1IjoiemFuZWdvbWVzIiwiYSI6ImNrdWdkbTAyaTBwbDIybm9reDc2YTN1cTUifQ.VjtSCzzUg7gg64u2HaAnBg";

let mapInstance = null;
const q = ref("");
const month = ref("");
const events = ref([]);
const error = ref(null);

onMounted(async () => {
  await getEvents();
  initMap();
});

async function getEvents() {
  try {
    const res = await axios.get(
      "https://getrecentevents-5bgqwovi2q-uc.a.run.app"
    );
    if (res.data?.success && Array.isArray(res.data.events)) {
      // 🔹 If the event doesn’t have ratings, default to 0
      events.value = res.data.events.map((e) => ({
        ...e,
        avgRating: e.avgRating || 0,
        ratingCount: e.ratingCount || 0,
      }));
    } else {
      throw new Error("Unexpected API response");
    }
  } catch (err) {
    console.error("Error fetching events:", err);
    error.value = "Failed to load events.";
  }
}

function initMap() {
  mapInstance = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/standard",
    center: [144.9631, -37.8136],
    zoom: 10,
  });

  mapInstance.addControl(new mapboxgl.NavigationControl());

  mapInstance.on("load", () => {
    console.log("🗺️ Map loaded");
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

const filtered = computed(() => {
  const term = q.value.toLowerCase();
  return events.value
    .filter((e) => {
      const matchesQ =
        !term ||
        `${e.title} ${e.summary} ${e.street} ${e.suburb}`
          .toLowerCase()
          .includes(term);
      const m = new Date(e.start).getMonth();
      const matchesMonth =
        month.value === "" || String(m) === String(month.value);
      return matchesQ && matchesMonth;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));
});

const registering = ref(false);

async function registerForEvent(eventId) {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user || !user.email) {
    alert("Please log in to register for events.");
    return;
  }

  registering.value = true;
  try {
    const res = await axios.post(
      "https://registerforevent-5bgqwovi2q-uc.a.run.app",
      {
        eventId,
        uid: user.id,
        email: user.email,
      }
    );

    console.log("✅ Registration success:", res.data);
    alert(`You are registered for "${res.data.title || "this event"}"!`);
  } catch (err) {
    console.error("❌ Registration failed:", err);
    alert("Failed to register. Please try again.");
  } finally {
    registering.value = false;
  }
}

function day(iso) {
  return new Date(iso).getDate().toString().padStart(2, "0");
}
function mon(iso) {
  return new Date(iso)
    .toLocaleString(undefined, { month: "short" })
    .toUpperCase();
}

function updateEventRating({ eventId, avgRating, ratingCount }) {
  const event = events.value.find((e) => e.id === eventId);
  if (event) {
    event.avgRating = avgRating;
    event.ratingCount = ratingCount;
  }
}
</script>

<style scoped>
.text-warning {
  color: #ffc107 !important;
}
</style>
