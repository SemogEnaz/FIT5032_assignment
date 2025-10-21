<template>
  <pre>{{ jsondata }}</pre>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GetAllBookAPI',
  data() {
    return {
      jsondata: null,
      error: null,
    };
  },
  mounted() {
    this.getAllBooksAPI();
  },
  methods: {
    async getAllBooksAPI() {
      try {
        // Replace with your deployed function URL:
        const URL = 'https://getallbooks-5bgqwovi2q-km.a.run.app';
        // Optional: pass params: ?orderBy=createdAt&direction=desc&limit=50
        const response = await axios.get(URL);
        this.jsondata = response.data;   // array of books
        this.error = null;
      } catch (error) {
        console.error('Error fetching all books:', error);
        this.error = error;
        this.jsondata = { error: 'Failed to fetch all books.' };
      }
    },
  },
};
</script>
