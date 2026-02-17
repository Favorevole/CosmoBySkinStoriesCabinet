<template>
  <div class="landing">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <img src="/logo.jpg" alt="Skin Stories" class="logo-img" />
        </div>
        <nav class="nav">
          <a href="#how-it-works">Как это работает</a>
          <a href="#experts">Эксперты</a>
          <a href="#about">О проекте</a>
          <button class="nav-cta" @click="openConsultation">Начать</button>
        </nav>
        <button class="mobile-cta" @click="openConsultation">Начать</button>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <span class="badge">AI Research Phase</span>
          <h1>Мы обучаем AI <br>понимать настоящую кожу</h1>
          <p class="hero-subtitle">Получите экспертные рекомендации по уходу за кожей от наших дерматологов — пока наш AI&nbsp;учится.</p>
          <p class="hero-cta-label">Начать консультацию</p>
          <div class="hero-cta-buttons">
            <button class="btn btn-primary" @click="openConsultation">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M14 9l3 3-3 3"/></svg>
              На сайте
            </button>
            <a :href="telegramBotLink" target="_blank" class="btn btn-primary" @click="trackTelegramClick">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="m22 2-11 11"/></svg>
              В Телеграм
            </a>
          </div>
          <!-- <a href="#" class="gift-link" @click.prevent="openGiftModal">Купить сертификат на консультацию</a> -->
        </div>
        <div class="hero-visual">
          <img src="/hero.png" alt="Skin care" />
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section v-if="reviews.length" class="reviews">
      <div class="section-header">
        <span class="tagline">ОТЗЫВЫ</span>
        <h2>Что говорят наши клиенты</h2>
        <p class="section-desc">Реальные отзывы от тех, кто уже получил рекомендации</p>
      </div>
      <div class="reviews-grid">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-stars">
            <span v-for="s in review.rating" :key="s" class="star">&#x2B50;</span>
          </div>
          <p v-if="review.text" class="review-text">{{ review.text }}</p>
          <img
            v-if="review.imageS3Key"
            :src="getPublicReviewImageUrl(review.id)"
            alt="Отзыв"
            class="review-image"
            @click="openLightbox(review.id)"
          />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-header">
        <span class="tagline">ПРОЦЕСС</span>
        <h2>Как это работает</h2>
        <p class="section-desc">Три простых шага до персональных рекомендаций</p>
      </div>
      <div class="steps">
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <span class="step-num">01</span>
          <h3>Заполните анкету</h3>
          <p>Ответьте на несколько вопросов и отправьте фото</p>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span class="step-num">02</span>
          <h3>Врач изучит заявку</h3>
          <p>Дерматолог-косметолог лично проанализирует вашу кожу</p>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 0 1 4-4z"/><path d="M12 8v6"/><path d="M8 14h8"/><circle cx="12" cy="18" r="4"/><path d="M12 14v4"/></svg>
          </div>
          <span class="step-num">03</span>
          <h3>Получите рекомендации</h3>
          <p>Персональный план ухода — в течение 24 часов</p>
        </div>
      </div>
    </section>

    <!-- Why Join -->
    <section class="why-join">
      <div class="section-header">
        <span class="tagline">ПОЧЕМУ МЫ</span>
        <h2>Что вы получите</h2>
        <p class="section-desc">Персональный подход к уходу за кожей — от настоящих дерматологов</p>
      </div>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><path d="M8 12h8"/><circle cx="12" cy="19" r="3"/><path d="M12 16v-4"/></svg>
          </div>
          <h3>Экспертный анализ</h3>
          <p>Ваши фото анализируют реальные косметологи и дерматологи, не автоматика</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <h3>Конфиденциальность</h3>
          <p>Ваши фото и данные видит только назначенный врач. Без AI, без передачи третьим лицам</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          </div>
          <h3>Доступная цена</h3>
          <p>Консультация настоящего дерматолога — всего 500 ₽, без подписок и допродаж</p>
        </div>
      </div>
      <div class="skin-banner">
        <img src="/skin-section.png" alt="Skin care" />
      </div>
    </section>

    <!-- How We Work -->
    <section id="about" class="ai-trust">
      <div class="section-header">
        <span class="tagline">НАШЕ ОТЛИЧИЕ</span>
        <h2>Как это работает и что ты получишь</h2>
      </div>
      <div class="ai-two-columns">
        <div class="ai-column">
          <h3 class="ai-column-title">Как это работает</h3>
          <div class="ai-steps">
            <div class="ai-step">
              <span class="ai-step-num">1</span>
              <p>Загружаешь фото, отвечаешь на вопросы</p>
            </div>
            <div class="ai-step">
              <span class="ai-step-num">2</span>
              <p>Дерматолог анализирует состояние кожи</p>
            </div>
            <div class="ai-step">
              <span class="ai-step-num">3</span>
              <p>Получаешь персональный план ухода</p>
            </div>
          </div>
        </div>
        <div class="ai-column">
          <h3 class="ai-column-title">Что ты получишь</h3>
          <ul class="ai-benefits">
            <li>Понимание типа и состояния кожи</li>
            <li>Рекомендации по ежедневному уходу</li>
            <li>Советы, какие средства подойдут именно тебе</li>
            <li>Ошибки, которые могут ухудшать состояние кожи</li>
            <li>Рекомендации реальных косметологов-дерматологов с возможностью записи на детальные онлайн или офлайн консультации</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Experts -->
    <section id="experts" class="experts">
      <div class="section-header">
        <span class="tagline">КОМАНДА</span>
        <h2>Эксперты, которым можно доверять</h2>
        <p class="section-desc">Сертифицированные косметологи и дерматологи с многолетним опытом</p>
      </div>
      <div class="experts-grid">
        <div class="expert-card">
          <div class="expert-photo">
            <img src="/nika.png" alt="Ника Шамхалова" />
          </div>
          <h3>Ника Шамхалова</h3>
          <span class="expert-role">Врач дерматолог-косметолог, к.м.н.</span>
          <p>Руководитель клиники Skin Stories. Визионер beauty tech проекта Skin Stories</p>
        </div>
        <div class="expert-card">
          <div class="expert-photo">
            <img src="/maria.jpg" alt="Мария Гаврилова" />
          </div>
          <h3>Мария Гаврилова</h3>
          <span class="expert-role">Врач дерматолог</span>
          <p>Эксперт по лечению акне</p>
        </div>
        <div class="expert-card">
          <div class="expert-photo">
            <img src="/sofya.jpg" alt="Софья Охотникова" />
          </div>
          <h3>Софья Охотникова</h3>
          <span class="expert-role">Врач дерматолог-косметолог</span>
          <p>Специалист по anti-age методикам</p>
        </div>
        <div class="expert-card">
          <div class="expert-photo">
            <img src="/rajab.jpg" alt="Раджаб Давудов" />
          </div>
          <h3>Раджаб Давудов</h3>
          <span class="expert-role">Врач косметолог, эстетист</span>
          <p>Эксперт по подбору ухода. Редактор телеграм канала Skin Stories</p>
        </div>
        <div class="expert-card">
          <div class="expert-photo">
            <img src="/alex.jpg" alt="Александр Щелкушкин" />
          </div>
          <h3>Александр Щелкушкин</h3>
          <span class="expert-role">Архитектор и тех.лид</span>
          <p>Эксперт по дата анализу</p>
        </div>
      </div>
    </section>

    <!-- Telegram Flow -->
    <section class="telegram-flow">
      <div class="section-header">
        <span class="tagline">ПРОСТО И БЫСТРО</span>
        <h2>Всё через Telegram</h2>
        <p class="section-desc">Никаких приложений и регистраций — просто отправьте фото в бот</p>
      </div>
      <div class="telegram-content">
        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="tg-header">
              <div class="tg-avatar">SK</div>
              <span class="tg-name">Skin.Stories Bot</span>
            </div>
            <div class="tg-chat">
              <div class="tg-message bot">
                <p>Привет! 👋 Давайте познакомимся с вашей кожей — ответьте на пару вопросов.</p>
              </div>
              <div class="tg-message user">
                <div class="tg-photo"></div>
              </div>
              <div class="tg-message bot">
                <p>Отлично! Заявка принята ✓ Дерматолог ответит в течение 24 часов.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="telegram-features">
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <div class="feature-text">
              <h4>Без установки приложений</h4>
              <p>Telegram уже есть у миллионов</p>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="feature-text">
              <h4>Приватность</h4>
              <p>Ваши данные защищены</p>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div class="feature-text">
              <h4>Быстрый ответ</h4>
              <p>Рекомендации в течение 24 часов</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <h2>Готовы получить рекомендации от дерматолога?</h2>
      <p class="cta-subtitle">Заполните анкету — ответ в течение 24 часов</p>
      <div class="cta-buttons">
        <button class="btn btn-white" @click="openConsultation">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M14 9l3 3-3 3"/></svg>
          Заполнить на сайте
        </button>
        <a :href="telegramBotLink" target="_blank" class="btn btn-white" @click="trackTelegramClick">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="m22 2-11 11"/></svg>
          Открыть Telegram
        </a>
      </div>
      <span class="cta-note">Конфиденциально • Ответ за 24 часа</span>
      <button class="cta-gift-btn" @click="openGiftModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
        Подарить сертификат на консультацию
      </button>
    </section>

    <!-- Payment success banner -->
    <Teleport to="body">
      <div v-if="showPaymentBanner" class="payment-overlay" @click.self="showPaymentBanner = false">
        <div class="payment-banner">
          <button class="payment-banner-close" @click="showPaymentBanner = false">&times;</button>
          <div class="payment-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="56" height="56"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <h2>Платёж обрабатывается</h2>
          <p v-if="paymentAppNumber">Заявка <strong>#{{ paymentAppNumber }}</strong> — платёж получен и обрабатывается. Как только оплата будет подтверждена, заявка будет отправлена специалисту.</p>
          <p v-else>Ваш платёж получен и обрабатывается. Как только оплата будет подтверждена, заявка будет отправлена специалисту.</p>
          <p v-if="paymentAppNumber" class="payment-banner-note" style="font-size: 13px;">Номер вашей заявки: <strong>#{{ paymentAppNumber }}</strong>. Сохраните его на случай обращения.</p>
          <p class="payment-banner-note">Обычно это занимает несколько минут. Рекомендации вы получите в течение 24 часов.</p>
          <button class="payment-banner-btn" @click="showPaymentBanner = false">Понятно</button>
        </div>
      </div>
    </Teleport>

    <!-- Gift Certificate Modal -->
    <Teleport to="body">
      <div v-if="showGiftModal" class="payment-overlay" @click.self="showGiftModal = false">
        <div class="payment-banner gift-modal">
          <button class="payment-banner-close" @click="showGiftModal = false">&times;</button>
          <div class="payment-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="56" height="56"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          </div>
          <h2>Подарочный сертификат</h2>
          <p>Подарите близкому человеку персональную консультацию косметолога. После оплаты вы получите промокод на 100% скидку.</p>
          <form class="gift-form" @submit.prevent="handleGiftPurchase">
            <input
              v-model="giftEmail"
              type="email"
              placeholder="Ваш email для получения промокода"
              class="gift-input"
              required
            />
            <p v-if="giftError" class="gift-error">{{ giftError }}</p>
            <button type="submit" class="payment-banner-btn" :disabled="giftLoading">
              {{ giftLoading ? 'Создаём платёж...' : 'Оплатить 500 ₽' }}
            </button>
          </form>
          <p class="payment-banner-note">Код одноразовый, действует без ограничения по времени</p>
        </div>
      </div>
    </Teleport>

    <!-- Gift Success Banner -->
    <Teleport to="body">
      <div v-if="showGiftBanner" class="payment-overlay" @click.self="showGiftBanner = false">
        <div class="payment-banner">
          <button class="payment-banner-close" @click="showGiftBanner = false">&times;</button>
          <div class="payment-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="56" height="56"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          </div>
          <template v-if="giftPromoCode">
            <h2>Сертификат готов!</h2>
            <p>Ваш промокод на бесплатную консультацию:</p>
            <div class="gift-code-box" @click="copyGiftCode">
              <span class="gift-code">{{ giftPromoCode }}</span>
              <span class="gift-code-hint">{{ codeCopied ? 'Скопировано!' : 'Нажмите, чтобы скопировать' }}</span>
            </div>
            <p>Передайте код получателю — он вводится при оплате консультации.</p>
            <p class="payment-banner-note">Промокод также отправлен на вашу почту.</p>
          </template>
          <template v-else-if="giftCheckFailed">
            <h2>Оплата обрабатывается</h2>
            <p>Промокод будет отправлен на вашу почту, как только оплата подтвердится.</p>
            <p class="payment-banner-note">Обычно это занимает несколько минут.</p>
          </template>
          <template v-else>
            <h2>Проверяем оплату...</h2>
            <p>Пожалуйста, подождите.</p>
          </template>
          <button class="payment-banner-btn" @click="showGiftBanner = false">Понятно</button>
        </div>
      </div>
    </Teleport>

    <!-- Review Image Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxReviewId" class="lightbox-overlay" @click.self="lightboxReviewId = null">
        <button class="lightbox-close" @click="lightboxReviewId = null">&times;</button>
        <img :src="getPublicReviewImageUrl(lightboxReviewId)" alt="Отзыв" class="lightbox-image" />
      </div>
    </Teleport>

    <!-- Consultation Modal -->
    <ConsultationModal :visible="showModal" @close="showModal = false" />

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo logo-footer">
            <img src="/logo.jpg" alt="Skin Stories" class="logo-img logo-img-footer" />
          </div>
        </div>
        <div class="footer-links">
          <a href="/privacy">Политика конфиденциальности</a>
          <span>© 2026 Skin Stories</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getPublicReviews, buyGiftCertificate, checkGiftStatus, trackEvent, getOrCreateVisitorId, getReviewImageUrl } from '../api/index.js';
