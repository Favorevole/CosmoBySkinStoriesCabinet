<template>
  <div class="page">
    <div class="page-header">
      <h1>Уведомления</h1>
      <button v-if="unreadCount > 0" @click="readAll" class="read-all-btn">Прочитать все</button>
    </div>

    <div v-if="loading && notifications.length === 0" class="loading">Загрузка...</div>
    <div v-else-if="notifications.length === 0" class="empty">Нет уведомлений</div>
    <template v-else>
      <div class="notif-list">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notif-card"
          :class="{ unread: !n.isRead }"
          @click="handleClick(n)"
        >
          <span class="notif-type-icon">{{ typeIcon(n.type) }}</span>
          <div class="notif-body">
            <div class="notif-top">
              <span class="notif-title">{{ n.title }}</span>
              <span class="notif-time">{{ formatDate(n.createdAt) }}</span>
            </div>
            <span class="notif-message">{{ n.message }}</span>
          </div>
          <span v-if="!n.isRead" class="unread-dot"></span>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <button @click="loadMore" :disabled="loading" class="btn btn-secondary">
          {{ loading ? 'Загрузка...' : 'Загрузить ещё' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDoctorNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/doctorCabinet.js';

const router = useRouter();
const notifications = ref([]);
const loading = ref(true);
const unreadCount = ref(0);
const total = ref(0);
const LIMIT = 20;

const hasMore = ref(false);

async function load(offset = 0) {
  loading.value = true;
  try {
    const res = await getDoctorNotifications({ limit: LIMIT, offset });
    if (offset === 0) {
      notifications.value = res.data.notifications;
    } else {
      notifications.value.push(...res.data.notifications);
    }
    total.value = res.data.total;
    unreadCount.value = res.data.unreadCount;
    hasMore.value = notifications.value.length < total.value;
  } catch (e) {
    // silent
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  load(notifications.value.length);
}

async function handleClick(n) {
  if (!n.isRead) {
    try {
      await markNotificationRead(n.id);
      n.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (e) { /* silent */ }
  }
  if (n.applicationId) {
    router.push(`/doctor/applications/${n.applicationId}`);
  }
}

async function readAll() {
  try {
    await markAllNotificationsRead();
    notifications.value.forEach(n => n.isRead = true);
    unreadCount.value = 0;
  } catch (e) { /* silent */ }
}

function typeIcon(type) {
  const icons = {
    NEW_APPLICATION: '📋',
    STATUS_CHANGE: '🔄',
    NEW_PHOTOS: '📷',
    RECOMMENDATION_APPROVED: '✅',
    RECOMMENDATION_DECLINED: '❌',
    CHAT_MESSAGE: '💬'
  };
  return icons[type] || '🔔';
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

onMounted(() => load());
</script>

<style scoped>
.page { padding: 32px; max-width: 700px; }
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin: 0; }
.loading { text-align: center; padding: 48px; color: #999; font-size: 14px; }
.empty { text-align: center; padding: 48px; color: #999; font-size: 14px; }

.read-all-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  color: #8b7355;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.read-all-btn:hover { background: #f5f0ea; }

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.notif-card:hover { background: #faf9f7; }
.notif-card.unread {
  background: #f5f0ea;
  border-color: #d4c5b0;
}
.notif-card.unread:hover { background: #efe8dc; }

.notif-type-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}
.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.notif-title {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1c;
}
.notif-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}
.notif-message {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #8b7355;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 8px;
}

.load-more {
  text-align: center;
  margin-top: 16px;
}
.btn {
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.btn-secondary { background: transparent; color: #666; border: 1px solid #e8e4db; }
.btn-secondary:hover { background: #f5f0ea; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
  .page { padding: 20px 16px; }
  .notif-top { flex-direction: column; gap: 2px; }
}
</style>
