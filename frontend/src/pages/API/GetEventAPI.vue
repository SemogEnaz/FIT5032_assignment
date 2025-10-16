<template>
  <main class="py-4">
    <section class="container text-center mb-3">
      <h1 class="mb-2">Events (Mock API)</h1>
      <p class="text-muted mb-3">Fetching event list from API…</p>
    </section>

    <section class="container">
      <div v-if="error" class="alert alert-danger">
        Error fetching events: {{ error.message }}
      </div>

      <div v-else-if="!jsondata" class="text-secondary">Loading events...</div>

      <pre v-else class="bg-light p-3 rounded">
        {{ jsondata }}
      </pre>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      jsondata: null,
      error: null,
    };
  },
  mounted() {
    this.getEventsAPI();
  },
  methods: {
    async getEventsAPI() {
      try {
        // Mock endpoint for example — replace with your real one later
        const response = await axios.get('');
        // Assume response looks like: { events: [{ name: "Club Open Night" }, ...] }
        this.jsondata = response.data.events || [];
        this.error = null;
      } catch (error) {
        console.error('Error fetching events:', error);
        this.error = error;
        this.jsondata = null;
      }
    },
  },
};
</script>

<style scoped>
.container { width: min(1100px, 92%); margin: 0 auto; }
pre {
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