import ConsultationModal from '../components/ConsultationModal.vue';

const botUsername = import.meta.env.VITE_CLIENT_BOT_USERNAME;
const telegramBotLink = computed(() => {
  const vid = getOrCreateVisitorId();
  return `https://t.me/${botUsername}?start=web_${vid}`;
});

const reviews = ref([]);
const showModal = ref(false);
const showPaymentBanner = ref(false);
const paymentAppNumber = ref(null);

// Gift certificate state
const showGiftModal = ref(false);
const giftEmail = ref('');
const giftError = ref('');
const giftLoading = ref(false);
const showGiftBanner = ref(false);
const giftPromoCode = ref(null);
const giftCheckFailed = ref(false);
const codeCopied = ref(false);
const lightboxReviewId = ref(null);

function getPublicReviewImageUrl(reviewId) {
  return getReviewImageUrl(reviewId);
}

function openLightbox(reviewId) {
  lightboxReviewId.value = reviewId;
}

function openConsultation() {
  trackEvent('click_web_form');
  showModal.value = true;
}

function trackTelegramClick() {
  trackEvent('click_telegram');
}

function openGiftModal() {
  trackEvent('click_gift');
  showGiftModal.value = true;
}

async function handleGiftPurchase() {
  giftError.value = '';
  giftLoading.value = true;
  try {
    const res = await buyGiftCertificate(giftEmail.value);
    const { confirmationUrl } = res.data;
    // Validate URL before redirecting
    if (confirmationUrl && /^https:\/\/(yookassa\.ru|yoomoney\.ru)/.test(confirmationUrl)) {
      window.location.href = confirmationUrl;
    } else {
      giftError.value = 'Ошибка создания платежа';
    }
  } catch (err) {
    giftError.value = err.response?.data?.error || 'Ошибка при создании платежа';
  } finally {
    giftLoading.value = false;
  }
}

