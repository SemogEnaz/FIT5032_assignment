import { createWebHistory, createRouter } from 'vue-router'

import HomePageView from '@/pages/HomePageView.vue';
import EventView from '@/pages/EventView.vue';
import LoginRegisterView from '@/pages/LoginRegisterView.vue';
import AdminDashView from '@/pages/Dashboard/AdminDashView.vue';
import AdminEvents from '@/pages/Dashboard/AdminActionsView.vue/AdminEvents.vue';
import AdminManageEvent from '@/pages/Dashboard/AdminActionsView.vue/AdminManageEvent.vue';
import GetEventAPI from '@/pages/API/GetEventAPI.vue';

const routes = [
    { path: '/events', name: "events", component: EventView},
    { path: '/loginRegister', name: "loginregister", component: LoginRegisterView},
    { path: '/admin', name: 'AdminHome', component: AdminDashView },
    { path: '/admin/events', name: 'AdminEvents', component: AdminEvents },
    { path: '/admin/manageEvents', name: 'AdminManageEvents', component: AdminManageEvent },
    { path: '/GetEventAPI', name: 'GetEventAPI', component: GetEventAPI },
    { path: '/', name: "homePage", component: HomePageView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
});

export default router;