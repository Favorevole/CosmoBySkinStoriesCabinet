<template>
  <div class="landing">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="logo">CosmoSkin</div>
        <nav>
          <a href="#how-it-works">Как это работает</a>
          <a href="#benefits">Преимущества</a>
          <a href="#form">Консультация</a>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1>Персональные рекомендации<br>по уходу за кожей</h1>
        <p class="subtitle">Получите консультацию от квалифицированного специалиста онлайн</p>
        <div class="cta-buttons">
          <a :href="telegramBotLink" target="_blank" class="btn btn-primary">
            Написать в Telegram
          </a>
          <a href="#form" class="btn btn-secondary">Заполнить на сайте</a>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="how-it-works">
      <div class="container">
        <h2>Как это работает</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Заполните анкету</h3>
            <p>Ответьте на 4 простых вопроса о вашей коже</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Загрузите фото</h3>
            <p>Прикрепите 2-6 фотографий вашей кожи</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Дождитесь ответа</h3>
            <p>Специалист изучит вашу заявку</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Получите рекомендации</h3>
            <p>Персональный план ухода с рекомендациями средств</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section id="benefits" class="benefits">
      <div class="container">
        <h2>Преимущества</h2>
        <div class="benefits-grid">
          <div class="benefit">
            <div class="icon">👩‍⚕️</div>
            <h3>Квалифицированные специалисты</h3>
            <p>Консультации от дерматологов и косметологов</p>
          </div>
          <div class="benefit">
            <div class="icon">📱</div>
            <h3>Удобный формат</h3>
            <p>Через Telegram или на сайте — как вам удобнее</p>
          </div>
          <div class="benefit">
            <div class="icon">⚡</div>
            <h3>Быстрый ответ</h3>
            <p>Рекомендации в течение 24-48 часов</p>
          </div>
          <div class="benefit">
            <div class="icon">🎯</div>
            <h3>Индивидуальный подход</h3>
            <p>Учитываем особенности именно вашей кожи</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Target audience -->
    <section class="target">
      <div class="container">
        <h2>Для кого этот сервис</h2>
        <ul>
          <li>Тем, кто хочет подобрать правильный уход за кожей</li>
          <li>Тем, кто столкнулся с проблемами кожи</li>
          <li>Тем, кто хочет профессиональный взгляд на свой текущий уход</li>
          <li>Тем, кто не знает, с чего начать</li>
        </ul>
      </div>
    </section>

    <!-- Form -->
    <section id="form" class="form-section">
      <div class="container">
        <h2>Заполнить анкету на сайте</h2>
        <p class="form-subtitle">
          Или используйте наш
          <a :href="telegramBotLink" target="_blank">Telegram бот</a>
        </p>

        <form @submit.prevent="submitForm" class="questionnaire-form" v-if="!submitted">
          <!-- Age -->
          <div class="form-group">
            <label for="age">Ваш возраст *</label>
            <input
              type="number"
              id="age"
              v-model.number="form.age"
              min="12"
              max="120"
              required
              placeholder="Например: 25"
            >
          </div>

          <!-- Skin Type -->
          <div class="form-group">
            <label>Тип кожи *</label>
            <div class="radio-group">
              <label v-for="type in skinTypes" :key="type.value" class="radio-label">
                <input type="radio" v-model="form.skinType" :value="type.value" required>
                <span>{{ type.label }}</span>
              </label>
            </div>
          </div>

          <!-- Problems -->
          <div class="form-group">
            <label for="problems">Основные проблемы *</label>
            <textarea
              id="problems"
              v-model="form.mainProblems"
              required
              placeholder="Опишите, что вас беспокоит..."
              rows="3"
            ></textarea>
            <div class="hints">
              <button
                type="button"
                v-for="hint in problemHints"
                :key="hint"
                @click="addHint(hint)"
                class="hint-btn"
              >
                + {{ hint }}
              </button>
            </div>
          </div>

          <!-- Comment -->
          <div class="form-group">
            <label for="comment">Дополнительный комментарий</label>
            <textarea
              id="comment"
              v-model="form.additionalComment"
              placeholder="Текущий уход, аллергии, хронические заболевания..."
              rows="2"
            ></textarea>
          </div>

          <!-- Photos -->
          <div class="form-group">
            <label>Фотографии кожи (1-6 шт.) *</label>
            <div class="photo-upload">
              <input
                type="file"
                ref="fileInput"
                @change="handleFiles"
                accept="image/*"
                multiple
                :disabled="photos.length >= 6"
                class="file-input"
              >
              <div class="upload-area" @click="$refs.fileInput.click()">
                <span v-if="photos.length === 0">Нажмите для загрузки фотографий</span>
                <span v-else>{{ photos.length }} / 6 фото загружено</span>
              </div>
              <div class="photo-previews" v-if="photos.length > 0">
                <div v-for="(photo, index) in photos" :key="index" class="preview">
                  <img :src="photo.preview" alt="">
                  <button type="button" @click="removePhoto(index)" class="remove-btn">×</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="form-group">
            <label for="email">Email или Telegram для ответа *</label>
            <input
              type="text"
              id="email"
              v-model="form.contact"
              required
              placeholder="email@example.com или @username"
            >
          </div>

          <!-- Submit -->
          <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || !isFormValid">
            {{ loading ? 'Отправка...' : 'Отправить заявку' }}
          </button>
        </form>

        <!-- Success -->
        <div v-if="submitted" class="success-message">
          <div class="success-icon">✅</div>
          <h3>Заявка #{{ applicationId }} отправлена!</h3>
          <p>
            Специалист изучит вашу анкету и фотографии.
            Ответ придёт на указанный контакт в течение 24-48 часов.
          </p>
          <p>
            Для отслеживания статуса используйте наш
            <a :href="telegramBotLink" target="_blank">Telegram бот</a>
          </p>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <div class="container">
        <h2>Готовы начать?</h2>
        <div class="cta-buttons">
          <a :href="telegramBotLink" target="_blank" class="btn btn-primary">
            Написать в Telegram
          </a>
          <a href="#form" class="btn btn-secondary">Заполнить на сайте</a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 CosmoSkin. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { submitWebApplication } from '../api';

