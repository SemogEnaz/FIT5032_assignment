<template>
  <main class="admin-dash py-4">
    <!-- Header -->
    <section class="container text-center mb-4">
      <h1 class="mb-2">Admin Dashboard</h1>
      <p class="text-muted mb-0">Create events, publish blogs, manage users, and send bulk email.</p>
    </section>

    <!-- Quick Actions -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Quick Actions</h2>
        </div>
        <div class="cards">
          <article class="card" v-for="qa in quick" :key="qa.id">
            <div class="card__date"><div class="card__day">QA</div><div class="card__mon">NOW</div></div>
            <div>
              <h3 class="card__title">{{ qa.title }}</h3>
              <p class="card__desc">{{ qa.desc }}</p>
              <button class="btn btn--sm" @click="qa.action()">Open</button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Bulk Email -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Bulk Email</h2>
        </div>
        <div class="card" style="grid-template-columns:1fr;">
          <form @submit.prevent="sendBulk" class="d-grid gap-2">
            <input v-model.trim="emailForm.subject" class="form-control" placeholder="Subject" required />
            <textarea v-model.trim="emailForm.body" class="form-control" rows="4" placeholder="Message…" required></textarea>
            <div class="d-flex gap-2 flex-wrap">
              <label class="form-check">
                <input class="form-check-input" type="checkbox" v-model="emailForm.toUsers" />
                <span class="form-check-label">All users</span>
              </label>
              <label class="form-check">
                <input class="form-check-input" type="checkbox" v-model="emailForm.toSubscribers" />
                <span class="form-check-label">Newsletter subscribers</span>
              </label>
            </div>
            <button class="btn btn--primary" type="submit">Send</button>
          </form>
          <p v-if="emailMsg" class="text-success mt-2">{{ emailMsg }}</p>
        </div>
      </div>
    </section>

    <!-- Create Event -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Create Event</h2>
          <router-link class="link-more" to="/events">View calendar →</router-link>
        </div>

        <div class="card" style="grid-template-columns:1fr;">
          <form @submit.prevent="createEvent" class="d-grid gap-2">
            <input v-model.trim="eventForm.summary" class="form-control" placeholder="Title / Summary" required />
            <input v-model.trim="eventForm.location" class="form-control" placeholder="Location" />
            <textarea v-model.trim="eventForm.description" class="form-control" rows="3" placeholder="Description"></textarea>
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small">Start</label>
                <input v-model="eventForm.start" type="datetime-local" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label small">End</label>
                <input v-model="eventForm.end" type="datetime-local" class="form-control" required />
              </div>
            </div>
            <button class="btn btn--primary" type="submit">Create Event</button>
          </form>
        </div>
      </div>
    </section>

    <!-- Manage Blog -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Blog Posts</h2>
          <router-link class="link-more" to="/blog">Open blog →</router-link>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Title</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="p in posts" :key="p.slug">
                <td>{{ p.title }}</td>
                <td>{{ formatDate(p.date) }}</td>
                <td class="d-flex gap-2">
                  <button class="btn btn--sm" @click="editPost(p.slug)">Edit</button>
                  <button class="btn btn--sm" @click="removePost(p.slug)">Delete</button>
                </td>
              </tr>
              <tr v-if="posts.length === 0"><td colspan="3" class="text-center text-muted">No posts yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Manage Users -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">Users</h2>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <select v-model="u.role" class="form-select form-select-sm" style="max-width:160px;">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td class="d-flex gap-2">
                  <button class="btn btn--sm" @click="saveUser(u)">Save</button>
                  <button class="btn btn--sm" @click="deleteUser(u.id)">Delete</button>
                </td>
              </tr>
              <tr v-if="users.length === 0"><td colspan="4" class="text-center text-muted">No users yet.</td></tr>
            </tbody>
          </table>
        </div>

        <!-- quick add -->
        <form @submit.prevent="addUser" class="d-flex flex-wrap gap-2 mt-2">
          <input v-model.trim="newUser.name" class="form-control" placeholder="Name" required />
          <input v-model.trim="newUser.email" class="form-control" placeholder="Email" required />
          <select v-model="newUser.role" class="form-select" style="max-width:160px;">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button class="btn btn--primary">Add User</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

