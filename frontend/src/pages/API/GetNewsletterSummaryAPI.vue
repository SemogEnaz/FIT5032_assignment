<template>
  <pre>{{ jsondata }}</pre>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GetNewsletterAPI',
  data() {
    return {
      jsondata: null,
      error: null,
    };
  },
  mounted() {
    this.getNewsletterAPI();
  },
  methods: {
    async getNewsletterAPI() {
      try {
        // Read ?month=MM&year=YYYY from current page URL
        const params = new URLSearchParams(window.location.search);
        const month = Number(params.get('month'));
        const year = Number(params.get('year'));

        // Basic validation (optional)
        if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
          this.jsondata = { error: "Please provide valid 'month' (1..12) and 'year' in the query string." };
          return;
        }

        // Placeholder API endpoint — replace with your real Cloud Function/Run URL
        const response = await axios.get('https://getnewsletter-yourfn.a.run.app/newsletter', {
          params: { month, year }
        });

        // Expecting: { summary: "..." } or { newsletter: { summary: "..." } }
        const payload = response.data || {};
        const summary = payload.summary ?? payload.newsletter?.summary ?? null;

        this.jsondata = summary ? { summary } : { error: 'No summary in response.' };
        this.error = null;
      } catch (error) {
        // Fallback to mock data if API not available
        const params = new URLSearchParams(window.location.search);
        const month = String(Number(params.get('month'))).padStart(2, '0');
        const year = params.get('year');

        const MOCK = {
          '2025-10': 'October roundup: tournament results, coaching schedule, facility upgrades.',
          '2025-09': 'September news: social nights recap and junior league launch.',
          '2025-08': 'August highlights: equipment refresh and clinic feedback.'
        };
        const key = `${year}-${month}`;

        if (MOCK[key]) {
          this.jsondata = { summary: MOCK[key], source: 'mock' };
          this.error = null;
        } else {
          this.jsondata = { error: `No newsletter found for ${key}. (mock)`, source: 'mock' };
          this.error = error;
        }
      }
    },
  },
};
</script>
