<template>
  <div class="rating-widget">
    <div v-if="!isLoggedIn()" class="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
      <div><strong>Sign in</strong> to rate this {{ kind }}.</div>
      <router-link to="/loginregister" class="btn btn-sm btn-dark">Login / Register</router-link>
    </div>

    <div v-else class="d-flex align-items-center gap-2">
      <div class="btn-group" role="group" aria-label="Star rating">
        <button
          v-for="s in 5"
          :key="s"
          type="button"
          class="btn btn-outline-dark"
          :class="{ active: current >= s }"
          @click="rate(s)"
          :aria-pressed="String(current >= s)"
        >★</button>
      </div>
      <div class="small text-muted">
        <span v-if="stats.count">Avg {{ stats.avg.toFixed(1) }}/5 · {{ stats.count }} rating{{ stats.count>1?'s':'' }}</span>
        <span v-else>No ratings yet</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRatings } from '@/useRatings'

const props = defineProps({
  itemId: { type: String, required: true }, // e.g., event id or post slug
  kind:   { type: String, default: 'item' }, // label in the UI
})

const { getStats, getUserRating, setUserRating, isLoggedIn } = useRatings()
const stats = ref({ avg: 0, count: 0 })
const current = ref(0)

watchEffect(() => {
  stats.value = getStats(props.itemId)
  current.value = getUserRating(props.itemId)
})

function rate(s) {
  try {
    stats.value = setUserRating(props.itemId, s)
    current.value = s
  } catch (e) {
    // not logged in: UI already shows the alert, but this protects in code
    console.warn(e?.message || e)
  }
}
</script>

<style scoped>
.btn-group .btn.active { background:#212529; color:#fff; }
</style>