const telegramBotLink = 'https://t.me/CosmobySkinStoriesClient_bot';

const skinTypes = [
  { value: 'DRY', label: 'Сухая' },
  { value: 'OILY', label: 'Жирная' },
  { value: 'COMBINATION', label: 'Комбинированная' },
  { value: 'NORMAL', label: 'Нормальная' }
];

const problemHints = [
  'Акне',
  'Сухость',
  'Жирность',
  'Пигментация',
  'Морщины',
  'Покраснения'
];

const form = ref({
  age: null,
  skinType: '',
  mainProblems: '',
  additionalComment: '',
  contact: ''
});

const photos = ref([]);
const loading = ref(false);
const submitted = ref(false);
const applicationId = ref(null);
const error = ref(null);
const fileInput = ref(null);

const isFormValid = computed(() => {
  return form.value.age &&
    form.value.skinType &&
    form.value.mainProblems.length >= 3 &&
    form.value.contact &&
    photos.value.length >= 1;
});

function addHint(hint) {
  if (form.value.mainProblems) {
    form.value.mainProblems += ', ' + hint;
  } else {
    form.value.mainProblems = hint;
  }
}

function handleFiles(event) {
  const files = event.target.files;
  for (const file of files) {
    if (photos.value.length >= 6) break;
    if (!file.type.startsWith('image/')) continue;

    const reader = new FileReader();
    reader.onload = (e) => {
      photos.value.push({
        file,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  }
  event.target.value = '';
}

function removePhoto(index) {
  photos.value.splice(index, 1);
}

async function submitForm() {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = null;

  try {
    const formData = new FormData();
    formData.append('age', form.value.age);
    formData.append('skinType', form.value.skinType);
    formData.append('mainProblems', form.value.mainProblems);
    formData.append('additionalComment', form.value.additionalComment);

    // Parse contact
    if (form.value.contact.includes('@') && !form.value.contact.includes('.')) {
      formData.append('phone', form.value.contact);
    } else {
      formData.append('email', form.value.contact);
    }

    for (const photo of photos.value) {
      formData.append('photos', photo.file);
    }

    const response = await submitWebApplication(formData);
    applicationId.value = response.data.applicationId;
    submitted.value = true;

  } catch (err) {
    error.value = err.response?.data?.error || 'Произошла ошибка. Попробуйте позже.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.landing {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  padding: 20px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.header nav {
  display: flex;
  gap: 30px;
}

.header nav a {
  color: var(--gray-600);
  font-weight: 500;
}

/* Hero */
.hero {
  padding: 160px 0 100px;
  text-align: center;
  background: linear-gradient(135deg, var(--secondary) 0%, white 100%);
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.subtitle {
  font-size: 20px;
  color: var(--gray-600);
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  text-decoration: none;
}

.btn-secondary {
  background: white;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-secondary:hover {
  background: var(--secondary);
  text-decoration: none;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 18px;
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sections */
section {
  padding: 80px 0;
}

section h2 {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 50px;
}

/* How it works */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.step {
  text-align: center;
  padding: 30px;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.step h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.step p {
  color: var(--gray-600);
}

/* Benefits */
.benefits {
  background: var(--gray-50);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.benefit {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.benefit .icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.benefit h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.benefit p {
  color: var(--gray-600);
  font-size: 14px;
}

/* Target */
.target ul {
  max-width: 600px;
  margin: 0 auto;
  list-style: none;
}

.target li {
  padding: 15px 0;
  padding-left: 40px;
  position: relative;
  font-size: 18px;
  border-bottom: 1px solid var(--gray-200);
}

.target li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

/* Form */
.form-section {
  background: var(--gray-50);
}

.form-subtitle {
  text-align: center;
  color: var(--gray-600);
  margin-bottom: 40px;
}

.questionnaire-form {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-label:has(input:checked) {
  border-color: var(--primary);
  background: var(--secondary);
}

.radio-label input {
  accent-color: var(--primary);
}

.hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.hint-btn {
  padding: 6px 12px;
  background: var(--gray-100);
  border: none;
  border-radius: 20px;
  font-size: 13px;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
}

.hint-btn:hover {
  background: var(--secondary);
  color: var(--primary);
}

.photo-upload {
  border: 2px dashed var(--gray-300);
  border-radius: 12px;
  padding: 20px;
}

.file-input {
  display: none;
}

.upload-area {
  text-align: center;
  padding: 30px;
  cursor: pointer;
  color: var(--gray-500);
}

.upload-area:hover {
  color: var(--primary);
}

.photo-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.preview {
  position: relative;
  width: 80px;
  height: 80px;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--danger);
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.success-message {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.success-message h3 {
  font-size: 24px;
  margin-bottom: 15px;
}

.success-message p {
  color: var(--gray-600);
  margin-bottom: 10px;
}

.error-message {
  background: #FEE2E2;
  color: var(--danger);
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Final CTA */
.final-cta {
  text-align: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.final-cta h2 {
  color: white;
}

.final-cta .btn-primary {
  background: white;
  color: var(--primary);
}

.final-cta .btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

/* Footer */
.footer {
  padding: 30px 0;
  text-align: center;
  color: var(--gray-500);
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .header nav {
    display: none;
  }

  .hero h1 {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }

  section h2 {
    font-size: 28px;
  }

  .questionnaire-form {
    padding: 20px;
  }

  .radio-group {
    grid-template-columns: 1fr;
  }
}
</style>