async function pollGiftStatus(giftId) {
  for (let i = 0; i < 6; i++) {
    try {
      const res = await checkGiftStatus(giftId);
      if (res.data.status === 'COMPLETED' && res.data.promoCode) {
        giftPromoCode.value = res.data.promoCode;
        return;
      }
      if (res.data.status === 'FAILED') {
        giftCheckFailed.value = true;
        return;
      }
    } catch (e) {
      // continue polling
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  // After retries — tell user to check email
  giftCheckFailed.value = true;
}

function copyGiftCode() {
  if (giftPromoCode.value) {
    navigator.clipboard.writeText(giftPromoCode.value).then(() => {
      codeCopied.value = true;
      setTimeout(() => { codeCopied.value = false; }, 2000);
    });
  }
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);

  // Track page view
  trackEvent('page_view', {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign')
  });

  // Check if returning from YooKassa payment
  if (params.get('payment') === 'success') {
    const giftId = params.get('gift');
    if (giftId && giftId !== '1') {
      // Returning from gift certificate payment
      showGiftBanner.value = true;
      window.history.replaceState({}, '', window.location.pathname);
      pollGiftStatus(giftId);
    } else {
      // Regular consultation payment
      showPaymentBanner.value = true;
      paymentAppNumber.value = params.get('app') || null;
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  try {
    const res = await getPublicReviews();
    reviews.value = res.data.reviews || [];
  } catch (e) {
    // Landing still works without reviews
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap');

:root {
  /* Skin-tone inspired palette */
  --color-porcelain: #FAF8F5;
  --color-soft-ivory: #F5F0EB;
  --color-warm-nude: #E8DED4;
  --color-blush: #F5EBE6;

  /* Brand */
  --color-burgundy: #8B3A4A;
  --color-burgundy-dark: #6E2E3B;

  /* Text */
  --color-cocoa: #5C4A3D;
  --color-rich-ebony: #2D2420;

  /* Functional */
  --color-white: #FFFFFF;
  --color-dark: #2D2420;

  /* Fonts */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Manrope', sans-serif;
}
</style>

<style scoped>
.landing {
  min-height: 100vh;
  background: var(--color-porcelain);
  color: var(--color-rich-ebony);
  font-family: var(--font-body);
  position: relative;
}

.landing::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-size: 300px 300px;
}

.landing > * {
  position: relative;
  z-index: 2;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-white);
  box-shadow: 0 1px 0 rgba(0,0,0,0.05);
}

.header-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 56px;
  width: auto;
  object-fit: contain;
  margin-top: 4px;
}

.logo-img-footer {
  height: 48px;
  filter: brightness(0) invert(1);
}

.nav {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav a {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-cocoa);
  transition: color 0.3s;
}

.nav a:hover {
  color: var(--color-burgundy);
}

.nav-cta {
  padding: 14px 28px;
  background: var(--color-burgundy);
  color: var(--color-white) !important;
  border-radius: 24px;
  transition: background 0.3s;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
}

.nav-cta:hover {
  background: var(--color-burgundy-dark);
}

.mobile-cta {
  display: none;
  padding: 10px 20px;
  background: var(--color-burgundy);
  color: var(--color-white);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
}

/* Hero */
.hero {
  padding: 160px 80px 80px;
  background: var(--color-porcelain);
}

.hero-content {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
}

.hero-text {
  flex: 1;
}

.badge {
  display: inline-block;
  padding: 8px 16px;
  background: var(--color-blush);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-burgundy);
  margin-bottom: 24px;
}

.hero h1 {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 400;
  line-height: 1.15;
  color: var(--color-rich-ebony);
  margin-bottom: 24px;
}

.hero-subtitle {
  font-size: 20px;
  color: var(--color-cocoa);
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 500px;
}

.hero-price {
  font-size: 16px;
  color: var(--color-burgundy);
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 24px;
}

.hero-cta-label {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-cocoa);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.hero-cta-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.gift-link {
  display: inline-block;
  margin-top: 16px;
  font-size: 15px;
  color: var(--color-burgundy);
  text-decoration: none;
  border-bottom: 1px dashed var(--color-burgundy);
  transition: opacity 0.3s;
  cursor: pointer;
}

.gift-link:hover {
  opacity: 0.7;
}

.hero-visual {
  width: 520px;
  height: 520px;
  border-radius: 32px;
  overflow: hidden;
  flex-shrink: 0;
}

.hero-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.15);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 36px;
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 28px;
  transition: all 0.4s ease-out;
  cursor: pointer;
  border: none;
  outline: none;
  text-decoration: none;
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-primary {
  background: var(--color-burgundy);
  color: var(--color-white);
  box-shadow: 0 4px 20px rgba(139, 58, 74, 0.3);
}

