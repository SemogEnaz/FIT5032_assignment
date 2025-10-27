<template>
  <main class="home">

    <Hero 
        :heroImg="heroImg"
        :ctaSubtitle="ctaSubtitle"
        :ctaTitle="ctaTitle" />

    <About :aboutText="aboutText" />

  </main>
</template>

<script setup>
import About from '../components/About.vue';
import Hero from '../components/Hero.vue';

const heroImg = 'https://quedos.com.au/wp-content/uploads/2022/07/man-playing-billiards.jpg';
const ctaTitle = 'Join the Club — Play, Learn, Compete';
const ctaSubtitle = 'Social nights, coaching clinics, and competitions for all levels.';
const aboutText = "We're a friendly local club running weekly events, coaching sessions, and social play. New players are always welcome.";

</script>

<style>
/* Layout */
.home { display: flex; flex-direction: column; gap: 3rem; }
.container { width: min(1100px, 92%); margin: 0 auto; }
.section { padding: 1rem 0 0.5rem; }
.section__header { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.section__title { font-size: clamp(1.4rem, 2.5vw, 2rem); margin: 0; }
.section__lead { color: #4b5563; max-width: 65ch; }
.link-more { text-decoration: none; font-weight: 600; }

/* Hero */
.hero { position: relative; min-height: 56vh; border-radius: 18px; overflow: hidden; }
.hero__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero__overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.35)); }
.hero__content { position: relative; z-index: 1; color: #fff; padding: clamp(1.25rem, 4vw, 3rem); max-width: 900px; height: 100%; display: grid; align-content: center; gap: 0.75rem; }
.hero__title { font-size: clamp(1.6rem, 5vw, 3rem); line-height: 1.05; margin: 0; }
.hero__subtitle { margin: 0.25rem 0 0.75rem; opacity: 0.95; max-width: 55ch; }
.hero__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

/* Buttons */
.btn { appearance: none; border: 1px solid transparent; border-radius: 999px; padding: 0.6rem 1rem; font-weight: 700; font-size: 0.95rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; }
.btn--primary { background: #111827; color: #fff; }
.btn--ghost { background: transparent; border-color: rgba(255,255,255,0.6); color: #fff; }
.btn--sm { padding: 0.45rem 0.8rem; font-size: 0.9rem; border-radius: 10px; background: #111827; color: #fff; text-decoration: none; }
</style>
