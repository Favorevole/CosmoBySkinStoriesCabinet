<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-text">SKIN</span>
        <span class="logo-accent">STORIES</span>
      </div>
      <nav>
        <router-link to="/admin/applications" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Заявки
          <span v-if="stats.newCount" class="badge">{{ stats.newCount }}</span>
        </router-link>
        <router-link to="/admin/doctors" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          Врачи
          <span v-if="stats.pendingDoctors" class="badge">{{ stats.pendingDoctors }}</span>
        </router-link>
        <router-link to="/admin/reviews" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          Отзывы
          <span v-if="stats.pendingReviews" class="badge">{{ stats.pendingReviews }}</span>
        </router-link>
        <router-link to="/admin/settings" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Настройки
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="admin-info" v-if="adminName">
          <div class="admin-avatar">{{ adminInitials }}</div>
          <span class="admin-name">{{ adminName }}</span>
        </div>
        <button @click="logout" class="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Выйти
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDashboardStats, getMe } from '../api/index.js';

const router = useRouter();

const stats = ref({
  newCount: 0,
  pendingDoctors: 0,
  pendingReviews: 0
});

const adminName = ref('');

const adminInitials = computed(() => {
  if (!adminName.value) return '?';
  return adminName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

onMounted(async () => {
  try {
    const [statsResponse, meResponse] = await Promise.all([
      getDashboardStats(),
      getMe()
    ]);
    stats.value.newCount = statsResponse.data.applications?.newCount || 0;
    stats.value.pendingDoctors = statsResponse.data.doctors?.pending || 0;
    stats.value.pendingReviews = statsResponse.data.reviews?.pending || 0;
    adminName.value = meResponse.data.fullName || meResponse.data.telegramUsername || 'Admin';
  } catch (error) {
    console.error('Failed to load data:', error);
  }
});

function logout() {
  localStorage.removeItem('token');
  router.push('/login');
}
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: #1A1A1C;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1A1A1C 0%, #151517 100%);
  border-right: 1px solid rgba(201, 169, 98, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
}

.logo {
  padding: 28px 24px;
  border-bottom: 1px solid rgba(201, 169, 98, 0.1);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 0.3em;
}

.logo-accent {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  font-weight: 400;
  color: #C9A962;
  letter-spacing: 0.4em;
}

nav {
  flex: 1;
  padding: 20px 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  margin-bottom: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(201, 169, 98, 0.08);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, #5D1A2D 0%, #7A2339 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 15px rgba(93, 26, 45, 0.3);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.badge {
  margin-left: auto;
  background: #C9A962;
  color: #1A1A1C;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(201, 169, 98, 0.1);
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(201, 169, 98, 0.05);
  border-radius: 10px;
}

.admin-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #5D1A2D 0%, #7A2339 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
}

.admin-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(201, 169, 98, 0.2);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

.logout-btn:hover {
  background: rgba(201, 169, 98, 0.1);
  border-color: rgba(201, 169, 98, 0.3);
  color: #FFFFFF;
}

.main {
  flex: 1;
  margin-left: 260px;
  background: #1A1A1C;
  min-height: 100vh;
}

/* Mobile bottom navigation - iOS HIG / MD3 compliant */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    flex-direction: row;
    border-right: none;
    border-top: 1px solid rgba(201, 169, 98, 0.15);
    background: rgba(26, 26, 28, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 0;
    /* Safe area support */
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .logo {
    display: none;
  }

  nav {
    flex: 1;
    display: flex;
    padding: 0;
    gap: 0;
    justify-content: space-around;
  }

  .nav-item {
    flex: 1;
    flex-direction: column;
    /* Touch target minimum 44px */
    min-height: 56px;
    padding: 8px 4px 6px;
    margin: 0;
    border-radius: 0;
    font-size: 10px;
    gap: 4px;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    /* Touch feedback */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .nav-item:active {
    background: rgba(201, 169, 98, 0.1);
  }

  .nav-icon {
    width: 26px;
    height: 26px;
    transition: transform 0.2s ease;
  }

  .nav-item.router-link-active .nav-icon {
    transform: scale(1.1);
    color: #C9A962;
  }

  .nav-item.router-link-active {
    color: #C9A962;
    background: transparent;
    box-shadow: none;
  }

  /* MD3-style active pill indicator */
  .nav-item.router-link-active::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 56px;
    height: 32px;
    background: linear-gradient(135deg, rgba(93, 26, 45, 0.6) 0%, rgba(122, 35, 57, 0.4) 100%);
    border-radius: 16px;
    z-index: -1;
  }

  /* Improved badge positioning */
  .badge {
    position: absolute;
    top: 2px;
    left: 50%;
    margin-left: 6px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-footer {
    display: flex;
    padding: 0;
    border-top: none;
    border-left: 1px solid rgba(201, 169, 98, 0.1);
  }

  .admin-info {
    display: none;
  }

  .logout-btn {
    flex-direction: column;
    min-height: 56px;
    padding: 8px 16px 6px;
    border: none;
    border-radius: 0;
    font-size: 10px;
    gap: 4px;
    justify-content: center;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .logout-btn:active {
    background: rgba(201, 169, 98, 0.1);
  }

  .logout-btn svg {
    width: 26px;
    height: 26px;
  }

  .main {
    margin-left: 0;
    /* Account for bottom nav + safe area */
    padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px) + 16px);
  }
}
</style>
