<template>
  <div class="page">
    <router-link to="/doctor/applications" class="back-link">&larr; Назад к заявкам</router-link>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="!app" class="empty">Заявка не найдена</div>
    <template v-else>
      <div class="header">
        <h1>Заявка #{{ app.id }}</h1>
        <span :class="['status-badge', `status-${app.status.toLowerCase()}`]">{{ statusLabel(app.status) }}</span>
      </div>

      <div class="grid">
        <!-- Left: Questionnaire -->
        <div class="card">
          <h2>Анкета</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Клиент</span>
              <span class="info-value">{{ app.client?.fullName || 'Не указано' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Возраст</span>
              <span class="info-value">{{ app.age }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Тип кожи</span>
              <span class="info-value">{{ skinTypeLabel(app.skinType) }}</span>
            </div>
            <div class="info-item" v-if="app.consultationGoal">
              <span class="info-label">Цель консультации</span>
              <span class="info-value">{{ goalLabel(app.consultationGoal) }}</span>
            </div>
            <div class="info-item" v-if="app.priceRange">
              <span class="info-label">Бюджет</span>
              <span class="info-value">{{ priceLabel(app.priceRange) }}</span>
            </div>
          </div>
          <div class="info-block">
            <span class="info-label">Основные проблемы</span>
            <p class="info-text">{{ app.mainProblems }}</p>
          </div>
          <div class="info-block" v-if="app.additionalComment">
            <span class="info-label">Комментарий</span>
            <p class="info-text">{{ app.additionalComment }}</p>
          </div>
          <div class="info-block" v-if="app.additionalProducts">
            <span class="info-label">Дополнительные средства</span>
            <p class="info-text">{{ app.additionalProducts }}</p>
          </div>
        </div>

        <!-- Right: Photos -->
        <div class="card">
          <h2>Фото ({{ app.photos?.length || 0 }})</h2>
          <div v-if="!app.photos?.length" class="empty-sm">Нет фото</div>
          <div v-else class="photo-gallery">
            <div v-for="photo in app.photos" :key="photo.id" class="photo-thumb" @click="openPhoto(photo)">
              <img :src="getPhotoUrl(photo.id)" :alt="photo.fileName" loading="lazy">
            </div>
          </div>
          <button v-if="app.status === 'ASSIGNED'" @click="showRequestPhotos = true" class="btn btn-sm btn-secondary" style="margin-top:12px;">
            Запросить доп. фото
          </button>
        </div>
      </div>

      <!-- Existing recommendation -->
      <div v-if="app.recommendation" class="card" style="margin-top:20px;">
        <h2>Ваша рекомендация</h2>
        <div v-if="app.recommendation.editedByAdminAt" class="admin-edit-notice">
          <span class="notice-icon">i</span>
          <div>
            <span>Администратор отредактировал рекомендацию {{ formatDate(app.recommendation.editedByAdminAt) }}</span>
            <button v-if="app.recommendation.originalText" @click="showOriginalText = !showOriginalText" class="notice-toggle">
              {{ showOriginalText ? 'Скрыть оригинал' : 'Показать оригинал' }}
            </button>
          </div>
        </div>
        <div v-if="showOriginalText && app.recommendation.originalText" class="original-text-box">
          <span class="info-label">Ваш оригинальный текст:</span>
          <pre class="rec-text original">{{ app.recommendation.originalText }}</pre>
        </div>
        <pre class="rec-text">{{ app.recommendation.text }}</pre>
        <div v-if="app.recommendation.links?.length" class="rec-links">
          <a v-for="link in app.recommendation.links" :key="link.url" :href="link.url" target="_blank">{{ link.title || link.url }}</a>
        </div>
      </div>

      <!-- Recommendation editor (only for ASSIGNED) -->
      <div v-if="app.status === 'ASSIGNED'" class="card editor-card" style="margin-top:20px;">
        <h2>Написать рекомендацию</h2>
        <div v-if="draftRestoredMsg" class="draft-notice">{{ draftRestoredMsg }}</div>

        <div class="editor-toolbar">
          <button @click="showTemplateModal = true" class="tool-btn">Вставить шаблон</button>
          <button @click="showProductModal = true" class="tool-btn">Вставить продукт</button>
          <button @click="showProgramModal = true" class="tool-btn">Прикрепить программу</button>
          <button @click="generateAi" :disabled="aiLoading" class="tool-btn tool-ai">
            {{ aiLoading ? 'AI генерирует...' : 'AI-помощник' }}
          </button>
          <button v-if="aiHistory.length > 0" @click="showRefineInput = !showRefineInput" :disabled="aiLoading" class="tool-btn tool-ai">
            Уточнить AI
          </button>
        </div>

        <div v-if="showRefineInput" class="refine-box">
          <input
            v-model="refineInstruction"
            @keydown.enter="refineAi"
            placeholder="Что изменить? (напр. 'добавь бюджетные аналоги', 'сделай короче')"
            class="refine-input"
          >
          <button @click="refineAi" :disabled="aiLoading || !refineInstruction.trim()" class="btn btn-sm btn-primary">
            {{ aiLoading ? 'Уточняю...' : 'Отправить' }}
          </button>
        </div>

        <textarea
          v-model="recText"
          placeholder="Напишите рекомендацию для клиента (минимум 50 символов)..."
          rows="12"
          class="rec-textarea"
        ></textarea>

        <div class="char-count" :class="{ insufficient: recText.length < 50 }">
          {{ recText.length }} / мин. 50
        </div>

        <!-- Preview -->
        <div v-if="showPreview" class="preview">
          <h3>Предпросмотр</h3>
          <pre class="rec-text">{{ recText }}</pre>
        </div>

        <div class="editor-actions">
          <button @click="showPreview = !showPreview" class="btn btn-secondary">
            {{ showPreview ? 'Скрыть предпросмотр' : 'Предпросмотр' }}
          </button>
          <button @click="submitRec" :disabled="recText.length < 50 || submitting" class="btn btn-primary">
            {{ submitting ? 'Отправка...' : 'Отправить рекомендацию' }}
          </button>
        </div>

        <div class="editor-actions" style="margin-top:8px;">
          <button @click="showDeclineModal = true" class="btn btn-danger">Отклонить заявку</button>
        </div>
      </div>

      <!-- Template modal -->
      <div v-if="showTemplateModal" class="modal-overlay" @click.self="showTemplateModal = false">
        <div class="modal">
          <h3>Выберите шаблон</h3>
          <div v-if="templates.length === 0" class="empty-sm">Нет шаблонов. Создайте их в разделе "Шаблоны".</div>
          <div v-else class="modal-list">
            <div v-for="t in templates" :key="t.id" class="modal-item" @click="insertTemplate(t)">
              <strong>{{ t.title }}</strong>
              <span v-if="t.category" class="modal-tag">{{ t.category }}</span>
              <p>{{ truncate(t.text, 80) }}</p>
            </div>
          </div>
          <button @click="showTemplateModal = false" class="btn btn-secondary" style="margin-top:12px;">Закрыть</button>
        </div>
      </div>

      <!-- Product modal -->
      <div v-if="showProductModal" class="modal-overlay" @click.self="showProductModal = false">
        <div class="modal">
          <h3>Выберите продукт</h3>
          <div v-if="products.length === 0" class="empty-sm">Нет продуктов. Добавьте их в разделе "Продукты".</div>
          <div v-else class="modal-list">
            <div v-for="p in products" :key="p.id" class="modal-item" @click="insertProduct(p)">
              <strong>{{ p.name }}</strong>
              <span v-if="p.brand" class="modal-tag">{{ p.brand }}</span>
              <span v-if="p.category" class="modal-tag">{{ p.category }}</span>
            </div>
          </div>
          <button @click="showProductModal = false" class="btn btn-secondary" style="margin-top:12px;">Закрыть</button>
        </div>
      </div>

      <!-- Program modal -->
      <div v-if="showProgramModal" class="modal-overlay" @click.self="showProgramModal = false">
        <div class="modal">
          <h3>Выберите программу ухода</h3>
          <div v-if="programs.length === 0" class="empty-sm">Нет программ. Создайте их в разделе "Программы".</div>
          <div v-else class="modal-list">
            <div v-for="pr in programs" :key="pr.id" class="modal-item" @click="insertProgram(pr)">
              <strong>{{ pr.title }}</strong>
              <p v-if="pr.description">{{ truncate(pr.description, 80) }}</p>
            </div>
          </div>
          <button @click="showProgramModal = false" class="btn btn-secondary" style="margin-top:12px;">Закрыть</button>
        </div>
      </div>

      <!-- Decline modal -->
      <div v-if="showDeclineModal" class="modal-overlay" @click.self="showDeclineModal = false">
        <div class="modal">
          <h3>Отклонить заявку</h3>
          <textarea v-model="declineReason" placeholder="Причина отклонения..." rows="4" maxlength="1000" class="rec-textarea"></textarea>
          <div class="editor-actions" style="margin-top:12px;">
            <button @click="showDeclineModal = false" class="btn btn-secondary">Отмена</button>
            <button @click="submitDecline" :disabled="submitting" class="btn btn-danger">Отклонить</button>
          </div>
        </div>
      </div>

      <!-- Request photos modal -->
      <div v-if="showRequestPhotos" class="modal-overlay" @click.self="showRequestPhotos = false">
        <div class="modal">
          <h3>Запросить фото</h3>
          <textarea v-model="photoRequestMessage" placeholder="Сообщение клиенту (необязательно)..." rows="3" maxlength="500" class="rec-textarea"></textarea>
          <div class="editor-actions" style="margin-top:12px;">
            <button @click="showRequestPhotos = false" class="btn btn-secondary">Отмена</button>
            <button @click="submitRequestPhotos" :disabled="submitting" class="btn btn-primary">Отправить</button>
          </div>
        </div>
      </div>

      <!-- Photo lightbox -->
      <div v-if="lightboxPhoto" class="modal-overlay lightbox" @click.self="lightboxPhoto = null">
        <img :src="getPhotoUrl(lightboxPhoto.id)" :alt="lightboxPhoto.fileName">
        <button class="lightbox-close" @click="lightboxPhoto = null">&times;</button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="successMsg" class="success">{{ successMsg }}</div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getDoctorApplication, getDoctorPhotoUrl, submitRecommendation,
  declineApplication, requestPhotos, aiGenerate, aiRefine,
  getTemplates, getProductsList, getPrograms
} from '../../api/doctorCabinet.js';

const route = useRoute();
const router = useRouter();

const app = ref(null);
const loading = ref(true);
const error = ref(null);
const successMsg = ref(null);

function showSuccess(msg) {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 5000);
}
const submitting = ref(false);
const aiLoading = ref(false);

// Editor state
const recText = ref('');
const showPreview = ref(false);
const showDeclineModal = ref(false);
const declineReason = ref('');
const showRequestPhotos = ref(false);
const photoRequestMessage = ref('');

// Modals
const showTemplateModal = ref(false);
const showProductModal = ref(false);
const showProgramModal = ref(false);
const templates = ref([]);
const products = ref([]);
const programs = ref([]);

// AI refine
const aiHistory = ref([]);
const showRefineInput = ref(false);
const refineInstruction = ref('');

// Photo lightbox
const lightboxPhoto = ref(null);

// Admin edit notice
const showOriginalText = ref(false);

// Draft auto-save
const draftRestoredMsg = ref(null);
let draftSaveTimer = null;

function getDraftKey(appId) {
  return `doctor_rec_draft_${appId}`;
}

function saveDraft() {
  if (!app.value || !recText.value) return;
  sessionStorage.setItem(getDraftKey(app.value.id), recText.value);
}

function clearDraft() {
  if (!app.value) return;
  sessionStorage.removeItem(getDraftKey(app.value.id));
}

watch(recText, (val) => {
  clearTimeout(draftSaveTimer);
  if (val && app.value?.status === 'ASSIGNED') {
    draftSaveTimer = setTimeout(saveDraft, 1000);
  } else if (!val) {
    clearDraft();
  }
});

onMounted(async () => {
  try {
    const id = parseInt(route.params.id);
    const res = await getDoctorApplication(id);
    app.value = res.data;

    // Restore draft if application is still ASSIGNED and no recommendation yet
    if (res.data.status === 'ASSIGNED' && !res.data.recommendation) {
      const draft = sessionStorage.getItem(getDraftKey(id));
      if (draft) {
        recText.value = draft;
        draftRestoredMsg.value = 'Черновик восстановлен';
        setTimeout(() => { draftRestoredMsg.value = null; }, 4000);
      }
    } else {
      // Clean up stale draft
      sessionStorage.removeItem(getDraftKey(id));
    }
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }

  // Load tools data
  try {
    const [tRes, pRes, prRes] = await Promise.all([
      getTemplates(),
      getProductsList(),
      getPrograms()
    ]);
    templates.value = tRes.data.templates || [];
    products.value = pRes.data.products || [];
    programs.value = prRes.data.programs || [];
  } catch (e) {
    // Non-critical
  }
});

function getPhotoUrl(photoId) {
  return getDoctorPhotoUrl(app.value.id, photoId);
}

function openPhoto(photo) {
  lightboxPhoto.value = photo;
}

function insertTemplate(t) {
  recText.value += (recText.value ? '\n\n' : '') + t.text;
  showTemplateModal.value = false;
}

function insertProduct(p) {
  const text = p.url ? `${p.brand ? p.brand + ' ' : ''}${p.name} [${p.url}]` : `${p.brand ? p.brand + ' ' : ''}${p.name}`;
  recText.value += (recText.value ? '\n' : '') + text;
  showProductModal.value = false;
}

function insertProgram(pr) {
  let text = `\n\nПрограмма ухода: ${pr.title}\n`;
  if (pr.description) text += `${pr.description}\n`;
  if (Array.isArray(pr.steps)) {
    pr.steps.forEach((step, i) => {
      text += `\n${step.time || `Шаг ${i + 1}`}:\n`;
      if (step.products?.length) text += step.products.map(p => `  - ${p}`).join('\n') + '\n';
      if (step.instructions) text += `  ${step.instructions}\n`;
    });
  }
  recText.value += text;
  showProgramModal.value = false;
}

async function generateAi() {
  aiLoading.value = true;
  error.value = null;
  try {
    const res = await aiGenerate(app.value.id);
    recText.value = res.data.text;
    aiHistory.value = [{ role: 'assistant', content: res.data.text }];
    showRefineInput.value = false;
    refineInstruction.value = '';
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка AI-генерации';
  } finally {
    aiLoading.value = false;
  }
}

async function refineAi() {
  if (!refineInstruction.value.trim() || aiLoading.value) return;
  aiLoading.value = true;
  error.value = null;
  try {
    const instruction = refineInstruction.value.trim();
    const res = await aiRefine(app.value.id, aiHistory.value, instruction);
    recText.value = res.data.text;
    aiHistory.value.push({ role: 'user', content: instruction });
    aiHistory.value.push({ role: 'assistant', content: res.data.text });
    refineInstruction.value = '';
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка AI-уточнения';
  } finally {
    aiLoading.value = false;
  }
}

async function submitRec() {
  if (recText.value.length < 50) return;
  submitting.value = true;
  error.value = null;
  try {
    await submitRecommendation(app.value.id, recText.value);
    clearDraft();
    showSuccess('Рекомендация отправлена!');
    // Reload application
    const res = await getDoctorApplication(app.value.id);
    app.value = res.data;
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка отправки';
  } finally {
    submitting.value = false;
  }
}

async function submitDecline() {
  submitting.value = true;
  error.value = null;
  try {
    await declineApplication(app.value.id, declineReason.value);
    showDeclineModal.value = false;
    showSuccess('Заявка отклонена');
    const res = await getDoctorApplication(app.value.id);
    app.value = res.data;
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка';
  } finally {
    submitting.value = false;
  }
}

async function submitRequestPhotos() {
  submitting.value = true;
  try {
    await requestPhotos(app.value.id, photoRequestMessage.value);
    showRequestPhotos.value = false;
    photoRequestMessage.value = '';
    showSuccess('Запрос на фото отправлен клиенту');
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка';
  } finally {
    submitting.value = false;
  }
}

function statusLabel(s) {
  const map = { ASSIGNED: 'Назначена', RESPONSE_GIVEN: 'Ответ дан', APPROVED: 'Одобрена', SENT_TO_CLIENT: 'Отправлена', DECLINED: 'Отклонена' };
  return map[s] || s;
}
function skinTypeLabel(t) {
  const map = { DRY: 'Сухая', OILY: 'Жирная', COMBINATION: 'Комбинированная', NORMAL: 'Нормальная' };
  return map[t] || t;
}
function priceLabel(p) {
  const map = { UP_TO_5000: 'до 5 000 руб.', UP_TO_10000: 'до 10 000 руб.', UP_TO_20000: 'до 20 000 руб.', OVER_20000: 'более 20 000 руб.' };
  return map[p] || p;
}
function goalLabel(g) {
  const map = { FULL_CARE: 'Подбор ухода', REVIEW_CARE: 'Разбор текущего ухода', ADDITIONAL_PRODUCTS: 'Нужны дополнительные средства' };
  return map[g] || g;
}
function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}
function truncate(s, len) {
  if (!s) return '';
  return s.length > len ? s.substring(0, len) + '...' : s;
}
</script>

