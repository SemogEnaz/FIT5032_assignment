<template>
  <main class="events-page py-4 d-flex flex-column align-items-center justify-content-center">
    
    <section class="container text-center mb-4">
      <h1 class="mb-2">Events Finder</h1>
      <p class="lead mb-0">
        Find upcoming meets, comps, and socials, displayed live on the map.
      </p>
    </section>

    <div v-if="!events.length" class="text-center mt-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Loading events and distances...</p>
    </div>

    <div v-if="!error" id="map" style="height:400px; width: 90%" class="mb-2"></div>

    <div v-else class="alert alert-danger text-center container mt-3">
      {{ error }}
    </div>

    <div class="mb-2 mt-5">
      <h3 class="d-flex justify-content-center">Upcoming Events</h3>
      <p>Please click on any given row to view event on map!</p>
    </div>

    <DataTable
      :value="events"
      paginator
      :rows="5"
      responsiveLayout="scroll"
      style="width: 90%; cursor:pointer;"
      @row-click="focusEventOnMap"
    >
      <Column field="start" header="Date" sortable :sortFunction="sortByDate">
        <template #body="{ data }">{{ formatDate(data.start) }}</template>
      </Column>

      <Column field="title" header="Name" sortable></Column>

      <Column header="Location">
        <template #body="{ data }">{{ data.street }}, {{ data.suburb }}</template>
      </Column>

      <Column field="distance" header="Distance (km)" sortable :sortFunction="sortByDistance" class="text-center">
        <template #body="{ data }">{{ data.distance?.toFixed(1) || 'Fetching...' }}</template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <div class="d-flex flex-column flex-md-row gap-2">
            <EventRegistrationButton :event="data" @updated="syncEventStatus" />

            <button
              class="btn btn-outline-primary btn-sm"
              @click="showRouteToEvent(data)"
            >
              Navigate
            </button>
          </div>
        </template>
      </Column>
    </DataTable>

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
const markerRefs = ref({});

onMounted(async () => {
  loadMap();
  await loadEvents();
  await syncUserStatuses();
  await calculateDistances();
});

let currentMarker = null;
let routeLayerId = "route-layer";
let routeSourceId = "route-source";

async function showRouteToEvent(event) {
  if (!event.lat || !event.lng) {
    alert("This event does not have valid coordinates.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    // ✅ Remove previous blue marker if it exists
    if (currentMarker) {
      currentMarker.remove();
    }

    // ✅ Add blue marker for current location
    currentMarker = new mapboxgl.Marker({ color: "blue" })
      .setLngLat([userLng, userLat])
      .setPopup(new mapboxgl.Popup().setText("Your Location"))
      .addTo(mapInstance.value);

    // ✅ Fetch driving route using Mapbox Directions API
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${event.lng},${event.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
    const res = await fetch(directionsUrl);
    const data = await res.json();

    if (!data.routes?.length) {
      alert("No route found.");
      return;
    }

    const route = data.routes[0].geometry;

    // ✅ Remove existing route if any
    if (mapInstance.value.getLayer(routeLayerId)) {
      mapInstance.value.removeLayer(routeLayerId);
    }
    if (mapInstance.value.getSource(routeSourceId)) {
      mapInstance.value.removeSource(routeSourceId);
    }

    // ✅ Add new route layer
    mapInstance.value.addSource(routeSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: route,
      },
    });

    mapInstance.value.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeSourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#007AFF", // blue route
        "line-width": 5,
      },
    });

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userLng, userLat]);
    bounds.extend([event.lng, event.lat]);
    mapInstance.value.fitBounds(bounds, { padding: 60 });
  }, (err) => {
    console.error("Geolocation error:", err);
    alert("Could not get your location.");
  });
}

function sortByDate(event) {
  const data = [...event.data];
  data.sort((a, b) => {
    const dateA = new Date(a.start);
    const dateB = new Date(b.start);
    return event.order * (dateA - dateB);
  });
  return data;
}

function sortByDistance(event) {
  const data = [...event.data];
  data.sort((a, b) => {
    const distA = a.distance ?? Infinity;
    const distB = b.distance ?? Infinity;
    return event.order * (distA - distB);
  });
  return data;
}

function focusEventOnMap({ data }) {
  if (!mapInstance.value || !data.lat || !data.lng) return;

  mapInstance.value.flyTo({
    center: [data.lng, data.lat],
    zoom: 14,
    speed: 1.2,
    curve: 1,
    essential: true
  });

  // Open popup if marker exists
  const ref = markerRefs.value[data.id];
  if (ref?.popup) {
    ref.popup.addTo(mapInstance.value);
  }
}

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
        const popup = new mapboxgl.Popup().setHTML(`<strong>${m.popup}</strong>`);
        const marker = new mapboxgl.Marker({ color: "red" })
          .setLngLat(m.coordinates)
          .setPopup(popup)
          .addTo(mapInstance.value);

        // Store reference keyed by event ID if you have it
        markerRefs.value[m.id] = { marker, popup };
      });
    });
  } catch (err) {
    console.error("❌ Map initialization failed:", err);
    error.value = "Could not load map data.";
  }
}

async function calculateDistances() {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const origin = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      for (const e of events.value) {
        if (!e.lat || !e.lng) continue;

        try {
          const res = await axios.post(
            "https://getdrivingdistance-5bgqwovi2q-uc.a.run.app",
            { origin, destination: { lat: e.lat, lng: e.lng } },
            { headers: { "Content-Type": "application/json" } }
          );

          if (res.data.success) {
            e.distance = res.data.distanceKm;
          } else {
            e.distance = null;
          }
        } catch (err) {
          console.error(`Error getting distance for ${e.title}:`, err);
        }
      }
    },
    (err) => {
      console.warn("User denied location access:", err);
    }
  );
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
