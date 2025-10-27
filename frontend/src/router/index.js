import axios from "axios";
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

async function verifyAdminAccess() {
  const local = localStorage.getItem("sessionUser");
  if (!local) {
    console.log('Please login with admin credentials');
    router.push("/loginRegister");
    return;
  }

  const user = JSON.parse(local);
  console.log(user)

  try {
    const res = await axios.post(
      "https://verifysessionuser-5bgqwovi2q-uc.a.run.app",
      { uid: user.uid },
      { headers: { "Content-Type": "application/json" } }
    );

    if (!res.data.success) throw new Error("Verification failed");
    if (res.data.role !== "admin") {
      alert("Access denied — admin only.");
      router.push("/"); // redirect to home
      return;
    }

    console.log("✅ Verified admin access:", res.data.user);
    return true;
  } catch (err) {
    console.error("❌ Verification error:", err);
    router.push("/loginRegister");
    return false;
  }
}

router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith('/admin')) {
    const isAllowed = await verifyAdminAccess()
    if (!isAllowed) return next('/loginRegister')
  }
  next()
})

export default router;