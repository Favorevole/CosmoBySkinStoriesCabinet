<template>
  <div class="modern-layout">
    <!-- Top Header (Mobile) -->
    <header class="top-header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-square">SKIN</div>
          <span class="brand-text">stories</span>
        </div>
        <router-link to="/client/profile" class="profile-button">
          <span class="profile-icon">👤</span>
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Bottom Navigation (Mobile First) -->
    <nav class="bottom-nav">
      <router-link to="/client/dashboard" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Главная</span>
      </router-link>

      <router-link to="/client/consultations" class="nav-item">
        <span class="nav-icon">💬</span>
        <span class="nav-label">Консультации</span>
      </router-link>

      <router-link to="/client/care-scheme" class="nav-item nav-item-center">
        <span class="nav-icon-large">🧴</span>
        <span class="nav-label">Уход</span>
      </router-link>

      <router-link to="/client/procedures" class="nav-item">
        <span class="nav-icon">💆</span>
        <span class="nav-label">Процедуры</span>
      </router-link>

      <router-link to="/client/timeline" class="nav-item">
        <span class="nav-icon">📸</span>
        <span class="nav-label">Таймлайн</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

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

    const response = await axios.get('/api/client/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

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
/* Modern Mobile-First Layout */
.modern-layout {
  min-height: 100vh;
  background: #faf9f7;
  display: flex;
  flex-direction: column;
}

/* Top Header */
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
  font-size: 20px;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 32px;
  padding-bottom: 100px;
  max-width: 100%;
  width: 100%;
}

/* Bottom Navigation */
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
  font-size: 24px;
  transition: transform 0.3s;
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
  font-size: 32px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.25);
  transition: transform 0.3s;
}

.nav-item-center .nav-label {
  margin-top: 8px;
}

/* Desktop View */
@media (min-width: 769px) {
  .modern-layout {
    max-width: 500px;
    margin: 0 auto;
    box-shadow: 0 0 48px rgba(0, 0, 0, 0.08);
  }

  .top-header {
    max-width: 500px;
  }

  .main-content {
    max-width: 500px;
  }

  .bottom-nav {
    max-width: 500px;
  }
}

/* Mobile Adjustments */
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

  .nav-icon {
    font-size: 22px;
  }

  .nav-label {
    font-size: 9px;
  }

  .nav-icon-large {
    width: 56px;
    height: 56px;
    font-size: 28px;
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
