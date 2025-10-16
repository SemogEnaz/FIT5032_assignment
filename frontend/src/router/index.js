import { createMemoryHistory, createRouter } from 'vue-router'

import HomePageView from '@/pages/HomePageView.vue';
import EventView from '@/pages/EventView.vue';
import BlogView from '@/pages/BlogView.vue';
import Newsletters from '@/pages/Newsletters.vue';
import LoginRegisterView from '@/pages/LoginRegisterView.vue';
import FirebaseSigninView from '@/pages/FirebaseSigninView.vue';
import FirebaseRegister from '@/pages/FirebaseRegister.vue';
import AddBookView from '@/pages/AddBookView.vue';
import GetBookCountView from '@/pages/GetBookCountView.vue';
import WeatherView from '@/pages/WeatherView.vue';

const routes = [
    { path: '/', name: "homePage", component: HomePageView },
    { path: '/events', name: "events", component: EventView},
    { path: '/blog', name: "blog", component: BlogView},
    { path: '/newsletters', name: "newsletters", component: Newsletters},
    { path: '/loginRegister', name: "loginregister", component: LoginRegisterView},
    { path: '/FireLogin', name: 'FireLogin', component: FirebaseSigninView },
    { path: '/FireRegister', name: 'FireRegister', component: FirebaseRegister },
    { path: '/addBook', name: 'AddBook', component: AddBookView },
    { path: '/getBook', name: 'GetBook', component: GetBookCountView },
    { path: '/WeatherCheck', name: 'WeatherCheck', component: WeatherView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
});

export default router;