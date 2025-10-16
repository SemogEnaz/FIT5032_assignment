<template>
  <div class="container">
    <div class="header">
      <h1>WEATHER APP</h1>

      <div class="search-bar">
        <input
          type="text"
          v-model="city"
          placeholder="Enter city name"
          class="search-input"
        />
        <button @click="searchByCity" class="search-button">Search</button>
      </div>
    </div>

    <!-- The <main> tag contains the weather results -->
    <main>
      <!-- If there is no data returned, skip rendering -->
      <div v-if="weatherData">
        <!-- Example of API data: https://openweathermap.org/current -->
        <h2>
          {{ weatherData.name }}, {{ weatherData.sys.country }}
        </h2>

        <div>
          <!-- Weather icon + temperature -->
          <img :src="iconUrl" alt="Weather Icon" />
          <p>{{ temperature }} °C</p>
        </div>

        <!-- weather[0] is current weather -->
        <span>{{ weatherData.weather[0].description }}</span>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

const apikey = "0b878e6c79ce879e400c0ad40db2a34e"; // replace with your key

export default {
  name: "App",
  data() {
    return {
      city: "",
      weatherData: null,
      hourlyForecast: [],
      dailyForecast: [],
    };
  },
  computed: {
    // Convert Kelvin to Celsius (or pass &units=metric to the API instead)
    temperature() {
      return this.weatherData
        ? Math.floor(this.weatherData.main.temp - 273)
        : null;
    },
    // Current weather icon
    iconUrl() {
      return this.weatherData
        // modern icon path (@2x gives a nicer image)
        ? `https://openweathermap.org/img/wn/${this.weatherData.weather[0].icon}@2x.png`
        : null;
    },
  },
  mounted() {
    this.fetchCurrentLocationWeather();
  },
  methods: {
    async searchByCity() {
      if (!this.city) return;
      // Add &units=metric if you prefer Celsius directly from API
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        this.city
      )}&appid=${apikey}`;
      await this.fetchWeatherData(url);
    },
    async fetchCurrentLocationWeather() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
          await this.fetchWeatherData(url);
        });
      }
    },
    async fetchWeatherData(url) {
      try {
        const response = await axios.get(url);
        this.weatherData = response.data;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        this.weatherData = null;
      }
    },
  },
};
</script>
