import { createWebHistory, createRouter } from 'vue-router'

import HomePageView from '@/pages/HomePageView.vue';
import EventView from '@/pages/EventView.vue';
import BlogView from '@/pages/BlogView.vue';
import Newsletters from '@/pages/Newsletters.vue';
import LoginRegisterView from '@/pages/LoginRegisterView.vue';
import FirebaseSigninView from '@/pages/ExternalAuth/FirebaseSigninView.vue';
import FirebaseRegister from '@/pages/ExternalAuth/FirebaseRegister.vue';
import AddBookView from '@/pages/AddBookView.vue';
import UserDashView from '@/pages/Dashboards/UserDashView.vue';
import AdminDashView from '@/pages/Dashboards/AdminDashView.vue';
import AdminEmail from '@/pages/Dashboards/AdminActionsView.vue/AdminEmail.vue';
import AdminBlog from '@/pages/Dashboards/AdminActionsView.vue/AdminBlog.vue';
import AdminEvents from '@/pages/Dashboards/AdminActionsView.vue/AdminEvents.vue';
import GetEventAPI from '@/pages/API/GetEventAPI.vue';
import GetNewsletterSummaryAPI from '@/pages/API/GetNewsletterSummaryAPI.vue';

const routes = [
    { path: '/events', name: "events", component: EventView},
    { path: '/blog', name: "blog", component: BlogView},
    { path: '/newsletters', name: "newsletters", component: Newsletters},
    { path: '/loginRegister', name: "loginregister", component: LoginRegisterView},
    { path: '/admin', name: 'AdminHome', component: AdminDashView },
    { path: '/admin/events', name: 'AdminEvents', component: AdminEvents },
    { path: '/admin/blog', name: 'AdminBlog', component: AdminBlog },
    { path: '/admin/email', name: 'AdminEmail', component: AdminEmail },
    { path: '/UserDashboard', name: 'UserDashboard', component: UserDashView },
    { path: '/GetEventAPI', name: 'GetEventAPI', component: GetEventAPI },
    { path: '/GetSummaryAPI', name: 'GetSummaryAPI', component: GetNewsletterSummaryAPI },
    { path: '/', name: "homePage", component: HomePageView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
});

export default router;