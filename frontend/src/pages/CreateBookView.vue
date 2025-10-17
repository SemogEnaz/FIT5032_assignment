<template>
  <main class="container py-4" style="max-width:680px;">
    <h1 class="h4 mb-3">Add Book (CAPS via Cloud Functions)</h1>

    <form class="card p-3 mb-3" @submit.prevent="create">
      <div class="mb-2">
        <label class="form-label">Name</label>
        <input v-model.trim="form.name" class="form-control" placeholder="the hobbit" required />
      </div>
      <div class="mb-2">
        <label class="form-label">Author</label>
        <input v-model.trim="form.author" class="form-control" placeholder="j.r.r. tolkien" required />
      </div>
      <div class="mb-2">
        <label class="form-label">ISBN</label>
        <input v-model.trim="form.isbn" class="form-control" placeholder="9780261103344" required />
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-dark" :disabled="busy">{{ busy ? 'Saving…' : 'Create' }}</button>
        <button class="btn btn-outline-secondary" type="button" @click="reset">Reset</button>
      </div>
    </form>

    <div v-if="result" class="card p-3 mb-3">
      <h2 class="h6">Server Response</h2>
      <pre class="bg-light p-2 rounded small">{{ result }}</pre>
    </div>

    <div v-if="bookId" class="card p-3">
      <h2 class="h6 mb-2">Capitalized Document</h2>
      <p class="text-muted small mb-2">We fetch the doc by ID; a short delay/poll lets the trigger finish.</p>
      <div class="d-flex gap-2 mb-2">
        <button class="btn btn-sm btn-outline-dark" @click="fetchDoc">Fetch Now</button>
        <button class="btn btn-sm btn-outline-secondary" @click="startPolling" :disabled="polling">Auto-poll</button>
      </div>
      <pre class="bg-light p-2 rounded small">{{ fetched }}</pre>
    </div>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  name: 'BooksDemo',
  data() {
    return {
      form: { name: '', author: '', isbn: '' },
      busy: false,
      error: '',
      result: null,
      bookId: '',
      fetched: null,
      polling: false,
      pollTimer: null,
      // Replace with your deployed HTTPS function URLs:
      URL_CREATE: 'https://createbook-5bgqwovi2q-km.a.run.app',
      URL_GET:    'https://getbook-5bgqwovi2q-km.a.run.app'
    };
  },
  methods: {
    async create() {
      this.error = ''; this.result = null; this.bookId = ''; this.fetched = null;
      try {
        this.busy = true;
        const res = await axios.post(this.URL_CREATE, { ...this.form });
        this.result = res.data;
        this.bookId = res.data.id;
        // Optional: start polling to display the capitalized doc automatically
        this.startPolling();
      } catch (e) {
        console.error(e);
        this.error = e?.response?.data?.error || e.message || 'Create failed.';
      } finally {
        this.busy = false;
      }
    },
    reset() {
      this.form = { name: '', author: '', isbn: '' };
      this.error = ''; this.result = null; this.bookId = ''; this.fetched = null;
      this.stopPolling();
    },
    async fetchDoc() {
      if (!this.bookId) return;
      try {
        const res = await axios.get(this.URL_GET, { params: { id: this.bookId } });
        this.fetched = res.data;
      } catch (e) {
        console.error(e);
        this.error = e?.response?.data?.error || e.message || 'Fetch failed.';
      }
    },
    startPolling() {
      if (this.polling || !this.bookId) return;
      this.polling = true;
      this.pollTimer = setInterval(async () => {
        await this.fetchDoc();
        // stop when normalized is true
        const normalized = this.fetched?.data?.normalized === true;
        if (normalized) this.stopPolling();
      }, 900);
    },
    stopPolling() {
      this.polling = false;
      if (this.pollTimer) clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  },
  beforeUnmount() {
    this.stopPolling();
  }
};
</script>

<style scoped>
.container { width: min(900px, 92%); margin: 0 auto; }
pre { white-space: pre-wrap; word-break: break-word; }
</style>
