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
import { computed } from 'vue';
import About from '../components/About.vue';
import Hero from '../components/Hero.vue';

const heroImg = 'https://quedos.com.au/wp-content/uploads/2022/07/man-playing-billiards.jpg';
const ctaTitle = 'Join the Club — Play, Learn, Compete';
const ctaSubtitle = 'Social nights, coaching clinics, and competitions for all levels.';
const aboutText = "We're a friendly local club running weekly events, coaching sessions, and social play. New players are always welcome.";

const events = [
    {
    id: 'open-night',
    title: 'Club Open Night',
    start: new Date().toISOString(),
    location: 'Main Hall, 123 King St',
    summary: 'Meet the community, try the tables, and enjoy free coaching.'
    },
    {
    id: 'junior-comp',
    title: 'Junior Competition Round 1',
    start: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'Court 2',
    summary: 'First round of the junior league with prizes.'
    },
    {
    id: 'coaching-clinic',
    title: 'Coaching Clinic',
    start: new Date(Date.now() + 86400000 * 10).toISOString(),
    location: 'Training Room',
    summary: 'Small group technique clinic with our head coach.'
    }
];

const topEvents = computed(() => {
  return (events || [])
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 3)
});

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

/* Cards */
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.card { display: grid; grid-template-columns: 76px 1fr; gap: 0.75rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; box-shadow: 0 1px 0 rgba(0,0,0,0.04); }
.card__date { display: grid; place-items: center; background: #111827; color: #fff; border-radius: 10px; font-weight: 700; }
.card__day { font-size: 1.35rem; line-height: 1; }
.card__mon { font-size: 0.75rem; letter-spacing: 1px; opacity: 0.9; }
.card__title { margin: 0; font-size: 1.05rem; }
.card__meta { margin: 0.2rem 0 0.5rem; color: #6b7280; font-size: 0.9rem; }
.card__desc { color: #374151; margin: 0 0 0.75rem; }

/* Blog highlight */
.post { display: grid; grid-template-columns: 320px 1fr; gap: 1rem; align-items: center; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; background: #fff; }
.post__img { width: 100%; height: 100%; object-fit: cover; max-height: 240px; }
.post__body { padding: 1rem; }
.post__title { margin: 0 0 0.25rem; font-size: 1.25rem; }
.post__meta { margin: 0; color: #6b7280; }
.post__excerpt { margin: 0.5rem 0 0.75rem; color: #374151; }

/* Buttons */
.btn { appearance: none; border: 1px solid transparent; border-radius: 999px; padding: 0.6rem 1rem; font-weight: 700; font-size: 0.95rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; }
.btn--primary { background: #111827; color: #fff; }
.btn--ghost { background: transparent; border-color: rgba(255,255,255,0.6); color: #fff; }
.btn--sm { padding: 0.45rem 0.8rem; font-size: 0.9rem; border-radius: 10px; background: #111827; color: #fff; text-decoration: none; }

/* Empty */
.empty { border: 2px dashed #e5e7eb; border-radius: 12px; padding: 1rem; text-align: center; color: #6b7280; }

/* Responsive */
@media (max-width: 800px) {
  .post { grid-template-columns: 1fr; }
  .post__img { max-height: 200px; }
}
</style>
