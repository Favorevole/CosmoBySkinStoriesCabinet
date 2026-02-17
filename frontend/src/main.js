import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

// Views
import Landing from './views/Landing.vue';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import Applications from './views/Applications.vue';
import ApplicationDetail from './views/ApplicationDetail.vue';
import Doctors from './views/Doctors.vue';
import Settings from './views/Settings.vue';
import Reviews from './views/Reviews.vue';
import PromoCodes from './views/PromoCodes.vue';
import Payments from './views/Payments.vue';
import Analytics from './views/Analytics.vue';
import Privacy from './views/Privacy.vue';

const routes = [
  { path: '/', component: Landing },
  { path: '/privacy', component: Privacy },
  { path: '/login', component: Login },
  {
    path: '/admin',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/applications' },
      { path: 'applications', component: Applications },
      { path: 'applications/:id', component: ApplicationDetail },
      { path: 'doctors', component: Doctors },
      { path: 'reviews', component: Reviews },
      { path: 'promo-codes', component: PromoCodes },
      { path: 'analytics', component: Analytics },
      { path: 'payments', component: Payments },
      { path: 'settings', component: Settings }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Auth guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.mount('#app');
