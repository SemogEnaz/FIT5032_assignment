import { createMemoryHistory, createRouter } from 'vue-router'

import HomePageView from '@/pages/HomePageView.vue';
import EventView from '@/pages/EventView.vue';
import BlogView from '@/pages/BlogView.vue';
import Newsletters from '@/pages/Newsletters.vue';
import LoginRegisterView from '@/pages/LoginRegisterView.vue';

const routes = [
    { path: '/', name: "homePage", component: HomePageView },
    { path: '/events', name: "events", component: EventView},
    { path: '/blog', name: "blog", component: BlogView},
    { path: '/newsletters', name: "newsletters", component: Newsletters},
    { path: '/loginRegister', name: "loginregister", component: LoginRegisterView},
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
});

export default router;