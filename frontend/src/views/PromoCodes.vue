<template>
  <div class="promo-page">
    <header class="page-header">
      <div class="header-left">
        <h1>Промокоды</h1>
        <p class="subtitle">Управление скидочными промокодами</p>
      </div>
    </header>

    <!-- Create Form -->
    <div class="create-form">
      <h3>Новый промокод</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Код</label>
          <input
            v-model="newCode.code"
            type="text"
            placeholder="СКИДКА50"
            class="form-input"
            @input="newCode.code = newCode.code.toUpperCase()"
          />
        </div>
        <div class="form-group">
          <label>Скидка %</label>
          <input
            v-model.number="newCode.discount"
            type="number"
            min="1"
            max="100"
            placeholder="50"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Макс. использований</label>
          <input
            v-model.number="newCode.maxUses"
            type="number"
            min="1"
            placeholder="Без лимита"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Срок действия</label>
          <input
            v-model="newCode.expiresAt"
            type="date"
            class="form-input"
          />
        </div>
        <div class="form-group form-action">
          <button @click="createCode" :disabled="creating" class="btn btn-primary">
            {{ creating ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </div>
      <div v-if="createError" class="error-text">{{ createError }}</div>
    </div>

    <!-- Promo Codes List -->
    <div class="codes-list" v-if="!loading">
      <div
        v-for="code in promoCodes"
        :key="code.id"
        class="code-card"
        :class="{ inactive: !code.isActive }"
      >
        <div class="code-header">
          <div class="code-badge">{{ code.code }}</div>
          <span class="discount-badge">-{{ code.discount }}%</span>
          <span :class="['status', code.isActive ? 'status-active' : 'status-inactive']">
            {{ code.isActive ? 'Активен' : 'Неактивен' }}
          </span>
        </div>

        <div class="code-meta">
          <span>Использован: {{ code.usedCount }}{{ code.maxUses ? ` / ${code.maxUses}` : '' }}</span>
          <span v-if="code.expiresAt">
            До {{ formatDate(code.expiresAt) }}
            <span v-if="isExpired(code.expiresAt)" class="expired-tag">Истёк</span>
          </span>
          <span>Создан: {{ formatDate(code.createdAt) }}</span>
        </div>

        <div class="code-actions">
          <button
            @click="toggleActive(code)"
            class="btn btn-sm"
            :class="code.isActive ? 'btn-secondary' : 'btn-success'"
          >
            {{ code.isActive ? 'Деактивировать' : 'Активировать' }}
          </button>
          <button @click="removeCode(code)" class="btn btn-danger btn-sm">
            Удалить
          </button>
        </div>
      </div>

      <div v-if="promoCodes.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <h3>Нет промокодов</h3>
        <p>Создайте первый промокод выше</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPromoCodes, createPromoCodeApi, updatePromoCodeApi, deletePromoCodeApi } from '../api/index.js';

const promoCodes = ref([]);
const loading = ref(true);
const creating = ref(false);
const createError = ref('');

const newCode = ref({
  code: '',
  discount: null,
  maxUses: null,
  expiresAt: ''
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isExpired(dateStr) {
  return new Date(dateStr) < new Date();
}

async function loadCodes() {
  try {
    const response = await getPromoCodes();
    promoCodes.value = response.data;
  } catch (error) {
    console.error('Failed to load promo codes:', error);
  } finally {
    loading.value = false;
  }
}

async function createCode() {
  createError.value = '';

  if (!newCode.value.code.trim()) {
    createError.value = 'Введите код';
    return;
  }
  if (!newCode.value.discount || newCode.value.discount < 1 || newCode.value.discount > 100) {
    createError.value = 'Скидка должна быть от 1 до 100%';
    return;
  }

  creating.value = true;
  try {
    await createPromoCodeApi({
      code: newCode.value.code.trim(),
      discount: newCode.value.discount,
      maxUses: newCode.value.maxUses || null,
      expiresAt: newCode.value.expiresAt || null
    });
    newCode.value = { code: '', discount: null, maxUses: null, expiresAt: '' };
    await loadCodes();
  } catch (error) {
    createError.value = error.response?.data?.error || 'Ошибка создания';
  } finally {
    creating.value = false;
  }
}

async function toggleActive(code) {
  try {
    await updatePromoCodeApi(code.id, { isActive: !code.isActive });
    code.isActive = !code.isActive;
  } catch (error) {
    console.error('Failed to update promo code:', error);
  }
}

async function removeCode(code) {
  if (!confirm(`Удалить промокод ${code.code}?`)) return;
  try {
    await deletePromoCodeApi(code.id);
    promoCodes.value = promoCodes.value.filter(c => c.id !== code.id);
  } catch (error) {
    console.error('Failed to delete promo code:', error);
  }
}

onMounted(loadCodes);
</script>

<style scoped>
.promo-page {
  padding: 0;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-top: 4px;
}

.create-form {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border: 1px solid rgba(201, 169, 98, 0.15);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.create-form h3 {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 16px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 120px;
}

.form-group label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  color: #FFFFFF;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: #C9A962;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-action {
  flex: 0 0 auto;
  min-width: auto;
}

.error-text {
  color: #EF4444;
  font-size: 13px;
  margin-top: 8px;
}

.codes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.code-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
}

.code-card.inactive {
  opacity: 0.6;
}

.code-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.code-badge {
  font-size: 18px;
  font-weight: 700;
  color: #C9A962;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.05em;
}

.discount-badge {
  padding: 4px 10px;
  background: rgba(201, 169, 98, 0.15);
  color: #C9A962;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
}

.status {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.status-inactive {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.code-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.expired-tag {
  color: #EF4444;
  font-weight: 600;
  margin-left: 4px;
}

.code-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #C9A962 0%, #D4B978 100%);
  color: #1A1A1C;
  padding: 10px 20px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(201, 169, 98, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.btn-success:hover {
  background: rgba(16, 185, 129, 0.25);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 14px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: rgba(255, 255, 255, 0.5);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(201, 169, 98, 0.3);
  border-top-color: #C9A962;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: 100%;
  }

  .code-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