.btn-primary:hover {
  background: var(--color-burgundy-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(139, 58, 74, 0.4);
}

.btn-outline {
  background: transparent;
  color: var(--color-burgundy);
  border: 2px solid var(--color-burgundy);
}

.btn-outline:hover {
  background: var(--color-burgundy);
  color: var(--color-white);
  transform: translateY(-2px);
}

.btn-white {
  background: var(--color-white);
  color: var(--color-burgundy);
  border: none;
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 255, 255, 0.3);
}

.btn-white-outline {
  background: transparent;
  color: var(--color-white);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn-white-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-white);
  transform: translateY(-2px);
}

/* Sections */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.tagline {
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--color-burgundy);
  margin-bottom: 16px;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 400;
  color: var(--color-rich-ebony);
  margin-bottom: 16px;
}

.section-desc {
  font-size: 18px;
  color: var(--color-cocoa);
}

/* Reviews */
.reviews {
  padding: 32px 80px;
  background: var(--color-soft-ivory);
}

.reviews .section-header {
  margin-bottom: 16px;
}

.reviews .section-header h2 {
  font-size: 28px;
}

.reviews-grid {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto;
}

.review-card {
  background: var(--color-white);
  border-radius: 12px;
  padding: 20px 24px;
  max-width: 280px;
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(45, 36, 32, 0.05);
}

