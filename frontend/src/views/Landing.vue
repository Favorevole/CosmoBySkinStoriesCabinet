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
          <a :href="telegramBotLink" target="_blank" class="nav-cta">Начать</a>
        </nav>
        <a :href="telegramBotLink" target="_blank" class="mobile-cta">Начать</a>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <span class="badge">AI Research Phase</span>
          <h1>Мы обучаем AI<br>понимать настоящую кожу</h1>
          <p class="hero-subtitle">Загрузите фото кожи через Telegram.<br>Получите экспертные рекомендации — пока наш AI учится.</p>
          <a :href="telegramBotLink" target="_blank" class="btn btn-primary">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="m22 2-11 11"/></svg>
            Загрузить фото в Telegram
          </a>
        </div>
        <div class="hero-visual">
          <img src="/hero.png" alt="Skin care" />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-header">
        <span class="tagline">ПРОЦЕСС</span>
        <h2>Как это работает</h2>
        <p class="section-desc">Три простых шага к персональным рекомендациям</p>
      </div>
      <div class="steps">
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <span class="step-num">01</span>
          <h3>Загрузите фото</h3>
          <p>Отправьте фото кожи в наш Telegram-бот</p>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span class="step-num">02</span>
          <h3>Эксперты анализируют</h3>
          <p>Косметологи изучают ваше фото и дают рекомендации</p>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 0 1 4-4z"/><path d="M12 8v6"/><path d="M8 14h8"/><circle cx="12" cy="18" r="4"/><path d="M12 14v4"/></svg>
          </div>
          <span class="step-num">03</span>
          <h3>AI учится</h3>
          <p>Ваши данные помогают обучить умного помощника</p>
        </div>
      </div>
    </section>

    <!-- Why Join -->
    <section class="why-join">
      <div class="section-header">
        <span class="tagline">ЗАЧЕМ УЧАСТВОВАТЬ</span>
        <h2>Почему стоит присоединиться</h2>
        <p class="section-desc">Стань частью Skin Stories — проекта, который создаёт новую эпоху ухода за кожей через реальные данные и экспертные знания</p>
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
          <h3>Этичный AI</h3>
          <p>Помогаете создать AI, который понимает разнообразие типов кожи, а не только идеальные фото</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          </div>
          <h3>Бесплатные рекомендации</h3>
          <p>Получаете персональные советы по уходу за кожей в благодарность за участие</p>
        </div>
      </div>
      <div class="skin-banner">
        <img src="/skin-section.png" alt="Skin care" />
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
            <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80" alt="Мария Иванова" />
          </div>
          <h3>Мария Иванова</h3>
          <span class="expert-role">Дерматолог, к.м.н.</span>
          <p>Эксперт по заболеваниям кожи и восстановлению кожного барьера</p>
        </div>
        <div class="expert-card">
          <div class="expert-photo">
            <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80" alt="Елена Петрова" />
          </div>
          <h3>Елена Петрова</h3>
          <span class="expert-role">Косметолог-эстетист</span>
          <p>Специалист по пигментации и текстуре кожи</p>
        </div>
      </div>
    </section>

    <!-- AI Trust -->
    <section id="about" class="ai-trust">
      <div class="section-header">
        <span class="tagline">ЧЕСТНОСТЬ</span>
        <h2>Мы честны о нашем AI</h2>
      </div>
      <div class="ai-content">
        <div class="ai-text">
          <p class="ai-highlight">Наш AI ещё учится. Мы не притворяемся, что он идеален.</p>
          <p>Каждое загруженное фото помогает нашей модели лучше понимать реальную кожу — с её текстурами, оттенками и особенностями. Пока AI обучается, ваши снимки анализируют живые эксперты.</p>
          <p>В будущем вы получите доступ к умному AI-помощнику, который знает вашу кожу — потому что учился на реальных данных, а не на отфотошопленных картинках.</p>
        </div>
        <div class="ai-visual">
          <div class="neural-animation">
            <div class="node n1"></div>
            <div class="node n2"></div>
            <div class="node n3"></div>
            <div class="node n4"></div>
            <div class="node n5"></div>
            <div class="connection c1"></div>
            <div class="connection c2"></div>
            <div class="connection c3"></div>
            <div class="connection c4"></div>
          </div>
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
                <p>Привет! 👋 Отправьте фото вашей кожи, и наши эксперты проанализируют его.</p>
              </div>
              <div class="tg-message user">
                <div class="tg-photo"></div>
              </div>
              <div class="tg-message bot">
                <p>Отлично! Фото получено ✓ Наш эксперт проанализирует его в течение 24 часов.</p>
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
      <h2>Готовы помочь AI понять кожу?</h2>
      <p class="cta-subtitle">Загрузите фото — получите экспертный анализ бесплатно</p>
      <a :href="telegramBotLink" target="_blank" class="btn btn-white">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="m22 2-11 11"/></svg>
        Открыть Telegram
      </a>
      <span class="cta-note">Бесплатно • Конфиденциально • Без регистрации</span>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo logo-footer">
            <img src="/logo.jpg" alt="Skin Stories" class="logo-img logo-img-footer" />
          </div>
        </div>
        <div class="footer-links">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Условия использования</a>
          <span>© 2024 Skin.Stories</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const telegramBotLink = 'https://t.me/CosmobySkinStoriesClient_bot';
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
  border-radius: 28px;
  transition: all 0.4s ease-out;
  cursor: pointer;
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

.btn-white {
  background: var(--color-white);
  color: var(--color-burgundy);
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 255, 255, 0.3);
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
  max-width: 1000px;
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

.ai-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  max-width: 1100px;
  margin: 0 auto;
}

.ai-text {
  max-width: 560px;
}

.ai-highlight {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-rich-ebony);
  line-height: 1.5;
  margin-bottom: 24px;
}

.ai-text p {
  font-size: 17px;
  color: var(--color-cocoa);
  line-height: 1.7;
  margin-bottom: 16px;
}

.ai-visual {
  width: 400px;
  height: 300px;
  background: var(--color-white);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.neural-animation {
  position: relative;
  width: 200px;
  height: 200px;
}

.node {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--color-burgundy);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.n1 { top: 20%; left: 10%; animation-delay: 0s; }
.n2 { top: 10%; left: 50%; animation-delay: 0.3s; }
.n3 { top: 30%; left: 80%; animation-delay: 0.6s; }
.n4 { top: 70%; left: 30%; animation-delay: 0.9s; }
.n5 { top: 60%; left: 70%; animation-delay: 1.2s; }

.connection {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, var(--color-burgundy) 0%, transparent 100%);
  animation: connect 2s ease-in-out infinite;
}

.c1 { top: 25%; left: 15%; width: 80px; transform: rotate(15deg); }
.c2 { top: 20%; left: 55%; width: 60px; transform: rotate(45deg); }
.c3 { top: 55%; left: 35%; width: 70px; transform: rotate(-20deg); }
.c4 { top: 45%; left: 60%; width: 50px; transform: rotate(30deg); }

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
}

@keyframes connect {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
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

.cta-note {
  display: block;
  margin-top: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
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

  .ai-content,
  .telegram-content {
    flex-direction: column;
  }

  .ai-text {
    text-align: center;
  }

  .experts-grid {
    flex-wrap: wrap;
  }

  .expert-card {
    width: calc(50% - 20px);
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

  .expert-card {
    width: 100%;
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
    width: 100%;
    justify-content: center;
  }

  .how-it-works,
  .why-join,
  .experts,
  .ai-trust,
  .telegram-flow {
    padding: 60px 20px;
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

  .ai-visual {
    width: 100%;
    height: 200px;
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
