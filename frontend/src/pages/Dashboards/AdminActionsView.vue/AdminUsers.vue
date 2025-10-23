<template>
  <main class="container py-4">
    <h1 class="mb-4 text-center">Admin Event Management</h1>

    <div class="card p-3 shadow-sm">
      <!-- Search Bar -->
      <div class="mb-3">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText
            v-model="filters.name"
            placeholder="Search by event name..."
            class="w-100"
          />
        </span>
      </div>

      <!-- Events Table -->
      <DataTable
        :value="filteredEvents"
        paginator
        :rows="10"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @sort="onSort"
        responsiveLayout="scroll"
      >
        <Column field="title" header="Event Name" sortable></Column>
        <Column field="start" header="Event Date" sortable>
          <template #body="{ data }">
            {{ formatDate(data.start) }}
          </template>
        </Column>
        <Column field="ratingCount" header="Number of Ratings" sortable></Column>

        <Column header="Actions">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              class="p-button-danger p-button-sm"
              label="Delete"
              @click="deleteEvent(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import axios from "axios"

// PrimeVue components
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import InputText from "primevue/inputtext"
import Button from "primevue/button"

const events = ref([])
const filters = ref({ name: "" })
const sortField = ref(null)
const sortOrder = ref(null)

onMounted(async () => {
  await fetchEvents()
})

// Fetch events from your Cloud Function
async function fetchEvents() {
  try {
    const res = await axios.get("https://getrecentevents-5bgqwovi2q-uc.a.run.app")
    if (res.data?.success && Array.isArray(res.data.events)) {
      events.value = res.data.events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        ratingCount: e.ratingCount || 0
      }))
    } else {
      throw new Error("Unexpected API response")
    }
  } catch (err) {
    console.error("Error fetching events:", err)
  }
}

// Filter table by event name
const filteredEvents = computed(() => {
  const term = filters.value.name.toLowerCase()
  return events.value.filter(e => e.title.toLowerCase().includes(term))
})

// Handle sorting
function onSort(e) {
  sortField.value = e.sortField
  sortOrder.value = e.sortOrder
}

// Delete event
async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return
  try {
    const res = await axios.post("https://deleteevent-5bgqwovi2q-uc.a.run.app", { eventId })
    if (res.data.success) {
      events.value = events.value.filter(e => e.id !== eventId)
      alert("Event deleted successfully.")
    } else {
      alert("Failed to delete event.")
    }
  } catch (err) {
    console.error("Error deleting event:", err)
    alert("Error deleting event.")
  }
}

function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
