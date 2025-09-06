<template>
    <!-- ABOUT (brief) -->
    <section class="section about">
      <div class="container">
        <h2 class="section__title">About Us</h2>
        <p class="section__lead">
          {{ aboutText }}
        </p>
      </div>
    </section>
</template>

<script setup>

defineProps({
    aboutText: String
});

</script>