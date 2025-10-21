<template>
  <div class="container">
    <header class="header">
      <h1>WEATHER APP</h1>

      <div class="search-bar">
        <input
          type="text"
          v-model.trim="city"
          placeholder='Enter city (e.g. "Clayton, AU")'
          class="search-input"
          @keyup.enter="searchByCity"
        />
        <button @click="searchByCity" class="search-button" :disabled="loading">
          {{ loading ? 'Searching…' : 'Search' }}
        </button>
      </div>

      <p class="hint">Tip: Try <strong>Clayton, AU</strong></p>
    </header>

    <main>
      <!-- Error -->
      <div v-if="error" class="error">{{ error }}</div>

      <!-- Result -->
      <div v-else-if="weatherData" class="card">
        <h2 class="place">
          {{ weatherData.name }}, {{ weatherData.sys.country }}
        </h2>

        <div class="reading">
          <img :src="iconUrl" alt="Weather Icon" v-if="iconUrl" />
          <p class="temp">
            {{ temperature }} °C
            <span class="desc">{{ weatherData.weather[0].description }}</span>
          </p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty">Search a city to see its current weather.</div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

// Put your key here
const apikey = "0b878e6c79ce879e400c0ad40db2a34e";

export default {
  name: "WeatherSearch",
  data() {
    return {
      city: "",
      weatherData: null,
      loading: false,
      error: null,
    };
  },
  computed: {
    // We request metric from the API, so this is already °C.
    temperature() {
      return this.weatherData ? Math.round(this.weatherData.main.temp) : null;
    },
    iconUrl() {
      return this.weatherData
        ? `https://openweathermap.org/img/wn/${this.weatherData.weather[0].icon}@2x.png`
        : null;
    },
  },
  mounted() {
    // Optional: try current location on load
    this.fetchCurrentLocationWeather();
  },
  methods: {
    async searchByCity() {
      this.error = null;
      this.weatherData = null;
      if (!this.city) return;

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        this.city
      )}&appid=${apikey}&units=metric`; // units=metric => °C

      await this.fetchWeatherData(url);
    },

    async fetchCurrentLocationWeather() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${apikey}&units=metric`;
          await this.fetchWeatherData(url);
        },
        () => {
          // ignore geolocation errors; user can search manually
        }
      );
    },

    async fetchWeatherData(url) {
      try {
        this.loading = true;
        const { data } = await axios.get(url, { timeout: 10000 });
        this.weatherData = data;
        this.error = null;
      } catch (e) {
        // Friendly errors
        const code = e?.response?.status;
        if (code === 404) this.error = "City not found. Try a different name (e.g. Clayton, AU).";
        else if (code === 401) this.error = "Invalid API key. Check your OpenWeatherMap key.";
        else this.error = "Failed to fetch weather. Please try again.";
        this.weatherData = null;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.container { width: min(720px, 92%); margin: 1.5rem auto; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
.header { display: grid; gap: .75rem; justify-items: center; }
h1 { margin: 0 0 .25rem; }
.search-bar { display: flex; gap: .5rem; width: 100%; max-width: 520px; }
.search-input { flex: 1; padding: .6rem .75rem; border: 1px solid #ddd; border-radius: 10px; }
.search-button { padding: .6rem .9rem; border: 1px solid #111; background: #111; color: #fff; border-radius: 10px; cursor: pointer; }
.hint { color: #666; margin: 0; }

main { margin-top: 1rem; }
.card { border: 1px solid #eee; border-radius: 12px; padding: 1rem; background: #fff; }
.place { margin: 0 0 .25rem; }
.reading { display: flex; align-items: center; gap: .75rem; }
.temp { font-size: 1.5rem; margin: 0; }
.desc { display: block; font-size: .95rem; color: #666; text-transform: capitalize; }
.error { color: #b00020; background: #fdecee; border: 1px solid #f5c2c7; padding: .75rem; border-radius: 10px; }
.empty { color: #666; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 1rem; text-align: center; }
</style>
