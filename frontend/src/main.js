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

// Doctor views
import DoctorLogin from './views/doctor/DoctorLogin.vue';
import DoctorRegister from './views/doctor/DoctorRegister.vue';
import DoctorLayout from './views/doctor/DoctorLayout.vue';
import DoctorDashboard from './views/doctor/DoctorDashboard.vue';
import DoctorApplications from './views/doctor/DoctorApplications.vue';
import DoctorApplicationDetail from './views/doctor/DoctorApplicationDetail.vue';
import DoctorPatients from './views/doctor/DoctorPatients.vue';
import DoctorTemplates from './views/doctor/DoctorTemplates.vue';
import DoctorPrograms from './views/doctor/DoctorPrograms.vue';
import DoctorProducts from './views/doctor/DoctorProducts.vue';
import DoctorProfile from './views/doctor/DoctorProfile.vue';
import DoctorNotifications from './views/doctor/DoctorNotifications.vue';
import DoctorStatistics from './views/doctor/DoctorStatistics.vue';
import DoctorAlgorithms from './views/doctor/DoctorAlgorithms.vue';

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
  },
  // Doctor cabinet
  { path: '/doctor/login', component: DoctorLogin },
  { path: '/doctor/register', component: DoctorRegister },
  {
    path: '/doctor',
    component: DoctorLayout,
    meta: { requiresDoctorAuth: true },
    children: [
      { path: '', redirect: '/doctor/dashboard' },
      { path: 'dashboard', component: DoctorDashboard },
      { path: 'applications', component: DoctorApplications },
      { path: 'applications/:id', component: DoctorApplicationDetail },
      { path: 'patients', component: DoctorPatients },
      { path: 'templates', component: DoctorTemplates },
      { path: 'programs', component: DoctorPrograms },
      { path: 'products', component: DoctorProducts },
      { path: 'notifications', component: DoctorNotifications },
      { path: 'statistics', component: DoctorStatistics },
      { path: 'algorithms', component: DoctorAlgorithms },
      { path: 'profile', component: DoctorProfile }
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
  const doctorToken = localStorage.getItem('doctorToken');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.requiresDoctorAuth && !doctorToken) {
    next('/doctor/login');
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.mount('#app');