// Quick actions
const quick = [
  { id: 'qa1', title: 'Create Event', desc: 'Add a new calendar event.', action: () => document.querySelector('h2.section__title:contains("Create Event")')?.scrollIntoView({ behavior: 'smooth' }) },
  { id: 'qa2', title: 'Write Blog', desc: 'Draft a new post for the community.', action: () => alert('Open blog editor — mock') },
  { id: 'qa3', title: 'Email All Users', desc: 'Send an announcement to everyone.', action: () => alert('Open bulk email — scroll to section') }
]

// Bulk email
const emailForm = ref({ subject: '', body: '', toUsers: true, toSubscribers: true })
const emailMsg = ref('')
function sendBulk() {
  // later: POST to server or Cloud Function
  emailMsg.value = `Queued email: "${emailForm.value.subject}" to ${emailForm.value.toUsers ? 'users' : ''} ${emailForm.value.toSubscribers ? 'subscribers' : ''}`.trim()
  emailForm.value = { subject: '', body: '', toUsers: true, toSubscribers: true }
}

// Create Event (mock; mirrors Calendar shape)
const eventForm = ref({ summary: '', description: '', location: '', start: '', end: '' })
function createEvent() {
  if (!eventForm.value.summary || !eventForm.value.start || !eventForm.value.end) return
  alert(`Created event: ${eventForm.value.summary} (${eventForm.value.start} → ${eventForm.value.end}) — mock`)
  eventForm.value = { summary: '', description: '', location: '', start: '', end: '' }
}

// Blog CRUD (mock)
const posts = ref([
  { slug: 'season-kickoff', title: 'Season Kickoff', date: '2025-09-10' },
  { slug: 'cue-care-101', title: 'Cue Care 101', date: '2025-07-29' }
])
function editPost(slug) { alert(`Open editor for: ${slug} — mock`) }
function removePost(slug) { posts.value = posts.value.filter(p => p.slug !== slug) }
function formatDate(iso) { return new Date(iso).toLocaleDateString() }

// Users CRUD (mock)
const users = ref([
  { id: 'u1', name: 'Zane', email: 'zane@example.com', role: 'admin' },
  { id: 'u2', name: 'Emily', email: 'emily@example.com', role: 'user' }
])
const newUser = ref({ name: '', email: '', role: 'user' })
function saveUser(u) { alert(`Saved ${u.name} (${u.role}) — mock`) }
function deleteUser(id) { users.value = users.value.filter(u => u.id !== id) }
function addUser() {
  const id = 'u' + Math.random().toString(36).slice(2, 7)
  users.value.push({ id, ...newUser.value })
  newUser.value = { name: '', email: '', role: 'user' }
}
</script>

<style scoped>
.container { width: min(1100px, 92%); margin: 0 auto; }
.section { padding: 1rem 0 0.5rem; }
.section__header { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
.section__title { font-size: clamp(1.4rem, 2.5vw, 2rem); margin:0; }
.link-more { text-decoration:none; font-weight:600; }

.cards { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px,1fr)); gap:1rem; }
.card { display:grid; grid-template-columns:76px 1fr; gap:.75rem; padding:1rem; border:1px solid #e5e7eb; border-radius:14px; background:#fff; box-shadow:0 1px 0 rgba(0,0,0,.04); }
.card__date { display:grid; place-items:center; background:#111827; color:#fff; border-radius:10px; font-weight:700; }
.card__day { font-size:1.35rem; line-height:1; }
.card__mon { font-size:.75rem; letter-spacing:1px; opacity:.9; }
.card__title { margin:0; font-size:1.05rem; }
.card__desc { color:#374151; margin:0 0 .75rem; }

.table-wrap { overflow:auto; border:1px solid #e5e7eb; border-radius:14px; background:#fff; }
.table { width:100%; margin:0; }
.table th, .table td { padding:.75rem 1rem; border-bottom:1px solid #f0f0f0; }
</style>