.review-stars {
  display: flex;
  gap: 2px;
  font-size: 14px;
}

.review-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-cocoa);
  flex: 1;
}

/* How It Works */
.how-it-works {
  padding: 100px 80px;
  background: var(--color-white);
}

.steps {
  display: flex;
  justify-content: center;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.step-card {
  width: 360px;
  padding: 32px;
  background: var(--color-porcelain);
  border-radius: 24px;
}

.step-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: var(--color-burgundy);
}

.step-icon svg {
  width: 100%;
  height: 100%;
}

.step-num {
  display: block;
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-burgundy);
  margin-bottom: 12px;
}

.step-card h3 {
  font-family: var(--font-body);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-rich-ebony);
  margin-bottom: 12px;
}

.step-card p {
  font-size: 16px;
  color: var(--color-cocoa);
  line-height: 1.6;
}

/* Why Join */
.why-join {
  padding: 100px 80px;
  background: var(--color-porcelain);
}

.benefits-grid {
  display: flex;
  justify-content: center;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.benefit-card {
  width: 360px;
  padding: 32px;
  background: var(--color-white);
  border-radius: 24px;
}

.benefit-icon {
  width: 64px;
  height: 64px;
  background: var(--color-blush);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: var(--color-burgundy);
}

.benefit-icon svg {
  width: 28px;
  height: 28px;
}

.benefit-card h3 {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-rich-ebony);
  margin-bottom: 12px;
}

