<template>
  <pre v-if="jsondata">{{ jsondata }}</pre>
  <pre v-else-if="error">Error: {{ errorMessage }}</pre>
  <pre v-else>Loading…</pre>
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
  computed: {
    errorMessage() {
      return this.error?.message || 'Unknown error';
    }
  },
  mounted() {
    this.getBookCountAPI();
  },
  methods: {
    async getBookCountAPI() {
      try {
        const response = await axios.get('https://countbooks-5bgqwovi2q-km.a.run.app');
        // If you want to show JUST the number:
        // this.jsondata = String(response.data.count);

        // If you want the raw JSON in the <pre> block:
        this.jsondata = JSON.stringify(response.data, null, 2);

        this.error = null;
      } catch (error) {
        console.error('Error fetching book count:', error);
        this.error = error;
        this.jsondata = null;
      }
    },
  },
};
</script>
  