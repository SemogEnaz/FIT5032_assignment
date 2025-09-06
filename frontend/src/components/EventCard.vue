<template>
        <div class="card__date">
            <span class="card__day">{{ formatDay(start) }}</span>
            <span class="card__mon">{{ formatMon(start) }}</span>
        </div>
        <div class="card__body">
            <h3 class="card__title">{{ title }}</h3>
            <p v-if="location" class="card__meta">📍 {{ location }}</p>
            <p class="card__desc">{{ summary || "No description provided." }}</p>
            <router-link class="btn btn--sm" :to="`/events/${id}`">Details</router-link>
        </div>
</template>

<script setup>

defineProps({
    start: Date,
    title: String,
    location: String,
    summary: String,
    id: String
});

function formatDay(iso) {
  const d = new Date(iso)
  return d.getDate().toString().padStart(2, '0')
}
function formatMon(iso) {
  return new Date(iso).toLocaleString(undefined, { month: 'short' }).toUpperCase()
}

</script>