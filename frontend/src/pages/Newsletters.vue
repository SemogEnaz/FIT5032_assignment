<!-- ============================= -->
<!-- NewslettersPage.vue           -->
<!-- ============================= -->
<template>
  <main class="page newsletters">
    <section class="hero--sm">
      <h1>Newsletters</h1>
      <p class="lead">Monthly round‑ups, match recaps, coaching tips, and club news. Browse past issues below.</p>
    </section>

    <section class="container about">
      <div class="card">
        <h2>About our newsletters</h2>
        <p>
          We publish a monthly newsletter to keep members in the loop. Expect event reminders, highlight reels,
          coaching notes, and occasional member spotlights. Subscribe on the home page, and explore the archive here.
        </p>
      </div>
    </section>

    <!-- Index grouped by year -->
    <section class="container index">
      <div v-for="(items, year) in grouped" :key="year" class="year">
        <h3 class="year__title">{{ year }}</h3>
        <div class="items">
          <article v-for="n in items" :key="n.id" class="nl">
            <div class="nl__date">{{ formatDate(n.date) }}</div>
            <h4 class="nl__title">{{ n.title }}</h4>
            <p class="nl__excerpt">{{ n.excerpt }}</p>
            <div class="nl__actions">
              <a class="btn btn--sm" :href="n.pdfUrl" target="_blank" rel="noopener">View PDF</a>
              <router-link class="btn btn--sm btn--ghost" :to="`/newsletters/${n.id}`">Read online</router-link>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  newsletters: {
    type: Array,
    default: () => [
      { id: '2025-09', title: 'September 2025 – Season Kickoff', date: '2025-09-01', excerpt: 'Fixtures, coaching calendar, and social nights set for spring.', pdfUrl: '#' },
      { id: '2025-08', title: 'August 2025 – Finals Preview', date: '2025-08-01', excerpt: 'Who’s in form and what to watch.', pdfUrl: '#' },
      { id: '2025-07', title: 'July 2025 – Winter Warmers', date: '2025-07-01', excerpt: 'New drills to try and a recap of the charity night.', pdfUrl: '#' },
      { id: '2024-12', title: 'December 2024 – Year in Review', date: '2024-12-01', excerpt: 'Highlights from a huge year at the club.', pdfUrl: '#' }
    ]
  }
})

const grouped = computed(() => {
  const map = {}
  for (const n of props.newsletters) {
    const y = new Date(n.date).getFullYear()
    map[y] ||= []
    map[y].push(n)
  }
  // newest first within year
  Object.values(map).forEach(arr => arr.sort((a,b)=> new Date(b.date) - new Date(a.date)))
  // sort years desc
  return Object.fromEntries(Object.entries(map).sort((a,b)=> Number(b[0]) - Number(a[0])))
})

function formatDate(iso){
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
}
</script>

<style scoped>
.page { display: grid; gap: 1.5rem; }
.hero--sm { padding: 1.5rem 0 0; text-align: center; }
.container { width: min(1100px, 92%); margin: 0 auto; }
.card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 1rem; background: #fff; }
.year { margin-bottom: 1rem; }
.year__title { margin: 0 0 0.5rem; font-size: 1.2rem; }
.items { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.8rem; }
.nl { border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; padding: 1rem; display: grid; gap: 0.4rem; }
.nl__date { color: #6b7280; font-size: 0.9rem; }
.nl__title { margin: 0; font-size: 1.05rem; }
.nl__excerpt { margin: 0; color: #374151; }
.btn { border: 1px solid #111827; background: #111827; color: #fff; padding: 0.45rem 0.8rem; border-radius: 10px; text-decoration: none; }
.btn--ghost { background: transparent; color: #111827; }
.nl__actions { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem; }
</style>
