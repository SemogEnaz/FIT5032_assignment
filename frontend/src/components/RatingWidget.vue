<template>
  <div class="rating-widget">
    <!-- Require login -->
    <div
      v-if="!isLoggedIn()"
      class="alert alert-warning d-flex justify-content-between align-items-center"
      role="alert"
    >
      <div><strong>Sign in</strong> to rate this {{ kind }}.</div>
      <router-link to="/loginregister" class="btn btn-sm btn-dark">Login / Register</router-link>
    </div>

    <!-- Rating UI -->
    <div v-else class="d-flex flex-column align-items-start gap-2">
      <div class="btn-group" role="group" aria-label="Star rating">
        <button
          v-for="s in 5"
          :key="s"
          type="button"
          class="btn btn-outline-dark"
          :class="{ active: current >= s }"
          :disabled="hasRated"
          @click="rate(s)"
        >
          ★
        </button>
      </div>

      <div class="small text-muted">
        ⭐ {{ stats.avg ? stats.avg.toFixed(1) : 'No ratings yet' }}
        ({{ stats.count || 0 }})
      </div>

      <div v-if="hasRated" class="text-success small mt-1">
          You rated this event {{ current }}★
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const emit = defineEmits(["rated"]); //   Add this

const props = defineProps({
  itemId: { type: String, required: true },
  kind: { type: String, default: "event" },
});

const current = ref(0);
const stats = ref({ avg: 0, count: 0 });
const hasRated = ref(false);

function isLoggedIn() {
  return !!localStorage.getItem("sessionUser");
}

// Load stats + user rating if logged in
async function loadStats() {
  try {
    const user = JSON.parse(localStorage.getItem("sessionUser"));
    const uid = user?.uid || "";
    const res = await axios.get(
      `https://geteventrating-5bgqwovi2q-uc.a.run.app?eventId=${props.itemId}${uid ? `&uid=${uid}` : ""}`
    );

    if (res.data?.success) {
      stats.value.avg = res.data.avgRating || 0;
      stats.value.count = res.data.ratingCount || 0;

      if (res.data.userRating) {
        current.value = res.data.userRating;
        hasRated.value = true;
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not load ratings:", err);
  }
}

// ⭐ Rate event
async function rate(value) {
  const user = JSON.parse(localStorage.getItem("sessionUser"));
  if (!user) {
    alert("Please log in to rate.");
    return;
  }

  try {
    const res = await axios.post("https://rateevent-5bgqwovi2q-uc.a.run.app", {
      eventId: props.itemId,
      uid: user.uid,
      rating: value,
    });

    if (res.data.success) {
      current.value = value;
      hasRated.value = true;
      stats.value.avg = res.data.avgRating;
      stats.value.count = res.data.ratingCount;

      //   Emit new rating to parent
      emit("rated", {
        eventId: props.itemId,
        avgRating: res.data.avgRating,
        ratingCount: res.data.ratingCount,
      });
    } else {
      alert(res.data.message || "Could not submit rating.");
    }
  } catch (err) {
    if (err.response?.data?.message?.includes("already rated")) {
      hasRated.value = true;
    } else {
      console.error("❌ Error sending rating:", err);
    }
  }
}

onMounted(loadStats);
</script>

<style scoped>
.btn-group .btn.active {
  background: #212529;
  color: #fff;
}
</style>
