<template>
  <pre>{{ jsondata }}</pre>
</template>

<script>
import axios from 'axios'; // kept for consistency with your CountBookAPI example

export default {
  name: 'GetEventAPI',
  data() {
    return {
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
        // For now, mock Firestore data
        const mockEvents = [
          { id: 1, name: "Club Open Night", date: "2025-10-21" },
          { id: 2, name: "Coaching Clinic", date: "2025-10-25" },
          { id: 3, name: "Friday Social", date: "2025-11-01" },
        ];

        // Placeholder API endpoint — replace with your real Cloud Function/Run URL
        let response = await axios.get('', {
        });

        // Simulate API/Firestore lookup
        // (You can later replace this with an axios call to your Firebase Cloud Function)
        response = { data: { events: mockEvents } };

        // Return JSON like a backend would
        this.jsondata = response.data.events;
        this.error = null;
      } catch (error) {
        console.error('Error fetching events:', error);
        this.error = error;
        this.jsondata = { error: 'Failed to fetch events.' };
      }
    },
  },
};
</script>
