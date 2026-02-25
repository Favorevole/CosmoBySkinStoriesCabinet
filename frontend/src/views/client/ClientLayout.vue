<template>
  <div class="modern-layout">
    <!-- Desktop Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-square">SKIN</div>
          <span class="brand-text">stories</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/client/dashboard" class="sidebar-item">
          <span class="sidebar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="sidebar-label">Главная</span>
        </router-link>

        <router-link to="/client/consultations" class="sidebar-item">
          <span class="sidebar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span class="sidebar-label">Консультации</span>
        </router-link>

        <router-link to="/client/care-scheme" class="sidebar-item">
          <span class="sidebar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </span>
          <span class="sidebar-label">Схема ухода</span>
        </router-link>

        <router-link to="/client/procedures" class="sidebar-item">
          <span class="sidebar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>
            </svg>
          </span>
          <span class="sidebar-label">Процедуры</span>
        </router-link>

        <router-link to="/client/timeline" class="sidebar-item">
          <span class="sidebar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </span>
          <span class="sidebar-label">Таймлайн</span>
        </router-link>

        <router-link to="/client/subscription" class="sidebar-item">
          <span class="sidebar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </span>
          <span class="sidebar-label">Подписка</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/client/profile" class="sidebar-item">
          <span class="sidebar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span class="sidebar-label">Профиль</span>
        </router-link>
      </div>
    </aside>

    <!-- Mobile Top Header -->
    <header class="top-header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-square">SKIN</div>
          <span class="brand-text">stories</span>
        </div>
        <router-link to="/client/profile" class="profile-button">
          <svg class="profile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="bottom-nav">
      <router-link to="/client/dashboard" class="nav-item">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </span>
        <span class="nav-label">Главная</span>
      </router-link>

      <router-link to="/client/consultations" class="nav-item">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <span class="nav-label">Консультации</span>
      </router-link>

      <router-link to="/client/care-scheme" class="nav-item nav-item-center">
        <span class="nav-icon-large">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
          </svg>
        </span>
        <span class="nav-label">Уход</span>
      </router-link>

      <router-link to="/client/procedures" class="nav-item">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>
          </svg>
        </span>
        <span class="nav-label">Процедуры</span>
      </router-link>

      <router-link to="/client/timeline" class="nav-item">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </span>
        <span class="nav-label">Таймлайн</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getClientMe } from '@/api/clientCabinet';

const router = useRouter();
const client = ref(null);

onMounted(async () => {
  await loadClientInfo();
});

async function loadClientInfo() {
  try {
    const token = localStorage.getItem('clientToken');
    if (!token) {
      router.push('/client/login');
      return;
    }

    const response = await getClientMe();
    client.value = response.data.client;
  } catch (error) {
    console.error('Failed to load client info:', error);
    localStorage.removeItem('clientToken');
    router.push('/client/login');
  }
}

function handleLogout() {
  localStorage.removeItem('clientToken');
  router.push('/client/login');
}
</script>

<style scoped>
/* Modern Responsive Layout */
.modern-layout {
  min-height: 100vh;
  background: #faf9f7;
  display: flex;
  flex-direction: column;
}

/* ===== DESKTOP SIDEBAR ===== */
.sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .modern-layout {
    flex-direction: row;
    max-width: 1400px;
    margin: 0 auto;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    width: 280px;
    min-height: 100vh;
    background: #fff;
    border-right: 1px solid #e8d5c4;
    position: sticky;
    top: 0;
    left: 0;
  }

  .sidebar-header {
    padding: 32px 24px;
    border-bottom: 1px solid #f5e6d3;
  }

  .sidebar-header .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sidebar-header .brand-square {
    background: #6b4e3d;
    color: #fff;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Cormorant Garamond', serif;
    letter-spacing: 1px;
    border-radius: 12px;
  }

  .sidebar-header .brand-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    color: #6b4e3d;
    letter-spacing: 0.5px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    border-radius: 12px;
    text-decoration: none;
    color: #666;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .sidebar-item:hover {
    background: #f5e6d3;
    color: #3a2a1f;
  }

  .sidebar-item.router-link-active {
    background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(107, 78, 61, 0.25);
  }

  .sidebar-icon {
    width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-icon svg {
    display: block;
  }

  .sidebar-label {
    flex: 1;
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid #f5e6d3;
  }

  /* Hide mobile header and bottom nav on desktop */
  .top-header {
    display: none;
  }

  .bottom-nav {
    display: none;
  }

  .main-content {
    flex: 1;
    padding: 48px 64px;
    padding-bottom: 48px;
    max-width: 1120px;
  }
}

/* ===== MOBILE HEADER ===== */
.top-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(232, 228, 219, 0.5);
}

.header-content {
  max-width: 500px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-square {
  background: #6b4e3d;
  color: #fff;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
}

.brand-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  color: #6b4e3d;
  letter-spacing: 0.5px;
}

.profile-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5e6d3;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s;
}

.profile-button:hover {
  background: #e8d5c4;
  transform: scale(1.05);
}

.profile-icon {
  color: #6b4e3d;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  padding: 32px;
  padding-bottom: 100px;
  max-width: 100%;
  width: 100%;
}

/* ===== MOBILE BOTTOM NAVIGATION ===== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(232, 228, 219, 0.5);
  padding: 12px 8px 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
  z-index: 100;
  max-width: 500px;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 32px 32px 0 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 16px;
  transition: all 0.3s;
  min-width: 60px;
}

.nav-item:hover {
  background: rgba(232, 213, 196, 0.3);
}

.nav-item.router-link-active {
  background: transparent;
}

.nav-item.router-link-active .nav-icon,
.nav-item.router-link-active .nav-icon-large {
  transform: scale(1.15);
}

.nav-item.router-link-active .nav-label {
  color: #6b4e3d;
  font-weight: 700;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.3s;
}

.nav-icon svg {
  display: block;
}

.nav-item.router-link-active .nav-icon {
  color: #6b4e3d;
}

.nav-label {
  font-size: 10px;
  color: #999;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s;
  letter-spacing: 0.3px;
}

/* Center Item (Featured) */
.nav-item-center {
  position: relative;
  margin: -20px 0 0;
}

.nav-icon-large {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.25);
  transition: transform 0.3s;
  color: #fff;
}

.nav-icon-large svg {
  display: block;
}

.nav-item-center .nav-label {
  margin-top: 8px;
}

/* ===== TABLET (MEDIUM SCREENS) ===== */
@media (min-width: 769px) and (max-width: 1023px) {
  .modern-layout {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 48px rgba(0, 0, 0, 0.08);
  }

  .top-header {
    max-width: 768px;
  }

  .main-content {
    max-width: 768px;
    padding: 40px;
  }

  .bottom-nav {
    max-width: 768px;
  }
}

/* ===== MOBILE ADJUSTMENTS ===== */
@media (max-width: 768px) {
  .bottom-nav {
    width: 100%;
    max-width: 100%;
    left: 0;
    transform: none;
    border-radius: 24px 24px 0 0;
    padding: 10px 4px 16px;
  }

  .nav-item {
    min-width: 56px;
    padding: 6px 8px;
  }

  .nav-icon svg {
    width: 22px;
    height: 22px;
  }

  .nav-label {
    font-size: 9px;
  }

  .nav-icon-large {
    width: 56px;
    height: 56px;
  }

  .nav-icon-large svg {
    width: 28px;
    height: 28px;
  }

  .nav-item-center {
    margin-top: -16px;
  }
}

@media (max-width: 380px) {
  .nav-label {
    font-size: 8px;
  }

  .nav-item {
    min-width: 50px;
    padding: 4px 6px;
  }
}
</style>
