<template>
  <main class="py-4">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Newsletters</h1>
      <p class="lead text-muted mb-0">Monthly round‑ups, match recaps, coaching tips, and club news. Browse past issues below.</p>
    </section>

    <!-- About -->
    <section class="container mb-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="card d-flex">
            <div class="card-body">
              <h2 class="h4">About our newsletters</h2>
              <p class="mb-0">
                We publish a monthly newsletter to keep members in the loop. Expect event reminders, highlight reels,
                coaching notes, and occasional member spotlights. Subscribe on the home page, and explore the archive here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Index grouped by year -->
    <section class="container">
      <div v-for="(items, year) in grouped" :key="year" class="mb-4">
        <h3 class="h5 mb-3">{{ year }}</h3>

        <div class="row g-3">
          <div v-for="n in items" :key="n.id" class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 d-flex">
              <div class="card-body w-100">

                <div class="text-muted small mb-1">{{ formatDate(n.date) }}</div>
                <h4 class="h5 card-title mb-2">{{ n.title }}</h4>
                <p class="card-text flex-grow-1">{{ n.excerpt }}</p>
                <div class="mt-2 d-flex gap-2">
                    <a class="btn btn-dark btn-sm" :href="n.pdfUrl" target="_blank" rel="noopener">View PDF</a>
                    <router-link class="btn btn-outline-dark btn-sm" :to="`/newsletters/${n.id}`">Read online</router-link>
                </div>
                
              </div>
            </div>
          </div>

          <div v-if="items.length === 0" class="col-12">
            <div class="border rounded p-4 text-center text-secondary">No newsletters for {{ year }}.</div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

// Local mock data (no props)
const newsletters = ref([
  { id: '2025-09', title: 'September 2025 – Season Kickoff', date: '2025-09-01', excerpt: 'Fixtures, coaching calendar, and social nights set for spring.', pdfUrl: '#' },
  { id: '2025-08', title: 'August 2025 – Finals Preview', date: '2025-08-01', excerpt: 'Who’s in form and what to watch.', pdfUrl: '#' },
  { id: '2025-07', title: 'July 2025 – Winter Warmers', date: '2025-07-01', excerpt: 'New drills to try and a recap of the charity night.', pdfUrl: '#' },
  { id: '2024-12', title: 'December 2024 – Year in Review', date: '2024-12-01', excerpt: 'Highlights from a huge year at the club.', pdfUrl: '#' }
])

const grouped = computed(() => {
  const map = {}
  for (const n of newsletters.value) {
    const y = new Date(n.date).getFullYear()
    map[y] ||= []
    map[y].push(n)
  }
  // newest first within year
  Object.values(map).forEach(arr => arr.sort((a, b) => new Date(b.date) - new Date(a.date)))
  // sort years desc
  return Object.fromEntries(Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0])))
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
}
</script>
