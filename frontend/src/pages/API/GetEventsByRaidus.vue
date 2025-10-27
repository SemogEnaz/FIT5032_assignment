<template>
  <div v-if="error" class="alert alert-danger">
    {{ error }}
  </div>

  <pre v-else-if="jsondata">{{ jsondata }}</pre>

  <p v-else class="text-muted">Fetching nearby events...</p>
</template>

<script>
import axios from "axios";

export default {
  name: "GetNearbyEvents",
  data() {
    return {
      jsondata: null,
      error: null,
    };
  },
  mounted() {
    this.getNearbyEvents();
  },
  methods: {
    async getNearbyEvents() {
      try {
        if (!navigator.geolocation) {
          this.error = "Geolocation not supported in this browser.";
          return;
        }

        // Get current user location
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;

            const res = await axios.post(
              "https://getnearbyevents-5bgqwovi2q-uc.a.run.app",
              {
                lat,
                lng,
                radiusKm: 25,
              },
              { headers: { "Content-Type": "application/json" } }
            );

            if (res.data?.success && Array.isArray(res.data.events)) {
              this.jsondata = JSON.stringify(res.data, null, 2);
              this.error = null;
            } else {
              throw new Error("Unexpected API response.");
            }
          },
          (err) => {
            console.error("Geolocation error:", err);
            this.error = "Unable to retrieve your location.";
          }
        );
      } catch (error) {
        console.error("Error fetching nearby events:", error);
        this.error = "Failed to fetch nearby events.";
        this.jsondata = JSON.stringify({ error: error.message }, null, 2);
      }
    },
  },
};
</script>

<style scoped>
pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  overflow-x: auto;
}
</style>
