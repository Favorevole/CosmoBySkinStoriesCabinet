<template>
  <div class="page">
    <div class="page-header">
      <h1>Программы ухода</h1>
      <button @click="openCreate" class="btn btn-primary">+ Создать</button>
    </div>

    <div v-if="successMsg" class="toast">{{ successMsg }}</div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty">Нет программ. Создайте первую!</div>
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="item-card">
        <div class="item-header">
          <strong>{{ item.title }}</strong>
        </div>
        <p v-if="item.description" class="item-desc">{{ item.description }}</p>
        <div v-if="item.steps?.length" class="steps">
          <div v-for="(step, i) in item.steps" :key="i" class="step">
            <span class="step-time">{{ step.time || `Шаг ${i + 1}` }}</span>
            <span v-if="step.instructions" class="step-text">{{ step.instructions }}</span>
          </div>
        </div>
        <div class="item-actions">
          <button @click="openEdit(item)" class="btn-link">Редактировать</button>
          <button @click="remove(item.id)" class="btn-link danger">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>{{ editing ? 'Редактировать программу' : 'Новая программа' }}</h3>
        <div class="field">
          <label>Название *</label>
          <input type="text" v-model="form.title" placeholder="Название программы">
        </div>
        <div class="field">
          <label>Описание</label>
          <textarea v-model="form.description" rows="3" placeholder="Описание программы..."></textarea>
        </div>

        <h4>Шаги программы</h4>
        <div v-for="(step, i) in form.steps" :key="i" class="step-edit">
          <div class="step-edit-row">
            <input type="text" v-model="step.time" placeholder="Время (утро, вечер...)" class="step-input">
            <button @click="form.steps.splice(i, 1)" class="btn-icon">&times;</button>
          </div>
          <textarea v-model="step.instructions" rows="2" placeholder="Инструкции..."></textarea>
          <input type="text" v-model="step.productsStr" placeholder="Продукты (через запятую)" @blur="parseProducts(step)">
        </div>
        <button @click="addStep" class="btn btn-sm btn-secondary" style="margin-bottom:16px;">+ Добавить шаг</button>

        <div class="modal-actions">
          <button @click="showModal = false" class="btn btn-secondary">Отмена</button>
          <button @click="save" :disabled="!form.title || saving" class="btn btn-primary">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../../api/doctorCabinet.js';

const items = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editing = ref(null);
const saving = ref(false);
const form = ref({ title: '', description: '', steps: [] });
const successMsg = ref(null);

function showSuccess(msg) {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 3000);
}

onMounted(loadItems);

async function loadItems() {
  loading.value = true;
  try {
    const res = await getPrograms();
    items.value = res.data.programs || [];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = { title: '', description: '', steps: [{ time: 'Утро', instructions: '', products: [], productsStr: '' }] };
  showModal.value = true;
}

function openEdit(item) {
  editing.value = item.id;
  const steps = (item.steps || []).map(s => ({
    ...s,
    productsStr: (s.products || []).join(', ')
  }));
  form.value = { title: item.title, description: item.description || '', steps };
  showModal.value = true;
}

function addStep() {
  form.value.steps.push({ time: '', instructions: '', products: [], productsStr: '' });
}

function parseProducts(step) {
  step.products = step.productsStr.split(',').map(p => p.trim()).filter(Boolean);
}

async function save() {
  saving.value = true;
  try {
    const data = {
      title: form.value.title,
      description: form.value.description,
      steps: form.value.steps.map(s => {
        parseProducts(s);
        return { time: s.time, instructions: s.instructions, products: s.products };
      })
    };
    if (editing.value) {
      await updateProgram(editing.value, data);
    } else {
      await createProgram(data);
    }
    showModal.value = false;
    await loadItems();
    showSuccess(editing.value ? 'Программа обновлена' : 'Программа создана');
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка');
  } finally {
    saving.value = false;
  }
}

async function remove(id) {
  if (!confirm('Удалить программу?')) return;
  try {
    await deleteProgram(id);
    await loadItems();
    showSuccess('Программа удалена');
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка');
  }
}
</script>

<style scoped>
.page { padding: 32px; max-width: 800px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin: 0; }
h3 { font-size: 18px; color: #1a1a1c; margin-bottom: 20px; }
h4 { font-size: 14px; color: #1a1a1c; margin: 16px 0 8px; }
.loading, .empty { text-align: center; padding: 48px; color: #999; font-size: 14px; }

.list { display: flex; flex-direction: column; gap: 12px; }
.item-card { background: #fff; border: 1px solid #e8e4db; border-radius: 12px; padding: 18px 20px; }
.item-header { margin-bottom: 8px; }
.item-header strong { font-size: 15px; color: #1a1a1c; }
.item-desc { font-size: 13px; color: #666; margin-bottom: 8px; }
.steps { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.step { display: flex; gap: 8px; align-items: baseline; font-size: 13px; }
.step-time { font-weight: 600; color: #8b7355; min-width: 60px; }
.step-text { color: #666; }
.item-actions { margin-top: 12px; display: flex; gap: 16px; }
.btn-link { background: none; border: none; color: #8b7355; font-size: 13px; cursor: pointer; padding: 0; font-family: inherit; }
.btn-link:hover { text-decoration: underline; }
.btn-link.danger { color: #dc2626; }

.btn { padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 10px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; }
.btn-primary { background: #8b7355; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #7a6348; }
.btn-secondary { background: transparent; color: #666; border: 1px solid #e8e4db; }
.btn-sm { padding: 6px 14px; font-size: 12px; }
.btn:disabled { opacity: 0.5; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 540px; max-height: 85vh; overflow-y: auto; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 500; color: #666; margin-bottom: 6px; }
.field input, .field textarea { width: 100%; padding: 12px 14px; border: 1px solid #e8e4db; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif; color: #1a1a1c; background: #faf9f7; box-sizing: border-box; }
.field textarea { resize: vertical; line-height: 1.6; }
.field input:focus, .field textarea:focus { outline: none; border-color: #8b7355; }

.step-edit { margin-bottom: 12px; padding: 12px; border: 1px solid #e8e4db; border-radius: 8px; }
.step-edit-row { display: flex; gap: 8px; margin-bottom: 8px; }
.step-input { flex: 1; padding: 8px 12px; border: 1px solid #e8e4db; border-radius: 6px; font-size: 13px; font-family: 'Inter', sans-serif; }
.step-edit textarea { width: 100%; padding: 8px 12px; border: 1px solid #e8e4db; border-radius: 6px; font-size: 13px; font-family: 'Inter', sans-serif; resize: vertical; margin-bottom: 8px; box-sizing: border-box; }
.step-edit input { width: 100%; padding: 8px 12px; border: 1px solid #e8e4db; border-radius: 6px; font-size: 13px; font-family: 'Inter', sans-serif; box-sizing: border-box; }
.btn-icon { width: 28px; height: 28px; border: 1px solid #e8e4db; border-radius: 6px; background: #fff; cursor: pointer; font-size: 18px; color: #999; display: flex; align-items: center; justify-content: center; }

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

.toast {
  padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
  border-radius: 10px; font-size: 14px; margin-bottom: 16px;
}

@media (max-width: 640px) { .page { padding: 20px 16px; } }
</style>
