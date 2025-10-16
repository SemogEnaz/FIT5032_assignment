<template>
  <main class="admin-email py-4">
    <section class="container mb-4 d-flex align-items-baseline justify-content-between gap-2">
      <div>
        <h1 class="mb-1">Bulk Email</h1>
        <p class="text-muted mb-0">Compose and send announcements to your audience.</p>
      </div>
      <router-link class="link-more" to="/admin">← Admin home</router-link>
    </section>

    <section class="section">
      <div class="container">
        <div class="card" style="grid-template-columns:1fr;">
          <form @submit.prevent="send" class="d-grid gap-2">
            <input v-model.trim="f.subject" class="form-control" placeholder="Subject" required />
            <textarea v-model.trim="f.body" class="form-control" rows="6" placeholder="Message…" required></textarea>

            <div class="row g-2">
              <div class="col-md-4">
                <label class="form-label small">Audience</label>
                <select v-model="f.audience" class="form-select">
                  <option value="all">All users</option>
                  <option value="subscribers">Newsletter subscribers</option>
                  <option value="admins">Admins only</option>
                </select>
              </div>
              <div class="col-md-8">
                <label class="form-label small">Optional CSV of extra emails</label>
                <input v-model.trim="f.extraCsv" class="form-control" placeholder="alice@ex.com, bob@ex.com" />
              </div>
            </div>

            <div class="d-flex gap-2 flex-wrap mt-2">
              <button class="btn btn-dark" type="submit">Send</button>
              <button class="btn btn-outline-dark" type="button" @click="reset()">Clear</button>
            </div>
          </form>

          <div v-if="msg" class="text-success mt-2">{{ msg }}</div>
        </div>

        <div class="mt-3 small text-muted">
          <strong>Preview payload:</strong>
          <pre class="mt-2 bg-light p-2 rounded">{{ preview }}</pre>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'

const f = reactive({
  subject: '',
  body: '',
  audience: 'all',
  extraCsv: ''
})

const msg = ref('')

const preview = computed(() => ({
  subject: f.subject,
  body: f.body,
  audience: f.audience,
  extra: (f.extraCsv || '').split(',').map(s => s.trim()).filter(Boolean)
}))

function send() {
  msg.value = `Queued email to "${f.audience}" (${preview.value.extra.length} extra recipients) — mock`
  reset()
}
function reset() {
  f.subject = ''; f.body = ''; f.audience = 'all'; f.extraCsv = ''
}
</script>

<style scoped>
.container { width:min(1100px,92%); margin:0 auto; }
.card { padding:1rem; border:1px solid #e5e7eb; border-radius:14px; background:#fff; }
pre { white-space:pre-wrap; word-break:break-word; }
.link-more { text-decoration:none; font-weight:600; }
</style>
