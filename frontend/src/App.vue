<template>

  <div class="d-flex flex-column align-items-center">
    <h1 class="mt-3">Clayton Pool Assocation</h1>
    <nav class="mt-3 w-100">
      <ul class="nav nav-pills nav nav-pills nav-justified px-3">
        <li class="nav-item">
          <RouterLink class="nav-link" to="/">Home Page</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/events">Events</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/blog">Blog</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/newsletters">Newsletters</RouterLink>
        </li>
      </ul>
    </nav>
    <main>
      <RouterView class="mt-4"/>
    </main>
  </div>
  
</template>

<script setup>
</script>


<style scoped></style>
