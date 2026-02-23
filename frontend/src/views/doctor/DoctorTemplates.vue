<template>
  <div class="page">
    <div class="page-header">
      <h1>Шаблоны рекомендаций</h1>
      <button @click="openCreate" class="btn btn-primary">+ Создать</button>
    </div>

    <div v-if="successMsg" class="toast">{{ successMsg }}</div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty">Нет шаблонов. Создайте первый!</div>
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="item-card">
        <div class="item-header">
          <strong>{{ item.title }}</strong>
          <span v-if="item.category" class="tag">{{ item.category }}</span>
        </div>
        <p class="item-text">{{ truncate(item.text, 200) }}</p>
        <div class="item-actions">
          <button @click="openEdit(item)" class="btn-link">Редактировать</button>
          <button @click="remove(item.id)" class="btn-link danger">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>{{ editing ? 'Редактировать шаблон' : 'Новый шаблон' }}</h3>
        <div class="field">
          <label>Название *</label>
          <input type="text" v-model="form.title" placeholder="Название шаблона" maxlength="200">
        </div>
        <div class="field">
          <label>Категория</label>
          <input type="text" v-model="form.category" placeholder="Например: Акне, Увлажнение">
        </div>
        <div class="field">
          <label>Текст *</label>
          <textarea v-model="form.text" rows="10" placeholder="Текст рекомендации..." maxlength="10000"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="showModal = false" class="btn btn-secondary">Отмена</button>
          <button @click="save" :disabled="!form.title || !form.text || saving" class="btn btn-primary">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../api/doctorCabinet.js';

const items = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editing = ref(null);
const saving = ref(false);
const form = ref({ title: '', text: '', category: '' });
const successMsg = ref(null);

function showSuccess(msg) {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 3000);
}

onMounted(loadItems);

async function loadItems() {
  loading.value = true;
  try {
    const res = await getTemplates();
    items.value = res.data.templates || [];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = { title: '', text: '', category: '' };
  showModal.value = true;
}

function openEdit(item) {
  editing.value = item.id;
  form.value = { title: item.title, text: item.text, category: item.category || '' };
  showModal.value = true;
}

async function save() {
  saving.value = true;
  try {
    if (editing.value) {
      await updateTemplate(editing.value, form.value);
    } else {
      await createTemplate(form.value);
    }
    showModal.value = false;
    await loadItems();
    showSuccess(editing.value ? 'Шаблон обновлён' : 'Шаблон создан');
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка');
  } finally {
    saving.value = false;
  }
}

async function remove(id) {
  if (!confirm('Удалить шаблон?')) return;
  try {
    await deleteTemplate(id);
    await loadItems();
    showSuccess('Шаблон удалён');
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка');
  }
}

function truncate(s, len) {
  if (!s) return '';
  return s.length > len ? s.substring(0, len) + '...' : s;
}
</script>

<style scoped>
.page { padding: 32px; max-width: 800px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin: 0; }
h3 { font-size: 18px; color: #1a1a1c; margin-bottom: 20px; }
.loading, .empty { text-align: center; padding: 48px; color: #999; font-size: 14px; }

.list { display: flex; flex-direction: column; gap: 12px; }
.item-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 18px 20px;
}
.item-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.item-header strong { font-size: 15px; color: #1a1a1c; }
.tag { font-size: 11px; background: #f0e6d3; color: #8b7355; padding: 2px 8px; border-radius: 4px; }
.item-text { font-size: 13px; color: #666; line-height: 1.5; white-space: pre-wrap; }
.item-actions { margin-top: 12px; display: flex; gap: 16px; }
.btn-link { background: none; border: none; color: #8b7355; font-size: 13px; cursor: pointer; padding: 0; font-family: inherit; }
.btn-link:hover { text-decoration: underline; }
.btn-link.danger { color: #dc2626; }

.btn {
  padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 10px; border: none;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
}
.btn-primary { background: #8b7355; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #7a6348; }
.btn-secondary { background: transparent; color: #666; border: 1px solid #e8e4db; }
.btn:disabled { opacity: 0.5; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.modal {
  background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 540px; max-height: 85vh; overflow-y: auto;
}
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 500; color: #666; margin-bottom: 6px; }
.field input, .field textarea {
  width: 100%; padding: 12px 14px; border: 1px solid #e8e4db; border-radius: 8px;
  font-size: 14px; font-family: 'Inter', sans-serif; color: #1a1a1c; background: #faf9f7; box-sizing: border-box;
}
.field textarea { resize: vertical; line-height: 1.6; }
.field input:focus, .field textarea:focus { outline: none; border-color: #8b7355; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

.toast {
  padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
  border-radius: 10px; font-size: 14px; margin-bottom: 16px;
}

@media (max-width: 640px) { .page { padding: 20px 16px; } }
</style>
