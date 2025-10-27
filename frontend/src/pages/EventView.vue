<template>
  <main class="events-page py-4 d-flex flex-column">
    <!-- Header -->
    <section class="container text-center mb-2">
      <h1 class="mb-2">Rate Events</h1>
      <p class="lead mb-0">
        Check out how our past events went! And leave your feedback...
      </p>
    </section>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger text-center container mt-3">
      {{ error }}
    </div>

    <!-- Event List -->
    <section v-else class="container mt-5">
      <div class="row g-3">
        <div v-if="filtered.length === 0" class="col-12">
          <div class="border rounded p-4 text-center text-secondary">
            No events found.
          </div>
        </div>
        <div v-else v-for="e in filtered" :key="e.id" class="col-12 col-md-6">
          <EventCard
            :event="e"
            @rated="updateEventRating"
            @updated="syncUserStatuses"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import EventCard from "@/components/EventCard.vue";

const q = ref("");
const month = ref("");
const events = ref([]);
const error = ref(null);

onMounted(async () => {
  await getEvents();
  await syncUserStatuses(); // ✅ sync registration state immediately
});

async function getEvents() {
  try {
    const res = await axios.get(
      "https://getpastevents-5bgqwovi2q-uc.a.run.app"
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
  if (!user || !user.uid) return;

  try {
    for (const e of events.value) {
      const res = await axios.post(
        "https://geteventregistrationstatus-5bgqwovi2q-uc.a.run.app",
        { eventId: e.id, uid: user.uid },
        { headers: { "Content-Type": "application/json" } }
      );
      e.userStatus = res.data?.status || null;
    }
  } catch (err) {
    console.error("⚠️ Error syncing user statuses:", err);
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
