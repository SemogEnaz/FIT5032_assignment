<template>
    <section class="hero d-flex flex-column align-items-center">
      <img
        class="hero__img"
        :src="heroImg"
        alt="People playing billiards"
      />
      <div class="hero__overlay" />
      <div class="hero__content">
        <h1 class="hero__title">{{ ctaTitle }}</h1>
        <p class="hero__subtitle">{{ ctaSubtitle }}</p>
        <div class="hero__actions">
          <router-link class="btn btn--primary" to="/events">See Past Events</router-link>
          <router-link class="btn btn--ghost" to="/map">See Upcoming Events</router-link>
        </div>
      </div>
    </section>
</template>

<script setup>

defineProps({
    heroImg: String,
    ctaTitle: String,
    ctaSubtitle: String
});

</script>