<template>
  <div class="chat-panel">
    <div class="chat-header">
      <h3>Чат с клиентом</h3>
      <span v-if="unreadCount > 0" class="chat-badge">{{ unreadCount }}</span>
    </div>

    <div v-if="!isTelegramClient" class="chat-stub">
      Чат доступен только для клиентов из Telegram. Данный клиент зарегистрирован через сайт.
    </div>
    <template v-else>
      <div class="chat-messages" ref="messagesRef" @scroll="handleScroll">
        <div v-if="hasMore" class="load-more-row">
          <button @click="loadOlder" :disabled="loadingOlder" class="load-more-btn">
            {{ loadingOlder ? 'Загрузка...' : 'Загрузить ранние' }}
          </button>
        </div>
        <div v-if="messages.length === 0 && !loading" class="chat-empty">
          Нет сообщений. Начните переписку.
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['msg', msg.senderType === 'DOCTOR' ? 'msg-doctor' : 'msg-client']"
        >
          <div class="msg-bubble">
            <span class="msg-text">{{ msg.text }}</span>
            <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="chat-input-row">
        <input
          v-model="inputText"
          @keydown.enter.prevent="send"
          placeholder="Написать сообщение..."
          maxlength="2000"
          class="chat-input"
          :disabled="sending"
        >
        <button @click="send" :disabled="!inputText.trim() || sending" class="send-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { getMessages, sendMessage, markChatRead } from '../../../api/doctorCabinet.js';

const props = defineProps({
  applicationId: { type: Number, required: true },
  clientTelegramId: { type: [String, Number], default: null }
});

const messages = ref([]);
const inputText = ref('');
const sending = ref(false);
const loading = ref(true);
const loadingOlder = ref(false);
const unreadCount = ref(0);
const hasMore = ref(false);
const messagesRef = ref(null);
let pollTimer = null;

const isTelegramClient = ref(!!props.clientTelegramId);

async function loadMessages(before = null) {
  try {
    const res = await getMessages(props.applicationId, {
      limit: 30,
      ...(before ? { before } : {})
    });
    return res.data.messages;
  } catch (e) {
    return [];
  }
}

async function initialLoad() {
  loading.value = true;
  const msgs = await loadMessages();
  messages.value = msgs;
  hasMore.value = msgs.length >= 30;
  loading.value = false;
  await scrollToBottom();
  markRead();
}

async function loadOlder() {
  if (messages.value.length === 0 || loadingOlder.value) return;
  loadingOlder.value = true;
  const oldest = messages.value[0];
  const older = await loadMessages(oldest.id);
  if (older.length > 0) {
    messages.value = [...older, ...messages.value];
  }
  hasMore.value = older.length >= 30;
  loadingOlder.value = false;
}

async function poll() {
  try {
    const msgs = await loadMessages();
    if (msgs.length > 0) {
      const lastKnown = messages.value.length > 0 ? messages.value[messages.value.length - 1].id : 0;
      const newMsgs = msgs.filter(m => m.id > lastKnown);
      if (newMsgs.length > 0) {
        messages.value.push(...newMsgs);
        const clientMsgs = newMsgs.filter(m => m.senderType === 'CLIENT');
        unreadCount.value += clientMsgs.length;
        await scrollToBottom();
        markRead();
      }
    }
  } catch (e) {
    // silent
  }
}

async function send() {
  const text = inputText.value.trim();
  if (!text || sending.value) return;

  sending.value = true;
  try {
    const res = await sendMessage(props.applicationId, text);
    inputText.value = '';
    if (res.data.message) {
      messages.value.push(res.data.message);
    }
    await scrollToBottom();
  } catch (e) {
    // silent
  } finally {
    sending.value = false;
  }
}

async function markRead() {
  try {
    await markChatRead(props.applicationId);
    unreadCount.value = 0;
  } catch (e) { /* silent */ }
}

async function scrollToBottom() {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
}

function handleScroll() {
  // Could detect reaching top for auto-loading older messages
}

function formatTime(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  if (isTelegramClient.value) {
    initialLoad();
    pollTimer = setInterval(poll, 10000);
  }
});

onBeforeUnmount(() => {
  clearInterval(pollTimer);
});
</script>

<style scoped>
.chat-panel {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e4db;
}
.chat-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1c;
  margin: 0;
}
.chat-badge {
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.chat-stub {
  padding: 24px 20px;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.chat-messages {
  flex: 1;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.chat-empty {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 32px 0;
}

.load-more-row {
  text-align: center;
  margin-bottom: 8px;
}
.load-more-btn {
  background: none;
  border: none;
  color: #8b7355;
  font-size: 12px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.load-more-btn:hover { text-decoration: underline; }
.load-more-btn:disabled { opacity: 0.5; }

.msg {
  display: flex;
}
.msg-doctor {
  justify-content: flex-end;
}
.msg-client {
  justify-content: flex-start;
}
.msg-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.msg-doctor .msg-bubble {
  background: #8b7355;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.msg-client .msg-bubble {
  background: #f5f0ea;
  color: #1a1a1c;
  border-bottom-left-radius: 4px;
}
.msg-text {
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}
.msg-time {
  font-size: 11px;
  opacity: 0.7;
  align-self: flex-end;
}

.chat-input-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e8e4db;
  background: #faf9f7;
}
.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e8e4db;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  background: #fff;
  color: #1a1a1c;
}
.chat-input:focus { outline: none; border-color: #8b7355; }
.send-btn {
  padding: 10px;
  background: #8b7355;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.send-btn:hover:not(:disabled) { background: #7a6348; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