.benefit-card p {
  font-size: 16px;
  color: var(--color-cocoa);
  line-height: 1.6;
}

.skin-banner {
  width: 100%;
  max-width: 700px;
  margin: 60px auto 0;
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
}

.skin-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

/* Experts */
.experts {
  padding: 100px 80px;
  background: var(--color-white);
}

.experts-grid {
  display: flex;
  justify-content: center;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.expert-card {
  width: 280px;
  text-align: center;
}

.expert-photo {
  width: 180px;
  height: 180px;
  border-radius: 90px;
  overflow: hidden;
  margin: 0 auto 20px;
}

.expert-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 15%;
}

.expert-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-rich-ebony);
  margin-bottom: 4px;
}

.expert-role {
  display: block;
  font-size: 15px;
  color: var(--color-burgundy);
  margin-bottom: 12px;
}

.expert-card p {
  font-size: 14px;
  color: var(--color-cocoa);
  line-height: 1.5;
}

/* AI Trust */
.ai-trust {
  padding: 100px 80px;
  background: var(--color-blush);
}

.ai-two-columns {
  display: flex;
  gap: 60px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: flex-start;
}

.ai-column {
  flex: 1;
}

.ai-column-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  color: var(--color-rich-ebony);
  margin-bottom: 28px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-burgundy);
  display: inline-block;
}

.ai-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.ai-step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-burgundy);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.ai-step p {
  font-size: 17px;
  color: var(--color-cocoa);
  line-height: 1.6;
  margin: 0;
  padding-top: 5px;
}

.ai-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-benefits li {
  font-size: 17px;
  color: var(--color-cocoa);
  line-height: 1.6;
  padding-left: 28px;
  position: relative;
}

.ai-benefits li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-burgundy);
  opacity: 0.7;
}

/* Telegram Flow */
.telegram-flow {
  padding: 100px 80px;
  background: var(--color-white);
}

