<template>
  <main class="blog-index py-4">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Community Blog</h1>
      <p class="text-muted mb-0">Updates, tips, and stories from our members. Join the conversation.</p>
    </section>

    <!-- Controls -->
    <section class="container mb-4">
      <div class="row g-2 justify-content-center">
        <div class="col-12 col-md-6 col-lg-5">
          <input v-model.trim="q" type="search" class="form-control" placeholder="Search posts..." aria-label="Search posts" />
        </div>
        <div class="col-6 col-md-3 col-lg-2">
          <select v-model="selectedTag" class="form-select" aria-label="Filter by tag">
            <option value="">All tags</option>
            <option v-for="tag in allTags" :key="tag" :value="tag">#{{ tag }}</option>
          </select>
        </div>
        <div class="col-6 col-md-3 col-lg-2">
          <select v-model="sortBy" class="form-select" aria-label="Sort posts">
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="title-asc">Title A→Z</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Grid -->
    <section class="container mb-4">
      <div class="row g-3">
        <div v-for="post in paged" :key="post.slug" class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 d-flex">
                <img v-if="post.cover" :src="post.cover" class="card-img-top" :alt="post.title" style="height:200px; object-fit:cover; object-position:center;" />            <div class="card-body d-flex flex-column">
                <h5 class="card-title">
                    <router-link class="text-decoration-none" :to="`/blog/${post.slug}`">{{ post.title }}</router-link>
                </h5>
                <p class="card-subtitle text-muted mb-2">{{ formatDate(post.date) }} · {{ post.readMins }} min read</p>
                <p class="card-text flex-grow-1">{{ post.excerpt }}</p>
                <div class="mb-3">
                    <span v-for="t in post.tags" :key="t" class="badge text-bg-light me-1">#{{ t }}</span>
                </div>
                <div class="mt-auto d-flex gap-2">
                    <router-link class="btn btn-dark btn-sm" :to="`/blog/${post.slug}`">Read</router-link>
                    <button class="btn btn-outline-dark btn-sm" @click="mockEngage(post.slug)">💬 Comment</button>
                </div>
            </div>
          </div>
        </div>

        <div v-if="paged.length === 0" class="col-12">
          <div class="border rounded p-4 text-center text-secondary">No posts match your filters.</div>
        </div>
      </div>
    </section>

    <!-- Pagination (mock) -->
    <section class="container" v-if="pages > 1">
      <div class="d-flex justify-content-center align-items-center gap-2 pb-3">
        <button class="btn btn-sm btn-outline-dark" :disabled="page === 1" @click="page--">Prev</button>
        <span>Page {{ page }} / {{ pages }}</span>
        <button class="btn btn-sm btn-outline-dark" :disabled="page === pages" @click="page++">Next</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';

// Local mock data (no props)
const posts = ref([
  {
    slug: 'league-highlights-aug',
    title: 'League Highlights – August Wrap',
    date: '2025-08-18',
    readMins: 4,
    excerpt: 'A look back at the most exciting frames and big breaks from August.',
    tags: ['events', 'highlights'],
    cover: 'https://upatour.com/wp-content/uploads/2018/06/LRG_DSC01088.jpg'
  },
  {
    slug: 'cue-care-101',
    title: 'Cue Care 101: Make Your Cue Last',
    date: '2025-07-29',
    readMins: 6,
    excerpt: 'Simple maintenance tips to keep your cue straight and smooth.',
    tags: ['tips'],
    cover: 'https://www.pooldawg.com/articleee/assests/example-b.jpg'
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
    cover: 'https://instagram.fsyd14-1.fna.fbcdn.net/v/t39.30808-6/528801150_122171977622495520_725561825731952275_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjE2Mzh4MjA0OC5zZHIuZjMwODA4LmRlZmF1bHRfaW1hZ2UuYzIifQ&_nc_ht=instagram.fsyd14-1.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QHnN_Jg5Z0UjxLpVXL4PihQT2tD_-gs3MGBmKQ4Vo30-oku1GRfeP1CHWfUo2LSVhVDPfBcpNpdU-MoaRgW795P&_nc_ohc=e5SpZ2WtoBcQ7kNvwGzMWyn&_nc_gid=Vf7wUSrthYsGw-ptmqgoAw&edm=APs17CUAAAAA&ccb=7-5&ig_cache_key=MzY5MzE1MTg0MjgwMDQzNDQwMg%3D%3D.3-ccb7-5&oh=00_AfZZOVBaJBSDCWdBi2H7LRFDWHIwm79mEj78LK7jSNpb9w&oe=68C1C7DF&_nc_sid=10d13b'
  }
])

const perPage = ref(6)
const q = ref('')
const selectedTag = ref('')
const sortBy = ref('date-desc')
const page = ref(1)

const allTags = computed(() => {
  const set = new Set()
  posts.value.forEach(p => p.tags?.forEach(t => set.add(t)))
  return Array.from(set).sort()
})

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return posts.value.filter(p => {
    const matchesQ = !term || `${p.title} ${p.excerpt} ${p.tags?.join(' ')}`.toLowerCase().includes(term)
    const matchesTag = !selectedTag.value || p.tags?.includes(selectedTag.value)
    return matchesQ && matchesTag
  })
})

const sorted = computed(() => {
  const arr = filtered.value.slice()
  if (sortBy.value === 'date-desc') arr.sort((a, b) => new Date(b.date) - new Date(a.date))
  if (sortBy.value === 'date-asc') arr.sort((a, b) => new Date(a.date) - new Date(b.date))
  if (sortBy.value === 'title-asc') arr.sort((a, b) => a.title.localeCompare(b.title))
  return arr
})

const pages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage.value)))
const paged = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sorted.value.slice(start, start + perPage.value)
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function mockEngage(slug) {
  alert(`This is a demo. On the real site, this would open comments for: ${slug}`)
}
</script>
