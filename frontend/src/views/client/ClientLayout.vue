<template>
  <div class="layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h2>Личный кабинет</h2>
        <p v-if="client">{{ client.fullName }}</p>
      </div>

      <div class="nav-links">
        <router-link to="/client/dashboard" class="nav-link">
          <span class="icon">📊</span>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/client/consultations" class="nav-link">
          <span class="icon">📋</span>
          <span>Мои консультации</span>
        </router-link>

        <router-link to="/client/care-scheme" class="nav-link">
          <span class="icon">🧴</span>
          <span>Схема ухода</span>
        </router-link>

        <router-link to="/client/procedures" class="nav-link">
          <span class="icon">💆</span>
          <span>Процедуры</span>
        </router-link>

        <router-link to="/client/timeline" class="nav-link">
          <span class="icon">📸</span>
          <span>Таймлайн кожи</span>
        </router-link>

        <router-link to="/client/subscription" class="nav-link">
          <span class="icon">💳</span>
          <span>Подписка</span>
        </router-link>

        <router-link to="/client/profile" class="nav-link">
          <span class="icon">👤</span>
          <span>Профиль</span>
        </router-link>
      </div>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">
          <span class="icon">🚪</span>
          <span>Выйти</span>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
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
.layout {
  display: flex;
  min-height: 100vh;
  background: #faf9f7;
}

.sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e8e4db;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 32px 24px;
  border-bottom: 1px solid #e8e4db;
}

.sidebar-header h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  color: #1a1a1c;
  margin: 0 0 8px 0;
}

.sidebar-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.nav-links {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: #666;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #faf9f7;
  color: #1a1a1c;
}

.nav-link.router-link-active {
  background: #8b7355;
  color: #fff;
}

.nav-link .icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #e8e4db;
}

.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #fee;
  color: #c33;
}

.btn-logout .icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.main-content {
  margin-left: 280px;
  flex: 1;
  padding: 32px;
  max-width: 1200px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: relative;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e8e4db;
  }

  .main-content {
    margin-left: 0;
    padding: 20px 16px;
  }

  .nav-links {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-link span:not(.icon) {
    display: none;
  }
}
</style>