.telegram-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 1100px;
  margin: 0 auto;
}

.phone-mockup {
  width: 320px;
  height: 640px;
  background: #1A1A1A;
  border-radius: 40px;
  padding: 12px;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: var(--color-white);
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tg-header {
  background: #229ED9;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tg-avatar {
  width: 40px;
  height: 40px;
  background: var(--color-burgundy);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-white);
}

.tg-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-white);
}

.tg-chat {
  flex: 1;
  background: #E5DDD5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tg-message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
}

.tg-message.bot {
  background: var(--color-white);
  border-bottom-left-radius: 4px;
  align-self: flex-start;
}

.tg-message.user {
  background: #DCF8C6;
  border-bottom-right-radius: 4px;
  align-self: flex-end;
}

.tg-message p {
  font-size: 14px;
  color: var(--color-rich-ebony);
  line-height: 1.4;
}

.tg-photo {
  width: 140px;
  height: 100px;
  background: linear-gradient(135deg, #E8B4B8 0%, #D4A574 100%);
  border-radius: 8px;
}

.telegram-features {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: var(--color-blush);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-burgundy);
}

.feature-icon svg {
  width: 24px;
  height: 24px;
}

.feature-text h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-rich-ebony);
  margin-bottom: 4px;
}

.feature-text p {
  font-size: 15px;
  color: var(--color-cocoa);
}

/* Final CTA */
.final-cta {
  padding: 120px 80px;
  background: var(--color-burgundy);
  text-align: center;
}

.final-cta h2 {
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 400;
  color: var(--color-white);
  margin-bottom: 16px;
}

.cta-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-note {
  display: block;
  margin-top: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.cta-gift-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 32px;
  padding: 14px 28px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  color: var(--color-white);
  font-size: 15px;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s;
}

.cta-gift-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

/* Footer */
.footer {
  padding: 60px 80px;
  background: var(--color-dark);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.footer-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.footer-links a,
.footer-links span {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--color-white);
}

/* Responsive */
@media (max-width: 1200px) {
  .header-content,
  .hero,
  .reviews,
  .how-it-works,
  .why-join,
  .experts,
  .ai-trust,
  .telegram-flow,
  .final-cta,
  .footer {
    padding-left: 40px;
    padding-right: 40px;
  }

  .hero-visual {
    width: 400px;
    height: 400px;
  }

  .steps,
  .benefits-grid {
    flex-wrap: wrap;
  }

  .step-card,
  .benefit-card {
    width: calc(50% - 16px);
  }
}

