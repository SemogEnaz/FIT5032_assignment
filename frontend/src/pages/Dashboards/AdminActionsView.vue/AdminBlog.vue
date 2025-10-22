<template>
  <main class="admin-blog py-4">
    <section class="container mb-4 d-flex align-items-baseline justify-content-between gap-2">
      <div>
        <h1 class="mb-1">Manage Blog</h1>
        <p class="text-muted mb-0">Create, edit, delete posts. All mock on the client for now.</p>
      </div>
      <router-link class="link-more" to="/admin">← Admin home</router-link>
    </section>

    <section class="section">
      <div class="container">
        <div class="row g-3">
          <div class="col-12 col-lg-5">
            <div class="card" style="grid-template-columns:1fr;">
              <form @submit.prevent="save" class="d-grid gap-2">
                <input v-model.trim="form.title" class="form-control" placeholder="Title" required />
                <input v-model.trim="form.slug" class="form-control" placeholder="Slug (unique)" required />
                <input v-model.trim="form.cover" class="form-control" placeholder="Cover image URL (optional)" />
                <input v-model.trim="form.date" type="date" class="form-control" required />
                <textarea v-model.trim="form.excerpt" class="form-control" rows="3" placeholder="Excerpt"></textarea>
                <textarea v-model.trim="form.body" class="form-control" rows="6" placeholder="Body (markdown or HTML)"></textarea>
                <input v-model.trim="form.tagsCsv" class="form-control" placeholder="Tags, comma-separated (e.g. events, tips)" />
                <div class="d-flex gap-2 flex-wrap">
                  <button class="btn btn-dark" type="submit">{{ form._edit ? 'Update' : 'Create' }}</button>
                  <button class="btn btn-outline-dark" type="button" @click="reset()">Clear</button>
                </div>
              </form>
            </div>
          </div>

          <div class="col-12 col-lg-7">
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Title</th><th>Date</th><th>Tags</th><th style="width:160px;">Actions</th></tr></thead>
                <tbody>
                  <tr v-for="p in posts" :key="p.slug">
                    <td>{{ p.title }}</td>
                    <td>{{ formatDate(p.date) }}</td>
                    <td><span v-for="t in p.tags" :key="t" class="badge text-bg-light me-1">#{{ t }}</span></td>
                    <td class="d-flex gap-2">
                      <button class="btn btn--sm" @click="edit(p.slug)">Edit</button>
                      <button class="btn btn--sm" @click="remove(p.slug)">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="posts.length===0"><td colspan="4" class="text-center text-muted">No posts yet.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="mt-3 small text-muted">
          <strong>Preview:</strong>
          <pre class="mt-2 bg-light p-2 rounded">{{ preview }}</pre>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import axios from 'axios'

const posts = ref([])

const form = reactive({
  _edit: false,
  title:'', slug:'', date: new Date().toISOString().slice(0,10),
  excerpt:'', body:'', cover:'', tagsCsv:''
})

const preview = computed(() => ({
  slug: form.slug,
  title: form.title,
  date: form.date,
  excerpt: form.excerpt,
  body: form.body,
  cover: form.cover || undefined,
  tags: (form.tagsCsv || '').split(',').map(s=>s.trim()).filter(Boolean)
}))

// ✅ Cloud Function call here
async function save() {
  const data = { ...preview.value }

  try {
    const res = await axios.post(
      'https://createblog-5bgqwovi2q-uc.a.run.app',
      data,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (res.data?.success) {
      alert('✅ Blog created successfully!')
      console.log('Created blog:', res.data.blog)
      posts.value.unshift(data)
      reset()
    } else {
      throw new Error(res.data?.message || 'Unknown error')
    }

  } catch (err) {
    console.error('❌ Error creating blog:', err)
    alert(`Failed to create blog: ${err.message}`)
  }
}

function edit(slug) {
  const p = posts.value.find(p => p.slug === slug)
  if (!p) return
  form._edit = slug
  form.title = p.title; form.slug = p.slug; form.date = p.date
  form.excerpt = p.excerpt; form.body = p.body; form.cover = p.cover || ''
  form.tagsCsv = (p.tags || []).join(', ')
}

function remove(slug) { posts.value = posts.value.filter(p => p.slug !== slug) }
function reset() {
  form._edit = false; form.title = ''; form.slug = ''; form.date = new Date().toISOString().slice(0,10)
  form.excerpt=''; form.body=''; form.cover=''; form.tagsCsv=''
}
function formatDate(iso){ return new Date(iso).toLocaleDateString() }
</script>

<style scoped>
.container { width:min(1100px,92%); margin:0 auto; }
.card { padding:1rem; border:1px solid #e5e7eb; border-radius:14px; background:#fff; }
.table-wrap { overflow:auto; border:1px solid #e5e7eb; border-radius:14px; background:#fff; }
.table th, .table td { padding:.75rem 1rem; border-bottom:1px solid #f0f0f0; }
pre { white-space:pre-wrap; word-break:break-word; }
.link-more { text-decoration:none; font-weight:600; }
.btn--sm { padding:.45rem .8rem; font-size:.9rem; border-radius:10px; background:#111827; color:#fff; }
</style>