<style scoped>
.page { padding: 32px; max-width: 1000px; }
.back-link { display: inline-block; margin-bottom: 16px; color: #8b7355; text-decoration: none; font-size: 14px; }
.back-link:hover { text-decoration: underline; }
.loading, .empty { text-align: center; padding: 48px; color: #999; }

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin: 0; }
h2 { font-size: 16px; color: #1a1a1c; margin-bottom: 16px; }
h3 { font-size: 16px; color: #1a1a1c; margin-bottom: 12px; }
.status-badge {
  font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 6px;
}
.status-assigned { background: #fef3c7; color: #92400e; }
.status-response_given { background: #dbeafe; color: #1e40af; }
.status-approved { background: #d1fae5; color: #065f46; }
.status-sent_to_client { background: #d1fae5; color: #065f46; }
.status-declined { background: #fee2e2; color: #991b1b; }

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 14px;
  padding: 24px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 12px; color: #999; font-weight: 500; }
.info-value { font-size: 14px; color: #1a1a1c; }
.info-block { margin-bottom: 12px; }
.info-text { font-size: 14px; color: #1a1a1c; line-height: 1.5; margin-top: 4px; white-space: pre-wrap; }

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.photo-thumb {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e8e4db;
}
.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-sm { color: #999; font-size: 13px; padding: 16px 0; }

.rec-text {
  font-size: 14px;
  line-height: 1.6;
  color: #1a1a1c;
  white-space: pre-wrap;
  font-family: inherit;
  background: #faf9f7;
  padding: 16px;
  border-radius: 8px;
}
.rec-links {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.rec-links a {
  font-size: 13px;
  color: #8b7355;
}

/* Editor */
.editor-card { position: relative; }
.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.tool-btn {
  padding: 6px 12px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  color: #666;
  transition: all 0.2s;
}
.tool-btn:hover { border-color: #8b7355; color: #8b7355; }
.tool-btn:disabled { opacity: 0.5; }
.tool-ai { border-color: #d4b978; color: #8b7355; background: #faf6ed; }
.tool-ai:hover { background: #f5edd8; }

.refine-box {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}
.refine-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d4b978;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  background: #faf6ed;
  color: #1a1a1c;
}
.refine-input:focus { outline: none; border-color: #8b7355; }

.rec-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #e8e4db;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  resize: vertical;
  background: #faf9f7;
  color: #1a1a1c;
  box-sizing: border-box;
}
.rec-textarea:focus { outline: none; border-color: #8b7355; }

.char-count { font-size: 12px; color: #999; text-align: right; margin-top: 4px; }
.char-count.insufficient { color: #dc2626; }

.preview {
  margin-top: 16px;
  padding: 16px;
  border: 1px dashed #e8e4db;
  border-radius: 10px;
}

.editor-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.btn-primary { background: #8b7355; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #7a6348; }
.btn-secondary { background: transparent; color: #666; border: 1px solid #e8e4db; }
.btn-danger { background: #dc2626; color: #fff; }
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-sm { padding: 8px 14px; font-size: 12px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
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
  max-height: 80vh;
  overflow-y: auto;
}
.modal-list { display: flex; flex-direction: column; gap: 8px; }
.modal-item {
  padding: 12px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-item:hover { background: #f5f0ea; }
.modal-item strong { font-size: 14px; color: #1a1a1c; }
.modal-item p { font-size: 13px; color: #666; margin-top: 4px; }
.modal-tag {
  display: inline-block;
  font-size: 11px;
  background: #f0e6d3;
  color: #8b7355;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

/* Lightbox */
.lightbox { background: rgba(0,0,0,0.9); }
.lightbox img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
.lightbox-close {
  position: fixed;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 32px;
  cursor: pointer;
}

.error {
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  font-size: 14px;
}
.success {
  margin-top: 16px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  border-radius: 10px;
  font-size: 14px;
}

.admin-edit-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #92400e;
}
.notice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fde68a;
  color: #92400e;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}
.notice-toggle {
  background: none;
  border: none;
  color: #8b7355;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-left: 8px;
  font-family: 'Inter', sans-serif;
}
.original-text-box {
  margin-bottom: 12px;
}
.rec-text.original {
  background: #fefce8;
  border: 1px dashed #fde68a;
}

.draft-notice {
  padding: 8px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .grid { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
  .photo-gallery { grid-template-columns: repeat(2, 1fr); }
  .editor-toolbar { gap: 4px; }
  .tool-btn { font-size: 11px; padding: 5px 8px; }
}
</style>