@media (max-width: 900px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-visual {
    width: 100%;
    max-width: 400px;
    height: 350px;
  }

  .ai-two-columns,
  .telegram-content {
    flex-direction: column;
  }

  .ai-column {
    text-align: center;
  }

  .ai-column-title {
    display: block;
  }

  .ai-step {
    text-align: left;
  }

  .ai-benefits li {
    text-align: left;
  }

  .experts-grid {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .mobile-cta {
    display: block;
  }

  .header-content {
    padding: 0 20px;
    height: 64px;
  }

  .hero {
    padding: 100px 24px 60px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .hero h1 br {
    display: none;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-subtitle br {
    display: none;
  }

  .section-header h2 {
    font-size: 32px;
  }

  .step-card,
  .benefit-card {
    width: 100%;
  }

  .experts-grid {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    padding-bottom: 8px;
    margin: 0 -20px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .expert-card {
    min-width: 220px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }

  .phone-mockup {
    width: 280px;
    height: 560px;
  }

  .telegram-features {
    width: 100%;
    padding: 0 20px;
  }

  .final-cta h2 {
    font-size: 32px;
  }

  .footer-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .footer-links {
    flex-direction: column;
    gap: 16px;
  }
}

/* Review images */
.review-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s;
}

.review-image:hover {
  opacity: 0.85;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  font-size: 28px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: background 0.2s;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
}

/* Payment banner */
.payment-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 36, 32, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.payment-banner {
  background: var(--color-porcelain, #FAF8F5);
  border-radius: 24px;
  max-width: 460px;
  width: 100%;
  padding: 40px 32px 32px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 60px rgba(45, 36, 32, 0.2);
}

.payment-banner-close {
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
}

.payment-banner-icon {
  color: var(--color-burgundy, #8B3A4A);
  margin-bottom: 16px;
}

.payment-banner h2 {
  font-family: var(--font-display, 'Playfair Display', serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--color-rich-ebony, #2D2420);
  margin-bottom: 12px;
}

.payment-banner p {
  font-size: 16px;
  color: var(--color-cocoa, #5C4A3D);
  line-height: 1.6;
  margin-bottom: 12px;
}

.payment-banner-note {
  font-size: 14px !important;
  opacity: 0.7;
}

.payment-banner-btn {
  margin-top: 20px;
  padding: 14px 40px;
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

.payment-banner-btn:hover {
  background: var(--color-burgundy-dark, #6E2E3B);
}

.payment-banner-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Gift modal */
.gift-form {
  margin: 20px 0 8px;
}

.gift-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-warm-nude, #E8DED4);
  border-radius: 12px;
  font-size: 16px;
  font-family: var(--font-body, 'Manrope', sans-serif);
  color: var(--color-rich-ebony, #2D2420);
  background: var(--color-white, #fff);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.gift-input:focus {
  border-color: var(--color-burgundy, #8B3A4A);
}

.gift-input::placeholder {
  color: var(--color-cocoa, #5C4A3D);
  opacity: 0.5;
}

.gift-error {
  color: #c0392b;
  font-size: 14px;
  margin: 8px 0 0;
}

.gift-code-box {
  background: var(--color-soft-ivory, #F5F0EB);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  cursor: pointer;
  transition: background 0.2s;
}

.gift-code-box:hover {
  background: var(--color-warm-nude, #E8DED4);
}

.gift-code {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-burgundy, #8B3A4A);
  letter-spacing: 3px;
  margin-bottom: 4px;
}

.gift-code-hint {
  display: block;
  font-size: 12px;
  color: var(--color-cocoa, #5C4A3D);
  opacity: 0.6;
}

@media (max-width: 480px) {
  .header {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .logo-img {
    height: 44px;
  }

  .logo-img-footer {
    height: 36px;
  }

  .hero {
    padding: 90px 20px 48px;
  }

  .hero h1 {
    font-size: 28px;
    margin-bottom: 16px;
  }

  .badge {
    font-size: 11px;
    padding: 6px 12px;
  }

  .hero-visual {
    height: 280px;
    border-radius: 20px;
  }

  .btn {
    padding: 16px 28px;
    font-size: 15px;
    justify-content: center;
  }

  .hero-cta-buttons {
    flex-direction: column;
  }

  .hero-cta-buttons .btn {
    width: 100%;
  }

  .gift-link {
    display: block;
    text-align: center;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-buttons .btn {
    width: 100%;
    max-width: 300px;
  }

  .reviews,
  .how-it-works,
  .why-join,
  .experts,
  .ai-trust,
  .telegram-flow {
    padding: 60px 20px;
  }

  .reviews-grid {
    flex-direction: column;
    align-items: center;
  }

  .review-card {
    max-width: 100%;
    min-width: 0;
  }

  .section-header {
    margin-bottom: 40px;
  }

  .section-header h2 {
    font-size: 26px;
  }

  .section-desc {
    font-size: 15px;
  }

  .step-card,
  .benefit-card {
    padding: 24px;
    border-radius: 20px;
  }

  .step-card h3,
  .benefit-card h3 {
    font-size: 18px;
  }

  .step-card p,
  .benefit-card p {
    font-size: 14px;
  }

  .expert-photo {
    width: 140px;
    height: 140px;
  }

  .expert-card h3 {
    font-size: 18px;
  }

  .ai-two-columns {
    gap: 40px;
  }

  .phone-mockup {
    width: 260px;
    height: 500px;
    border-radius: 32px;
    padding: 8px;
  }

  .phone-screen {
    border-radius: 26px;
  }

  .feature {
    gap: 12px;
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .feature-text h4 {
    font-size: 16px;
  }

  .feature-text p {
    font-size: 14px;
  }

  .final-cta {
    padding: 60px 24px;
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  }

  .final-cta h2 {
    font-size: 26px;
    margin-bottom: 12px;
  }

  .cta-subtitle {
    font-size: 16px;
    margin-bottom: 32px;
  }

  .footer {
    padding: 40px 20px;
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
