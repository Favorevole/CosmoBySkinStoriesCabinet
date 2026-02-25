<template>
  <div class="modern-page">
    <div class="page-header">
      <div class="header-content">
        <h1>💆 Процедуры</h1>
        <p class="subtitle">Трекер процедур и ухода</p>
      </div>
      <button @click="openCreate" class="btn-add">+ Добавить</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner">⏳</div>
      <p>Загружаем процедуры...</p>
    </div>
    <div v-else-if="procedures.length === 0" class="empty-state">
      <div class="empty-illustration">
        <div class="empty-circle">
          <span class="empty-icon">💆</span>
        </div>
      </div>
      <h3>Начните отслеживать процедуры</h3>
      <p>Добавляйте процедуры чтобы<br>контролировать свой уход за кожей</p>
      <button @click="openCreate" class="cta-button">
        <span>✨ Добавить процедуру</span>
      </button>
    </div>
    <div v-else class="procedures-list">
      <div
        v-for="procedure in procedures"
        :key="procedure.id"
        class="procedure-card"
        :class="'status-' + procedure.status"
      >
        <div class="card-header">
          <div class="type-badge" :class="'type-' + procedure.type">
            {{ getTypeText(procedure.type) }}
          </div>
          <span class="status-badge">
            {{ getStatusText(procedure.status) }}
          </span>
        </div>

        <h3>{{ procedure.name }}</h3>
        <p v-if="procedure.description" class="description">{{ procedure.description }}</p>

        <div class="card-info">
          <div class="info-item">
            📅 {{ formatDate(procedure.scheduledAt) }}
          </div>
          <div v-if="procedure.completedAt" class="info-item">
            ✅ Выполнено: {{ formatDate(procedure.completedAt) }}
          </div>
        </div>

        <div class="card-actions">
          <button
            v-if="procedure.status === 'SCHEDULED'"
            @click="completeProcedure(procedure.id)"
            class="btn-link success"
          >
            Отметить выполненной
          </button>
          <button @click="openEdit(procedure)" class="btn-link">Редактировать</button>
          <button @click="deleteProcedure(procedure.id)" class="btn-link danger">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>{{ editing ? 'Редактировать процедуру' : 'Новая процедура' }}</h3>

        <div class="field">
          <label>Тип *</label>
          <select v-model="form.type" required>
            <option value="HOME_CARE">Домашний уход</option>
            <option value="SALON">Салонная процедура</option>
            <option value="MEDICAL">Медицинская процедура</option>
          </select>
        </div>

        <div class="field">
          <label>Название *</label>
          <input type="text" v-model="form.name" placeholder="Название процедуры" required>
        </div>

        <div class="field">
          <label>Описание</label>
          <textarea v-model="form.description" rows="3" placeholder="Детали процедуры..."></textarea>
        </div>

        <div class="field">
          <label>Дата и время *</label>
          <input type="datetime-local" v-model="form.scheduledAt" required>
        </div>

        <div class="field">
          <label>Заметки</label>
          <textarea v-model="form.notes" rows="2" placeholder="Дополнительные заметки..."></textarea>
        </div>

        <div class="modal-actions">
          <button @click="showModal = false" class="btn btn-secondary">Отмена</button>
          <button @click="save" :disabled="!form.name || !form.type || !form.scheduledAt || saving" class="btn btn-primary">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(true);
const procedures = ref([]);
const showModal = ref(false);
const editing = ref(null);
const saving = ref(false);
const form = ref({
  type: 'HOME_CARE',
  name: '',
  description: '',
  scheduledAt: '',
  notes: ''
});

onMounted(loadProcedures);

async function loadProcedures() {
  loading.value = true;
  try {
    const token = localStorage.getItem('clientToken');
    const response = await axios.get('/api/client/procedures', {
      headers: { Authorization: `Bearer ${token}` }
    });
    procedures.value = response.data.procedures;
  } catch (error) {
    console.error('Procedures load error:', error);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = {
    type: 'HOME_CARE',
    name: '',
    description: '',
    scheduledAt: '',
    notes: ''
  };
  showModal.value = true;
}

function openEdit(procedure) {
  editing.value = procedure.id;
  form.value = {
    type: procedure.type,
    name: procedure.name,
    description: procedure.description || '',
    scheduledAt: procedure.scheduledAt ? new Date(procedure.scheduledAt).toISOString().slice(0, 16) : '',
    notes: procedure.notes || ''
  };
  showModal.value = true;
}

async function save() {
  saving.value = true;
  try {
    const token = localStorage.getItem('clientToken');
    if (editing.value) {
      await axios.patch(`/api/client/procedures/${editing.value}`, form.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await axios.post('/api/client/procedures', form.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    showModal.value = false;
    await loadProcedures();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения');
  } finally {
    saving.value = false;
  }
}

async function completeProcedure(id) {
  try {
    const token = localStorage.getItem('clientToken');
    await axios.post(`/api/client/procedures/${id}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await loadProcedures();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка');
  }
}

async function deleteProcedure(id) {
  if (!confirm('Удалить процедуру?')) return;
  try {
    const token = localStorage.getItem('clientToken');
    await axios.delete(`/api/client/procedures/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await loadProcedures();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка удаления');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getTypeText(type) {
  const typeMap = {
    'HOME_CARE': 'Дом',
    'SALON': 'Салон',
    'MEDICAL': 'Медицина'
  };
  return typeMap[type] || type;
}

function getStatusText(status) {
  const statusMap = {
    'SCHEDULED': 'Запланировано',
    'COMPLETED': 'Выполнено',
    'SKIPPED': 'Пропущено',
    'CANCELLED': 'Отменено'
  };
  return statusMap[status] || status;
}
</script>

<style scoped>
.modern-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 16px;
}

.header-content h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  color: #3a2a1f;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.subtitle {
  font-size: 15px;
  color: #a89079;
  margin: 0;
}

h3 {
  font-size: 18px;
  color: #3a2a1f;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: #a89079;
}

.loading-spinner {
  font-size: 56px;
  margin-bottom: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading p {
  font-size: 16px;
  margin: 0;
  color: #8b7355;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-illustration {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.empty-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d5c4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 56px;
}

.empty-state h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  color: #3a2a1f;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.empty-state p {
  font-size: 15px;
  color: #999;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.btn-add {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(107, 78, 61, 0.25);
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.3);
}

.cta-button {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(107, 78, 61, 0.25);
  transition: all 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1px solid #e8e4db;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.procedures-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.procedure-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  border-left: 4px solid #e8d5c4;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.procedure-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.procedure-card.status-COMPLETED {
  border-left-color: #16a34a;
}

.procedure-card.status-SCHEDULED {
  border-left-color: #8b7355;
}

.procedure-card.status-SKIPPED,
.procedure-card.status-CANCELLED {
  border-left-color: #999;
  opacity: 0.7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.type-HOME_CARE {
  background: #e0e7ff;
  color: #4f46e5;
}

.type-SALON {
  background: #fef3c7;
  color: #d97706;
}

.type-MEDICAL {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: #f5f5f5;
  color: #666;
}

.description {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 12px 0;
}

.info-item {
  font-size: 13px;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e4db;
}

.btn-link {
  background: none;
  border: none;
  color: #8b7355;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  font-weight: 500;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-link.success {
  color: #16a34a;
}

.btn-link.danger {
  color: #dc2626;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #1a1a1c;
  background: #faf9f7;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  outline: none;
  border-color: #8b7355;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .card-actions {
    flex-wrap: wrap;
  }
}
</style>
