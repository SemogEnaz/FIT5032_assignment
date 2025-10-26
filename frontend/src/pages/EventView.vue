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
    <section v-else class="container mt-5">
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

              <button
                v-if="!e.userStatus"
                class="btn btn-dark btn-sm"
                @click="handleEventAction(e)"
              >
                Register
              </button>

              <button
                v-else-if="e.userStatus === 'registered'"
                class="btn btn-warning btn-sm"
                @click="handleEventAction(e)"
              >
                Mark Attendance
              </button>

              <button
                v-else-if="e.userStatus === 'attended'"
                class="btn btn-success btn-sm"
                disabled
              >
                Event Attended
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
  await syncUserStatuses(); // ✅ sync registration state immediately
  initMap();
});

async function getEvents() {
  try {
    const res = await axios.get(
      "https://getrecentevents-5bgqwovi2q-uc.a.run.app"
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
 * ✅ Fetch the user's registration status for all events after load
 */
async function syncUserStatuses() {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user || !user.id) return;

  try {
    for (const e of events.value) {
      const res = await axios.post(
        "https://geteventregistrationstatus-5bgqwovi2q-uc.a.run.app",
        { eventId: e.id, uid: user.id },
        { headers: { "Content-Type": "application/json" } }
      );
      e.userStatus = res.data?.status || null;
    }
  } catch (err) {
    console.error("⚠️ Error syncing user statuses:", err);
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

function day(iso) {
  return new Date(iso).getDate().toString().padStart(2, "0");
}
function mon(iso) {
  return new Date(iso)
    .toLocaleString(undefined, { month: "short" })
    .toUpperCase();
}

/**
 * 🧭 Handle Register / Attendance actions
 */
async function handleEventAction(event) {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user) {
    alert("Please log in to perform this action.");
    return;
  }

  let action = "";
  if (!event.userStatus) action = "register";
  else if (event.userStatus === "registered") action = "attend";
  else return; // already attended

  console.log("📤 Sending:", {
    eventId: event.id,
    uid: user.id,
    email: user.email,
    action,
  });

  try {
    const res = await axios.post(
      "https://registerorattendevent-5bgqwovi2q-uc.a.run.app",
      {
        eventId: event.id,
        uid: user.id,
        email: user.email,
        action,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.data.success) {
      event.userStatus = res.data.status; // ✅ immediately update local state
      alert(res.data.message);
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error("❌ Event action failed:", err);
    alert("Error performing action. Please try again.");
  }
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
