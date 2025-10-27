<template>
  <div class="card h-100 d-flex">
    <div class="card-body">
      <!-- 🗓️ Date + Title + Rating -->
      <div class="d-flex align-items-center mb-2 justify-content-between">
        <div class="d-flex align-items-center">
          <div
            class="text-center bg-dark text-white rounded p-2 me-3"
            style="min-width:68px;"
          >
            <div class="fw-bold fs-5">{{ day(event.start) }}</div>
            <div class="small">{{ mon(event.start) }}</div>
          </div>
          <h5 class="mb-0">{{ event.title || "Untitled Event" }}</h5>
        </div>

        <!-- ⭐ Rating display -->
        <div v-if="event.avgRating" class="text-warning small">
          ★ {{ event.avgRating.toFixed(1) }} ({{ event.ratingCount }})
        </div>
        <div v-else class="text-muted small">No ratings</div>
      </div>

      <!-- 📍 Location + Summary -->
      <p class="text-muted mb-2">
        📍 {{ event.street }}, {{ event.suburb }}, {{ event.state }}
      </p>
      <p class="mb-3 mx-2">{{ event.summary || "No description provided." }}</p>

      <!-- 🔘 Registration Button -->
      <EventRegistrationButton
        v-if="showActions"
        :event="event"
        @updated="$emit('updated', $event)"
      />

      <!-- ⭐ Rating Widget -->
      <RatingWidget
        v-if="showRatings"
        :item-id="event.id"
        kind="event"
        class="mt-3"
        @rated="$emit('rated', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import EventRegistrationButton from "@/components/EventRegistrationButton.vue";
import RatingWidget from "@/components/RatingWidget.vue";

defineProps({
  event: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
  showRatings: { type: Boolean, default: true },
});

function day(iso) {
  if (!iso) return "--";
  return new Date(iso).getDate().toString().padStart(2, "0");
}

function mon(iso) {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleString(undefined, { month: "short" })
    .toUpperCase();
}
</script>

<style scoped>
.text-warning {
  color: #ffc107 !important;
}
.card {
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.card-body {
  padding: 1.25rem;
}
</style>
