<template>
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <pre v-if="jsondata">{{ jsondata }}</pre>

    <ul v-else-if="events.length" class="list-group">
      <li v-for="event in events" :key="event.id" class="list-group-item">
        <strong>{{ event.title }}</strong>
        <br>
        <small>{{ formatDate(event.start) }}</small>
      </li>
    </ul>

    <p v-else class="text-muted">No events found.</p>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GetEventAPI',
  data() {
    return {
      events: [],
      jsondata: null,
      error: null,
    };
  },
  mounted() {
    this.getEventAPI();
  },
  methods: {
    async getEventAPI() {
      try {
        const response = await axios.get(
          'https://getupcomingevents-5bgqwovi2q-uc.a.run.app'
        );

        if (response.data?.success && Array.isArray(response.data.events)) {
          this.events = response.data.events;
          this.jsondata = JSON.stringify(response.data.events, null, 2);
          this.error = null;
        } else {
          throw new Error('Unexpected API response');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        this.error = 'Failed to fetch events.';
        this.jsondata = { error: err.message };
      }
    },

    formatDate(iso) {
      try {
        return new Date(iso).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
      } catch {
        return iso;
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 700px;
}
pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  overflow-x: auto;
}
</style>
