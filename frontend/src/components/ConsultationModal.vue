<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <button class="modal-close" @click="close">&times;</button>

        <!-- Progress bar -->
        <div v-if="step <= 5" class="progress-bar">
          <div class="progress-fill" :style="{ width: (step / 5) * 100 + '%' }"></div>
        </div>

        <!-- Step 1: Contacts -->
        <div v-if="step === 1" class="modal-step">
          <h2>Контактные данные</h2>
          <p class="step-desc">Шаг 1 из 5</p>

          <div class="form-group">
            <label>Имя *</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Ваше имя"
              class="form-input"
              :class="{ 'input-error': errors.fullName }"
            />
            <span v-if="errors.fullName" class="error-text">{{ errors.fullName }}</span>
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              class="form-input"
              :class="{ 'input-error': errors.email }"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="form.consent" type="checkbox" />
              <span>Даю согласие на обработку персональных данных *</span>
            </label>
            <span v-if="errors.consent" class="error-text">{{ errors.consent }}</span>
          </div>

          <button class="btn-next" @click="validateStep1">Далее</button>
        </div>

        <!-- Step 2: Skin info -->
        <div v-if="step === 2" class="modal-step">
          <h2>О вашей коже</h2>
          <p class="step-desc">Шаг 2 из 5</p>

          <div class="form-group">
            <label>Возраст *</label>
            <input
              v-model.number="form.age"
              type="number"
              min="12"
              max="120"
              placeholder="Ваш возраст"
              class="form-input"
              :class="{ 'input-error': errors.age }"
            />
            <span v-if="errors.age" class="error-text">{{ errors.age }}</span>
          </div>

          <div class="form-group">
            <label>Тип кожи *</label>
            <div class="btn-group">
              <button
                v-for="t in skinTypes"
                :key="t.value"
                class="btn-option"
                :class="{ active: form.skinType === t.value }"
                @click="form.skinType = t.value"
              >{{ t.label }}</button>
            </div>
            <span v-if="errors.skinType" class="error-text">{{ errors.skinType }}</span>
          </div>

          <div class="form-group">
            <label>Бюджет на уход</label>
            <div class="btn-group">
              <button
                v-for="p in priceRanges"
                :key="p.value"
                class="btn-option"
                :class="{ active: form.priceRange === p.value }"
                @click="form.priceRange = form.priceRange === p.value ? null : p.value"
              >{{ p.label }}</button>
            </div>
          </div>

          <div class="step-buttons">
            <button class="btn-back" @click="step = 1">Назад</button>
            <button class="btn-next" @click="validateStep2">Далее</button>
          </div>
        </div>

        <!-- Step 3: Problems -->
        <div v-if="step === 3" class="modal-step">
          <h2>Проблемы кожи</h2>
          <p class="step-desc">Шаг 3 из 5</p>

          <div class="form-group">
            <label>Выберите проблемы</label>
            <div class="problems-grid">
              <button
                v-for="problem in skinProblems"
                :key="problem"
                class="btn-problem"
                :class="{ active: form.selectedProblems.includes(problem) }"
                @click="toggleProblem(problem)"
              >{{ problem }}</button>
            </div>
          </div>

          <div class="form-group">
            <label>Своя проблема</label>
            <input
              v-model="form.customProblem"
              type="text"
              placeholder="Опишите свою проблему..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Дополнительный комментарий</label>
            <textarea
              v-model="form.additionalComment"
              placeholder="Расскажите подробнее..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <span v-if="errors.problems" class="error-text">{{ errors.problems }}</span>

          <div class="step-buttons">
            <button class="btn-back" @click="step = 2">Назад</button>
            <button class="btn-next" @click="validateStep3">Далее</button>
          </div>
        </div>

        <!-- Step 4: Photos -->
        <div v-if="step === 4" class="modal-step">
          <h2>Фотографии</h2>
          <p class="step-desc">Шаг 4 из 5 — загрузите от 1 до 6 фото</p>

          <div
            class="drop-zone"
            :class="{ dragover: isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              style="display: none"
              @change="handleFileSelect"
            />
            <div class="drop-zone-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p>Перетащите фото сюда или нажмите для выбора</p>
              <span>{{ form.photos.length }}/6 фото</span>
            </div>
          </div>

          <div v-if="form.photos.length" class="photo-previews">
            <div v-for="(photo, idx) in form.photos" :key="idx" class="photo-preview">
              <img :src="photo.preview" />
              <button class="photo-remove" @click="removePhoto(idx)">&times;</button>
            </div>
          </div>

          <span v-if="errors.photos" class="error-text">{{ errors.photos }}</span>

          <div class="step-buttons">
            <button class="btn-back" @click="step = 3">Назад</button>
            <button class="btn-next" @click="validateStep4">Далее</button>
          </div>
        </div>

        <!-- Step 5: Confirmation -->
        <div v-if="step === 5" class="modal-step">
          <h2>Подтверждение</h2>
          <p class="step-desc">Шаг 5 из 5 — проверьте данные</p>

          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Имя</span>
              <span>{{ form.fullName }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Email</span>
              <span>{{ form.email }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Возраст</span>
              <span>{{ form.age }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Тип кожи</span>
              <span>{{ skinTypeLabel }}</span>
            </div>
            <div v-if="form.priceRange" class="summary-row">
              <span class="summary-label">Бюджет</span>
              <span>{{ priceRangeLabel }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Проблемы</span>
              <span>{{ allProblems }}</span>
            </div>
            <div v-if="form.additionalComment" class="summary-row">
              <span class="summary-label">Комментарий</span>
              <span>{{ form.additionalComment }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Фото</span>
              <span>{{ form.photos.length }} шт.</span>
            </div>
          </div>

          <div v-if="submitError" class="error-banner">{{ submitError }}</div>

          <div class="step-buttons">
            <button class="btn-back" @click="step = 4" :disabled="submitting">Назад</button>
            <button class="btn-pay" @click="submitAndPay" :disabled="submitting">
              {{ submitting ? 'Обработка...' : 'Оплатить 500 ₽' }}
            </button>
          </div>
        </div>

        <!-- Step 6: Success -->
        <div v-if="step === 6" class="modal-step success-step">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2>Заявка #{{ applicationDisplayNumber }} отправлена!</h2>
          <p class="success-text">
            Ваша заявка принята и оплачена. Наши эксперты проанализируют ваши фотографии и отправят рекомендации на <strong>{{ form.email }}</strong>.
          </p>
          <p class="success-text" style="font-size: 14px; color: #8B7355;">Номер вашей заявки: <strong>#{{ applicationDisplayNumber }}</strong>. Сохраните его на случай обращения.</p>
          <p class="success-note">Обычно это занимает до 24 часов.</p>
          <button class="btn-next" @click="close">Закрыть</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { submitWebApplication, payWebApplication, getWebSkinProblems } from '../api/index.js';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['close']);

const step = ref(1);
const submitting = ref(false);
const submitError = ref('');
const isDragging = ref(false);
const skinProblems = ref([]);
const applicationDisplayNumber = ref(null);

const skinTypes = [
  { value: 'DRY', label: 'Сухая' },
  { value: 'OILY', label: 'Жирная' },
  { value: 'COMBINATION', label: 'Комбинированная' },
  { value: 'NORMAL', label: 'Нормальная' }
];

const priceRanges = [
  { value: 'UP_TO_5000', label: 'До 5 000 ₽' },
  { value: 'UP_TO_10000', label: 'До 10 000 ₽' },
  { value: 'UP_TO_20000', label: 'До 20 000 ₽' }
];

const form = ref({
  fullName: '',
  email: '',
  consent: false,
  age: null,
  skinType: null,
  priceRange: null,
  selectedProblems: [],
  customProblem: '',
  additionalComment: '',
  photos: []
});

const errors = ref({});

const skinTypeLabel = computed(() => skinTypes.find(t => t.value === form.value.skinType)?.label || '');
const priceRangeLabel = computed(() => priceRanges.find(p => p.value === form.value.priceRange)?.label || '');
const allProblems = computed(() => {
  const problems = [...form.value.selectedProblems];
  if (form.value.customProblem.trim()) {
    problems.push(form.value.customProblem.trim());
  }
  return problems.join(', ');
});

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    loadSkinProblems();
  } else {
    document.body.style.overflow = '';
  }
});

async function loadSkinProblems() {
  try {
    const res = await getWebSkinProblems();
    skinProblems.value = res.data.problems || [];
  } catch {
    skinProblems.value = [
      'Акне / прыщи', 'Сухость и шелушение', 'Жирный блеск', 'Пигментация',
      'Морщины', 'Покраснения', 'Расширенные поры', 'Чувствительность'
    ];
  }
}

function close() {
  if (step.value === 6) {
    resetForm();
  }
  document.body.style.overflow = '';
  emit('close');
}

function resetForm() {
  step.value = 1;
  submitting.value = false;
  submitError.value = '';
  errors.value = {};
  form.value = {
    fullName: '',
    email: '',
    consent: false,
    age: null,
    skinType: null,
    priceRange: null,
    selectedProblems: [],
    customProblem: '',
    additionalComment: '',
    photos: []
  };
}

function validateStep1() {
  errors.value = {};
  if (!form.value.fullName.trim()) errors.value.fullName = 'Введите имя';
  if (!form.value.email.trim()) {
    errors.value.email = 'Введите email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim())) {
    errors.value.email = 'Некорректный email';
  }
  if (!form.value.consent) errors.value.consent = 'Необходимо согласие';
  if (Object.keys(errors.value).length === 0) step.value = 2;
}

function validateStep2() {
  errors.value = {};
  if (!form.value.age || form.value.age < 12 || form.value.age > 120) {
    errors.value.age = 'Введите возраст (12-120)';
  }
  if (!form.value.skinType) errors.value.skinType = 'Выберите тип кожи';
  if (Object.keys(errors.value).length === 0) step.value = 3;
}

function validateStep3() {
  errors.value = {};
  // Problems are optional — user can skip
  step.value = 4;
}

function validateStep4() {
  errors.value = {};
  if (form.value.photos.length === 0) {
    errors.value.photos = 'Загрузите хотя бы одно фото';
  }
  if (Object.keys(errors.value).length === 0) step.value = 5;
}

function toggleProblem(problem) {
  const idx = form.value.selectedProblems.indexOf(problem);
  if (idx === -1) {
    form.value.selectedProblems.push(problem);
  } else {
    form.value.selectedProblems.splice(idx, 1);
  }
}

function addFiles(files) {
  const remaining = 6 - form.value.photos.length;
  const toAdd = Array.from(files).slice(0, remaining);
  for (const file of toAdd) {
    if (!file.type.startsWith('image/')) continue;
    form.value.photos.push({
      file,
      preview: URL.createObjectURL(file)
    });
  }
}

function handleFileSelect(e) {
  addFiles(e.target.files);
  e.target.value = '';
}

function handleDrop(e) {
  isDragging.value = false;
  addFiles(e.dataTransfer.files);
}

function removePhoto(idx) {
  URL.revokeObjectURL(form.value.photos[idx].preview);
  form.value.photos.splice(idx, 1);
}

async function submitAndPay() {
  submitting.value = true;
  submitError.value = '';

  try {
    // Build FormData
    const fd = new FormData();
    fd.append('fullName', form.value.fullName.trim());
    fd.append('email', form.value.email.trim());
    fd.append('consentToDataProcessing', 'true');
    fd.append('age', String(form.value.age));
    fd.append('skinType', form.value.skinType);
    if (form.value.priceRange) fd.append('priceRange', form.value.priceRange);

    const problems = [...form.value.selectedProblems];
    if (form.value.customProblem.trim()) problems.push(form.value.customProblem.trim());
    fd.append('mainProblems', problems.join(', '));

    if (form.value.additionalComment.trim()) {
      fd.append('additionalComment', form.value.additionalComment.trim());
    }

    for (const photo of form.value.photos) {
      fd.append('photos', photo.file);
    }

    // Submit application
    const res = await submitWebApplication(fd);
    const applicationId = res.data.applicationId;
    applicationDisplayNumber.value = res.data.displayNumber || applicationId;

    // Create YooKassa payment
    const payRes = await payWebApplication(applicationId);

    if (payRes.data.alreadyPaid) {
      step.value = 6;
      return;
    }

    // Redirect to YooKassa payment page (validate URL)
    const payUrl = payRes.data.confirmationUrl;
    console.log('[PAY] confirmationUrl:', payUrl);
    try {
      if (!payUrl) throw new Error('No payment URL received');
      const parsed = new URL(payUrl);
      if (parsed.protocol !== 'https:' || !(parsed.hostname.endsWith('yookassa.ru') || parsed.hostname.endsWith('yoomoney.ru'))) {
        throw new Error(`Invalid payment URL domain: ${parsed.hostname}`);
      }
      window.location.href = payUrl;
    } catch (urlErr) {
      console.error('[PAY] URL validation error:', urlErr.message);
      submitError.value = 'Ошибка платёжной ссылки. Попробуйте ещё раз.';
    }
  } catch (err) {
    submitError.value = err.response?.data?.error || 'Произошла ошибка. Попробуйте ещё раз.';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 36, 32, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: var(--color-porcelain, #FAF8F5);
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 40px 32px 32px;
  box-shadow: 0 20px 60px rgba(45, 36, 32, 0.2);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-warm-nude, #E8DED4);
  border-radius: 50%;
  font-size: 22px;
  color: var(--color-cocoa, #5C4A3D);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close:hover {
  background: var(--color-burgundy, #8B3A4A);
  color: #fff;
}

.progress-bar {
  height: 4px;
  background: var(--color-warm-nude, #E8DED4);
  border-radius: 2px;
  margin-bottom: 28px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-burgundy, #8B3A4A);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.modal-step h2 {
  font-family: var(--font-display, 'Playfair Display', serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--color-rich-ebony, #2D2420);
  margin-bottom: 4px;
}

.step-desc {
  font-size: 14px;
  color: var(--color-cocoa, #5C4A3D);
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-rich-ebony, #2D2420);
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-warm-nude, #E8DED4);
  border-radius: 12px;
  font-size: 16px;
  font-family: var(--font-body, 'Manrope', sans-serif);
  background: var(--color-white, #fff);
  color: var(--color-rich-ebony, #2D2420);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-burgundy, #8B3A4A);
}

.form-input.input-error {
  border-color: #d44;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-text {
  display: block;
  font-size: 13px;
  color: #d44;
  margin-top: 4px;
}

.error-banner {
  background: #fef2f2;
  color: #d44;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 16px;
}

.checkbox-group {
  margin-top: 8px;
}

.checkbox-label {
  display: flex !important;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-weight: 400 !important;
}

.checkbox-label input {
  margin-top: 3px;
  width: 18px;
  height: 18px;
  accent-color: var(--color-burgundy, #8B3A4A);
  flex-shrink: 0;
}

.checkbox-label span {
  font-size: 14px;
  color: var(--color-cocoa, #5C4A3D);
  line-height: 1.4;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-option {
  padding: 10px 18px;
  border: 1px solid var(--color-warm-nude, #E8DED4);
  border-radius: 20px;
  background: var(--color-white, #fff);
  font-size: 14px;
  font-family: var(--font-body, 'Manrope', sans-serif);
  color: var(--color-cocoa, #5C4A3D);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-option:hover {
  border-color: var(--color-burgundy, #8B3A4A);
  color: var(--color-burgundy, #8B3A4A);
}

.btn-option.active {
  background: var(--color-burgundy, #8B3A4A);
  color: #fff;
  border-color: var(--color-burgundy, #8B3A4A);
}

.problems-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-problem {
  padding: 8px 16px;
  border: 1px solid var(--color-warm-nude, #E8DED4);
  border-radius: 16px;
  background: var(--color-white, #fff);
  font-size: 13px;
  font-family: var(--font-body, 'Manrope', sans-serif);
  color: var(--color-cocoa, #5C4A3D);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-problem:hover {
  border-color: var(--color-burgundy, #8B3A4A);
}

.btn-problem.active {
  background: var(--color-blush, #F5EBE6);
  border-color: var(--color-burgundy, #8B3A4A);
  color: var(--color-burgundy, #8B3A4A);
  font-weight: 600;
}

.drop-zone {
  border: 2px dashed var(--color-warm-nude, #E8DED4);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.drop-zone:hover,
.drop-zone.dragover {
  border-color: var(--color-burgundy, #8B3A4A);
  background: var(--color-blush, #F5EBE6);
}

.drop-zone-content {
  color: var(--color-cocoa, #5C4A3D);
}

.drop-zone-content svg {
  margin-bottom: 8px;
  opacity: 0.5;
}

.drop-zone-content p {
  font-size: 15px;
  margin-bottom: 4px;
}

.drop-zone-content span {
  font-size: 13px;
  opacity: 0.6;
}

.photo-previews {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.photo-preview {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.summary {
  background: var(--color-white, #fff);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--color-soft-ivory, #F5F0EB);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  color: var(--color-cocoa, #5C4A3D);
  flex-shrink: 0;
  margin-right: 16px;
}

.summary-row > span:last-child {
  text-align: right;
  color: var(--color-rich-ebony, #2D2420);
  font-weight: 500;
}

.step-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-next,
.btn-pay {
  flex: 1;
  padding: 14px 24px;
  background: var(--color-burgundy, #8B3A4A);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-body, 'Manrope', sans-serif);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-next:hover,
.btn-pay:hover {
  background: var(--color-burgundy-dark, #6E2E3B);
}

.btn-next:disabled,
.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-back {
  padding: 14px 24px;
  background: var(--color-white, #fff);
  color: var(--color-cocoa, #5C4A3D);
  border: 1px solid var(--color-warm-nude, #E8DED4);
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  font-family: var(--font-body, 'Manrope', sans-serif);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  border-color: var(--color-burgundy, #8B3A4A);
  color: var(--color-burgundy, #8B3A4A);
}

.btn-back:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-step {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  color: var(--color-burgundy, #8B3A4A);
  margin-bottom: 16px;
}

.success-text {
  font-size: 16px;
  color: var(--color-cocoa, #5C4A3D);
  line-height: 1.6;
  margin: 16px 0;
}

.success-note {
  font-size: 14px;
  color: var(--color-cocoa, #5C4A3D);
  opacity: 0.7;
  margin-bottom: 24px;
}

@media (max-width: 560px) {
  .modal-container {
    padding: 32px 20px 24px;
    border-radius: 20px;
    max-height: 95vh;
  }

  .modal-step h2 {
    font-size: 24px;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn-option {
    text-align: center;
  }
}
</style>
