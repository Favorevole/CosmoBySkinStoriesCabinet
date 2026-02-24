<template>
  <div class="notification-bell" ref="bellRef">
    <button @click="toggleDropdown" class="bell-btn" :class="{ active: showDropdown }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="bell-icon">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      <span v-if="unreadCount > 0" class="bell-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <div v-if="showDropdown" class="dropdown">
      <div class="dropdown-header">
        <span class="dropdown-title">Уведомления</span>
        <button v-if="unreadCount > 0" @click="readAll" class="read-all-btn">Прочитать все</button>
      </div>
      <div v-if="loading" class="dropdown-loading">Загрузка...</div>
      <div v-else-if="notifications.length === 0" class="dropdown-empty">Нет уведомлений</div>
      <div v-else class="dropdown-list">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notif-item"
          :class="{ unread: !n.isRead }"
          @click="handleClick(n)"
        >
          <div class="notif-icon-wrap">
            <span class="notif-type-icon">{{ typeIcon(n.type) }}</span>
          </div>
          <div class="notif-content">
            <span class="notif-title">{{ n.title }}</span>
            <span class="notif-message">{{ n.message }}</span>
            <span class="notif-time">{{ timeAgo(n.createdAt) }}</span>
          </div>
        </div>
      </div>
      <router-link to="/doctor/notifications" class="dropdown-footer" @click="showDropdown = false">
        Все уведомления
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { getNotificationUnreadCount, getDoctorNotifications, markNotificationRead, markAllNotificationsRead } from '../../../api/doctorCabinet.js';

const router = useRouter();
const bellRef = ref(null);
const showDropdown = ref(false);
const unreadCount = ref(0);
const notifications = ref([]);
const loading = ref(false);
let pollTimer = null;

async function fetchUnreadCount() {
  try {
    const res = await getNotificationUnreadCount();
    unreadCount.value = res.data.count;
  } catch (e) {
    // silent
  }
}

async function fetchNotifications() {
  loading.value = true;
  try {
    const res = await getDoctorNotifications({ limit: 10, offset: 0 });
    notifications.value = res.data.notifications;
    unreadCount.value = res.data.unreadCount;
  } catch (e) {
    // silent
  } finally {
    loading.value = false;
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    fetchNotifications();
  }
}

async function handleClick(n) {
  if (!n.isRead) {
    try {
      await markNotificationRead(n.id);
      n.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (e) { /* silent */ }
  }
  showDropdown.value = false;
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

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин. назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч. назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} дн. назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function handleClickOutside(e) {
  if (bellRef.value && !bellRef.value.contains(e.target)) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  fetchUnreadCount();
  pollTimer = setInterval(fetchUnreadCount, 30000);
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  clearInterval(pollTimer);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-bell {
  position: relative;
}
.bell-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.bell-btn:hover, .bell-btn.active {
  background: #f5f0ea;
}
.bell-icon {
  width: 22px;
  height: 22px;
  color: #666;
}
.bell-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #dc2626;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 360px;
  max-height: 460px;
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  margin-top: 4px;
}
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #e8e4db;
}
.dropdown-title {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1c;
}
.read-all-btn {
  background: none;
  border: none;
  color: #8b7355;
  font-size: 12px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.read-all-btn:hover { text-decoration: underline; }

.dropdown-loading, .dropdown-empty {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
.dropdown-list {
  flex: 1;
  overflow-y: auto;
  max-height: 340px;
}
.notif-item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f0ea;
}
.notif-item:hover { background: #faf9f7; }
.notif-item.unread { background: #f5f0ea; }
.notif-item.unread:hover { background: #efe8dc; }
.notif-icon-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.notif-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.notif-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notif-message {
  font-size: 12px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.notif-time {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.dropdown-footer {
  display: block;
  text-align: center;
  padding: 10px;
  font-size: 13px;
  color: #8b7355;
  text-decoration: none;
  border-top: 1px solid #e8e4db;
}
.dropdown-footer:hover { background: #faf9f7; }

@media (max-width: 768px) {
  .dropdown {
    width: calc(100vw - 32px);
    right: -12px;
  }
}
</style>
