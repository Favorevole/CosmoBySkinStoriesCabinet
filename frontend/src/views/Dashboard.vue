<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">CosmoSkin</div>
      <nav>
        <router-link to="/admin/applications" class="nav-item">
          <span class="icon">📋</span>
          Заявки
          <span v-if="stats.newCount" class="badge">{{ stats.newCount }}</span>
        </router-link>
        <router-link to="/admin/doctors" class="nav-item">
          <span class="icon">👩‍⚕️</span>
          Врачи
          <span v-if="stats.pendingDoctors" class="badge">{{ stats.pendingDoctors }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">Выйти</button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDashboardStats } from '../api';

const router = useRouter();

const stats = ref({
  newCount: 0,
  pendingDoctors: 0
});

onMounted(async () => {
  try {
    const response = await getDashboardStats();
    stats.value.newCount = response.data.applications.newCount || 0;
    stats.value.pendingDoctors = response.data.doctors.pending || 0;
  } catch (error) {
    console.error('Failed to load stats:', error);
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
}

.sidebar {
  width: 250px;
  background: var(--gray-900);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
}

.logo {
  padding: 24px;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

nav {
  flex: 1;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--gray-400);
  border-radius: 8px;
  margin-bottom: 4px;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--gray-800);
  color: white;
  text-decoration: none;
}

.nav-item.router-link-active {
  background: var(--primary);
  color: white;
}

.nav-item .icon {
  font-size: 18px;
}

.badge {
  margin-left: auto;
  background: var(--danger);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--gray-800);
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--gray-700);
  color: var(--gray-400);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: var(--gray-800);
  color: white;
}

.main {
  flex: 1;
  margin-left: 250px;
  background: var(--gray-50);
  min-height: 100vh;
}
</style>
