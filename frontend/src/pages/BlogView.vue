<!-- ============================= -->
<!-- BlogIndex.vue                -->
<!-- ============================= -->
<template>
  <main class="page blog-index">
    <section class="hero--sm">
      <h1>Community Blog</h1>
      <p class="lead">Updates, tips, and stories from our members. Join the conversation.</p>
    </section>

    <!-- Controls -->
    <section class="toolbar container">
      <input
        v-model.trim="q"
        class="input"
        type="search"
        placeholder="Search posts..."
        aria-label="Search posts"
      />
      <select v-model="selectedTag" class="select" aria-label="Filter by tag">
        <option value="">All tags</option>
        <option v-for="tag in allTags" :key="tag" :value="tag">#{{ tag }}</option>
      </select>
      <select v-model="sortBy" class="select" aria-label="Sort posts">
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
        <option value="title-asc">Title A→Z</option>
      </select>
    </section>

    <!-- Grid -->
    <section class="container grid">
      <article v-for="post in paged" :key="post.slug" class="post-card">
        <img v-if="post.cover" :src="post.cover" :alt="post.title" />
        <div class="post-card__body">
          <h2 class="post-card__title">
            <router-link :to="`/blog/${post.slug}`">{{ post.title }}</router-link>
          </h2>
          <p class="post-card__meta">{{ formatDate(post.date) }} · {{ post.readMins }} min read</p>
          <p class="post-card__excerpt">{{ post.excerpt }}</p>
          <div class="tags">
            <span v-for="t in post.tags" :key="t" class="tag">#{{ t }}</span>
          </div>
          <div class="post-card__actions">
            <router-link class="btn btn--sm" :to="`/blog/${post.slug}`">Read</router-link>
            <button class="btn btn--sm btn--ghost" @click="mockEngage(post.slug)">💬 Comment</button>
          </div>
        </div>
      </article>

      <div v-if="paged.length === 0" class="empty">No posts match your filters.</div>
    </section>

    <!-- Pagination (mock) -->
    <section class="container pagination" v-if="pages > 1">
      <button class="btn btn--sm" :disabled="page===1" @click="page--">Prev</button>
      <span>Page {{ page }} / {{ pages }}</span>
      <button class="btn btn--sm" :disabled="page===pages" @click="page++">Next</button>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  posts: {
    type: Array,
    default: () => [
      {
        slug: 'league-highlights-aug',
        title: 'League Highlights – August Wrap',
        date: '2025-08-18',
        readMins: 4,
        excerpt: 'A look back at the most exciting frames and big breaks from August.',
        tags: ['events', 'highlights'],
        cover: 'https://images.unsplash.com/photo-1529634806980-c5f21e615d61?q=80&w=1600&auto=format&fit=crop'
      },
      {
        slug: 'cue-care-101',
        title: 'Cue Care 101: Make Your Cue Last',
        date: '2025-07-29',
        readMins: 6,
        excerpt: 'Simple maintenance tips to keep your cue straight and smooth.',
        tags: ['tips'],
        cover: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?q=80&w=1600&auto=format&fit=crop'
      },
      {
        slug: 'meet-the-coaches',
        title: 'Meet the Coaches: Q&A',
        date: '2025-06-12',
        readMins: 5,
        excerpt: 'We sat down with our coaching team to talk drills, mindset, and more.',
        tags: ['community', 'coaching'],
        cover: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop'
      },
      {
        slug: 'social-night-recap',
        title: 'Social Night Recap',
        date: '2025-09-01',
        readMins: 3,
        excerpt: 'Big turnout, friendly matches, and pizza—here’s what you missed.',
        tags: ['community', 'events'],
        cover: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1600&auto=format&fit=crop'
      }
    ]
  },
  perPage: { type: Number, default: 6 }
})

const q = ref('')
const selectedTag = ref('')
const sortBy = ref('date-desc')
const page = ref(1)

const allTags = computed(() => {
  const set = new Set()
  props.posts.forEach(p => p.tags?.forEach(t => set.add(t)))
  return Array.from(set).sort()
})

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return props.posts.filter(p => {
    const matchesQ = !term || `${p.title} ${p.excerpt} ${p.tags?.join(' ')}`.toLowerCase().includes(term)
    const matchesTag = !selectedTag.value || p.tags?.includes(selectedTag.value)
    return matchesQ && matchesTag
  })
})

const sorted = computed(() => {
  const arr = filtered.value.slice()
  if (sortBy.value === 'date-desc') arr.sort((a,b)=> new Date(b.date) - new Date(a.date))
  if (sortBy.value === 'date-asc') arr.sort((a,b)=> new Date(a.date) - new Date(b.date))
  if (sortBy.value === 'title-asc') arr.sort((a,b)=> a.title.localeCompare(b.title))
  return arr
})

const pages = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.perPage)))
const paged = computed(() => {
  const start = (page.value - 1) * props.perPage
  return sorted.value.slice(start, start + props.perPage)
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function mockEngage(slug){
  alert(`This is a demo. On the real site, this would open comments for: ${slug}`)
}
</script>

<style scoped>
.page { display: grid; gap: 1.5rem; }
.hero--sm { padding: 1.5rem 0 0; text-align: center; }
.lead { color: #4b5563; }
.container { width: min(1100px, 92%); margin: 0 auto; }
.toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; justify-content: center; }
.input, .select { padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 10px; min-width: 220px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.post-card { border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; background: #fff; display: grid; grid-template-rows: 160px 1fr; }
.post-card img { width: 100%; height: 100%; object-fit: cover; }
.post-card__body { padding: 1rem; display: grid; gap: 0.5rem; }
.post-card__title { margin: 0; font-size: 1.15rem; }
.post-card__meta { margin: 0; color: #6b7280; font-size: 0.9rem; }
.tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.tag { background: #f3f4f6; padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.8rem; }
.post-card__actions { display: flex; gap: 0.5rem; margin-top: 0.2rem; }
.btn { border: 1px solid #111827; background: #111827; color: #fff; padding: 0.45rem 0.8rem; border-radius: 10px; cursor: pointer; text-decoration: none; }
.btn--ghost { background: transparent; color: #111827; }
.empty { grid-column: 1/-1; text-align: center; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 1rem; color: #6b7280; }
.pagination { display: flex; gap: 0.8rem; align-items: center; justify-content: center; padding-bottom: 1.5rem; }
</style>