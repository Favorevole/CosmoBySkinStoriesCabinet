<template>
  <div class="landing">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">SKIN.STORIES</div>
        <nav class="nav">
          <a href="#how-it-works">О нас</a>
          <a href="#how-it-works">Как это работает</a>
          <a href="#team">Специалисты</a>
          <a href="#form">Контакты</a>
          <a :href="telegramBotLink" target="_blank" class="nav-cta">Записаться</a>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-overlay">
        <span class="tagline">КАЖДАЯ ЛИНИЯ — ИСТОРИЯ</span>
        <h1>Персональные консультации<br>по уходу за кожей</h1>
        <p class="subtitle">Получите профессиональные рекомендации от квалифицированных специалистов<br>онлайн через Telegram</p>
        <div class="hero-buttons">
          <a :href="telegramBotLink" target="_blank" class="btn btn-primary">Начать консультацию</a>
          <a href="#how-it-works" class="btn btn-secondary">Узнать больше</a>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-header">
        <span class="tagline">ПРОЦЕСС</span>
        <h2>Как это работает</h2>
        <p class="section-desc">Простой путь к здоровой и красивой коже</p>
      </div>
      <div class="steps">
        <div class="step-card">
          <span class="step-num">01</span>
          <h3>Заполните анкету</h3>
          <p>Ответьте на несколько вопросов о вашей коже и текущем уходе</p>
        </div>
        <div class="step-card">
          <span class="step-num">02</span>
          <h3>Загрузите фото</h3>
          <p>Прикрепите 2-6 фотографий вашей кожи для анализа</p>
        </div>
        <div class="step-card">
          <span class="step-num">03</span>
          <h3>Анализ специалиста</h3>
          <p>Наш косметолог изучит вашу анкету и фотографии</p>
        </div>
        <div class="step-card">
          <span class="step-num">04</span>
          <h3>Получите план</h3>
          <p>Персональные рекомендации по уходу и подбору средств</p>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="benefits">
      <div class="benefits-content">
        <span class="tagline">ПРЕИМУЩЕСТВА</span>
        <h2>Почему выбирают нас</h2>
        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Квалифицированные специалисты</h4>
              <p>Консультации от опытных дерматологов и косметологов</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Удобный формат</h4>
              <p>Через Telegram — консультация там, где вам удобно</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Быстрый результат</h4>
              <p>Рекомендации в течение 24-48 часов</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Индивидуальный подход</h4>
              <p>Учитываем особенности именно вашей кожи</p>
            </div>
          </div>
        </div>
      </div>
      <div class="benefits-image"></div>
    </section>

    <!-- Concept -->
    <section class="concept">
      <div class="section-header">
        <span class="tagline tagline-dark">КОНЦЕПТ</span>
        <h2 class="dark-text">Кожа как микроландшафт</h2>
        <p class="section-desc dark-text">Каждая пора — отпечаток времени. Мы видим красоту в деталях и помогаем<br>раскрыть потенциал вашей кожи.</p>
      </div>
      <div class="concept-grid">
        <div class="concept-img concept-img-1"></div>
        <div class="concept-img concept-img-2"></div>
        <div class="concept-img concept-img-3"></div>
        <div class="concept-img concept-img-4"></div>
      </div>
    </section>

    <!-- Target Audience -->
    <section class="target">
      <div class="section-header">
        <span class="tagline">ДЛЯ КОГО</span>
        <h2>Кому подойдёт наш сервис</h2>
      </div>
      <div class="target-grid">
        <div class="target-card">
          <svg class="target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-4-3-4 3 1.5-4.5-3.5-2.5h4.5z"/>
          </svg>
          <h4>Начинающим</h4>
          <p>Тем, кто не знает с чего начать уход за кожей</p>
        </div>
        <div class="target-card">
          <svg class="target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <h4>Ищущим решение</h4>
          <p>Тем, кто столкнулся с проблемами кожи</p>
        </div>
        <div class="target-card">
          <svg class="target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <h4>Экспертам</h4>
          <p>Тем, кто хочет профессиональную оценку текущего ухода</p>
        </div>
        <div class="target-card">
          <svg class="target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h4>Заботливым</h4>
          <p>Тем, кто хочет подобрать правильный уход</p>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section id="team" class="team">
      <div class="section-header">
        <span class="tagline">КОМАНДА</span>
        <h2>Наши специалисты</h2>
        <p class="section-desc">Квалифицированные косметологи и дерматологи с многолетним опытом</p>
      </div>
      <div class="team-grid">
        <div class="specialist">
          <div class="specialist-img specialist-img-1"></div>
          <h4>Анна Петрова</h4>
          <p>Косметолог-эстетист</p>
        </div>
        <div class="specialist">
          <div class="specialist-img specialist-img-2"></div>
          <h4>Елена Козырева</h4>
          <p>Дерматолог</p>
        </div>
        <div class="specialist">
          <div class="specialist-img specialist-img-3"></div>
          <h4>Мария Иванова</h4>
          <p>Мастер по лицу и телу</p>
        </div>
        <div class="specialist">
          <div class="specialist-img specialist-img-4"></div>
          <h4>Ольга Смирнова</h4>
          <p>Косметолог-эстетист</p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <h2>Готовы начать свой путь<br>к здоровой коже?</h2>
      <p class="cta-subtitle">Получите персональные рекомендации от наших специалистов</p>
      <div class="cta-buttons">
        <a :href="telegramBotLink" target="_blank" class="btn btn-primary">Начать консультацию</a>
        <a :href="telegramBotLink" target="_blank" class="btn btn-secondary-light">Написать в Telegram</a>
      </div>
      <span class="cta-trust">Ответ в течение 24-48 часов</span>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-main">
        <div class="footer-brand">
          <div class="footer-logo">SKIN.STORIES</div>
          <p>Персональные консультации по уходу за кожей от квалифицированных специалистов</p>
        </div>
        <div class="footer-nav">
          <div class="footer-col">
            <h5>Навигация</h5>
            <a href="#how-it-works">О нас</a>
            <a href="#how-it-works">Как это работает</a>
            <a href="#team">Специалисты</a>
            <a href="#form">Контакты</a>
          </div>
          <div class="footer-col">
            <h5>Контакты</h5>
            <a :href="telegramBotLink" target="_blank">Telegram: @skinstories_bot</a>
            <a href="mailto:hello@skin.stories">Email: hello@skin.stories</a>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <span>© 2024 Skin.Stories. Все права защищены.</span>
        <div class="footer-social">
          <a :href="telegramBotLink" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="m22 2-11 11"/></svg>
          </a>
          <a href="#" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const telegramBotLink = 'https://t.me/CosmobySkinStoriesClient_bot';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@400;500;600&display=swap');

:root {
  --bg-primary: #1A1A1C;
  --bg-surface: #242426;
  --bg-maroon: #5D1A2D;
  --bg-cream: #F5EDE6;

  --text-primary: #F5F5F0;
  --text-secondary: #A0A0A0;
  --text-muted: #6E6E70;
  --text-dark: #1A1A1C;

  --accent-gold: #C9A962;
  --accent-beige: #D4B5A0;

  --border-subtle: #3A3A3C;

  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Inter', sans-serif;
}
</style>

<style scoped>
.landing {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(26, 26, 28, 0.95);
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 120px;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 3px;
  color: var(--text-primary);
}

.nav {
  display: flex;
  align-items: center;
  gap: 48px;
}

.nav a {
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.nav a:hover {
  color: var(--text-primary);
}

.nav-cta {
  padding: 12px 24px;
  border: 1px solid var(--accent-gold);
  border-radius: 4px;
  color: var(--accent-gold) !important;
  font-weight: 500;
}

.nav-cta:hover {
  background: var(--accent-gold);
  color: var(--bg-primary) !important;
}

/* Hero */
.hero {
  min-height: 800px;
  background: linear-gradient(180deg, rgba(26,26,28,0) 0%, rgba(26,26,28,1) 100%),
              url('https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=1920&q=80') center/cover;
  display: flex;
  align-items: flex-end;
}

.hero-overlay {
  width: 100%;
  padding: 120px;
  padding-top: 200px;
}

.tagline {
  display: block;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 4px;
  color: var(--accent-gold);
  margin-bottom: 16px;
}

.tagline-dark {
  color: var(--bg-maroon);
}

.hero h1 {
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 300;
  line-height: 1.1;
  margin-bottom: 24px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 600px;
  margin-bottom: 32px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
}

.btn {
  display: inline-block;
  padding: 18px 40px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: var(--accent-gold);
  color: var(--bg-primary);
}

.btn-primary:hover {
  background: #D4B06A;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.btn-secondary-light {
  background: transparent;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
}

/* How it works */
.how-it-works {
  padding: 120px;
  background: var(--bg-primary);
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 400;
  margin: 16px 0;
}

.section-desc {
  font-size: 18px;
  color: var(--text-muted);
}

.dark-text {
  color: var(--text-dark);
}

.steps {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.step-card {
  width: 260px;
  background: var(--bg-surface);
  padding: 32px;
  border-radius: 8px;
}

.step-num {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 300;
  color: var(--accent-gold);
  display: block;
  margin-bottom: 20px;
}

.step-card h3 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 12px;
}

.step-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* Benefits */
.benefits {
  display: flex;
  min-height: 600px;
  background: var(--bg-maroon);
}

.benefits-content {
  flex: 1;
  padding: 100px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.benefits h2 {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 400;
  margin: 16px 0 40px;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.benefit-dash {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--accent-gold);
}

.benefit-text h4 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 8px;
}

.benefit-text p {
  font-size: 14px;
  color: var(--accent-beige);
  line-height: 1.5;
}

.benefits-image {
  width: 600px;
  background: url('https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80') center/cover;
}

/* Concept */
.concept {
  padding: 100px 120px;
  background: var(--bg-cream);
}

.concept-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.concept-img {
  width: 280px;
  height: 350px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
}

.concept-img-1 { background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'); }
.concept-img-2 { background-image: url('https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80'); }
.concept-img-3 { background-image: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'); }
.concept-img-4 { background-image: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'); }

/* Target */
.target {
  padding: 100px 120px;
  background: var(--bg-primary);
}

.target-grid {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.target-card {
  width: 260px;
  background: var(--bg-surface);
  padding: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

.target-icon {
  width: 32px;
  height: 32px;
  color: var(--accent-gold);
  margin-bottom: 16px;
}

.target-card h4 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 12px;
}

.target-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Team */
.team {
  padding: 100px 120px;
  background: var(--bg-surface);
}

.team-grid {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.specialist {
  width: 270px;
  text-align: center;
}

.specialist-img {
  width: 270px;
  height: 320px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  margin-bottom: 16px;
}

.specialist-img-1 { background-image: url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80'); }
.specialist-img-2 { background-image: url('https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80'); }
.specialist-img-3 { background-image: url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80'); }
.specialist-img-4 { background-image: url('https://images.unsplash.com/photo-1580281657702-257584239a55?w=400&q=80'); }

.specialist h4 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 8px;
}

.specialist p {
  font-size: 14px;
  color: var(--text-muted);
}

/* Final CTA */
.final-cta {
  padding: 120px;
  background: var(--bg-maroon);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.final-cta h2 {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 24px;
}

.cta-subtitle {
  font-size: 18px;
  color: var(--accent-beige);
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.cta-trust {
  font-size: 14px;
  color: #A08070;
}

/* Footer */
.footer {
  padding: 80px 120px 40px;
  background: var(--bg-primary);
}

.footer-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 60px;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 3px;
  margin-bottom: 20px;
}

.footer-brand p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.footer-nav {
  display: flex;
  gap: 80px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-col h5 {
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-gold);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.footer-col a {
  font-size: 14px;
  color: var(--text-muted);
  transition: color 0.2s;
}

.footer-col a:hover {
  color: var(--text-primary);
}

.footer-divider {
  height: 1px;
  background: var(--border-subtle);
  margin-bottom: 40px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom span {
  font-size: 13px;
  color: #4A4A4C;
}

.footer-social {
  display: flex;
  gap: 20px;
}

.footer-social a {
  color: var(--text-muted);
  transition: color 0.2s;
}

.footer-social a:hover {
  color: var(--text-primary);
}

.footer-social svg {
  width: 20px;
  height: 20px;
}

/* Responsive */
@media (max-width: 1200px) {
  .header-content,
  .hero-overlay,
  .how-it-works,
  .concept,
  .target,
  .team,
  .final-cta,
  .footer {
    padding-left: 40px;
    padding-right: 40px;
  }

  .benefits-content {
    padding: 60px 40px;
  }

  .benefits-image {
    width: 400px;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .hero h1 {
    font-size: 40px;
  }

  .section-header h2,
  .benefits h2 {
    font-size: 36px;
  }

  .final-cta h2 {
    font-size: 36px;
  }

  .benefits {
    flex-direction: column;
  }

  .benefits-image {
    width: 100%;
    height: 300px;
  }

  .steps,
  .target-grid,
  .team-grid,
  .concept-grid {
    flex-direction: column;
    align-items: center;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .footer-main {
    flex-direction: column;
    gap: 40px;
  }

  .footer-nav {
    flex-direction: column;
    gap: 32px;
  }
}

/* Mobile-first design - iOS HIG compliant */
@media (max-width: 480px) {
  /* Header - compact with safe area */
  .header {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .header-content {
    padding: 0 16px;
    height: 60px;
  }

  .logo {
    font-size: 18px;
    letter-spacing: 2px;
  }

  /* Hero - full screen mobile optimized */
  .hero {
    min-height: 100vh;
    min-height: 100dvh;
  }

  .hero-overlay {
    padding: 24px;
    padding-top: 100px;
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .tagline {
    font-size: 11px;
    letter-spacing: 3px;
    margin-bottom: 12px;
  }

  .hero h1 {
    font-size: 32px;
    margin-bottom: 16px;
  }

  .hero h1 br {
    display: none;
  }

  .subtitle {
    font-size: 15px;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .subtitle br {
    display: none;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 12px;
  }

  /* Buttons - touch friendly */
  .btn {
    padding: 16px 32px;
    font-size: 15px;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .btn:active {
    transform: scale(0.98);
  }

  /* How it works */
  .how-it-works {
    padding: 60px 20px;
  }

  .section-header {
    margin-bottom: 40px;
  }

  .section-header h2 {
    font-size: 28px;
    margin: 12px 0;
  }

  .section-desc {
    font-size: 15px;
    padding: 0 10px;
  }

  .section-desc br {
    display: none;
  }

  .steps {
    gap: 16px;
    width: 100%;
  }

  .step-card {
    width: 100%;
    padding: 24px;
    border-radius: 12px;
  }

  .step-num {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .step-card h3 {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .step-card p {
    font-size: 14px;
  }

  /* Benefits */
  .benefits {
    flex-direction: column;
  }

  .benefits-content {
    padding: 48px 20px;
  }

  .benefits h2 {
    font-size: 28px;
    margin: 12px 0 32px;
  }

  .benefits-list {
    gap: 20px;
  }

  .benefit-item {
    gap: 12px;
  }

  .benefit-dash {
    font-size: 20px;
  }

  .benefit-text h4 {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .benefit-text p {
    font-size: 14px;
  }

  .benefits-image {
    width: 100%;
    height: 280px;
  }

  /* Concept */
  .concept {
    padding: 60px 20px;
  }

  .concept-grid {
    gap: 12px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .concept-img {
    width: 100%;
    height: 180px;
    border-radius: 8px;
  }

  /* Target */
  .target {
    padding: 60px 20px;
  }

  .target-grid {
    gap: 12px;
    width: 100%;
  }

  .target-card {
    width: 100%;
    padding: 24px;
    border-radius: 12px;
  }

  .target-icon {
    width: 28px;
    height: 28px;
    margin-bottom: 12px;
  }

  .target-card h4 {
    font-size: 18px;
    margin-bottom: 8px;
  }

  .target-card p {
    font-size: 14px;
  }

  /* Team */
  .team {
    padding: 60px 20px;
  }

  .team-grid {
    gap: 24px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .specialist {
    width: 100%;
  }

  .specialist-img {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .specialist h4 {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .specialist p {
    font-size: 12px;
  }

  /* Final CTA */
  .final-cta {
    padding: 60px 24px;
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
    min-height: auto;
  }

  .final-cta h2 {
    font-size: 28px;
    margin-bottom: 16px;
  }

  .final-cta h2 br {
    display: none;
  }

  .cta-subtitle {
    font-size: 15px;
    margin-bottom: 32px;
  }

  .cta-buttons {
    width: 100%;
    gap: 12px;
  }

  .cta-buttons .btn {
    width: 100%;
  }

  .cta-trust {
    font-size: 13px;
    margin-top: 8px;
  }

  /* Footer */
  .footer {
    padding: 48px 20px 24px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  }

  .footer-main {
    flex-direction: column;
    gap: 32px;
    margin-bottom: 32px;
  }

  .footer-brand {
    max-width: 100%;
  }

  .footer-logo {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .footer-brand p {
    font-size: 13px;
  }

  .footer-nav {
    flex-direction: column;
    gap: 24px;
  }

  .footer-col {
    gap: 12px;
  }

  .footer-col h5 {
    font-size: 11px;
    margin-bottom: 4px;
  }

  .footer-col a {
    font-size: 14px;
    padding: 4px 0;
  }

  .footer-divider {
    margin-bottom: 24px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .footer-bottom span {
    font-size: 12px;
  }

  .footer-social {
    gap: 24px;
  }

  .footer-social svg {
    width: 24px;
    height: 24px;
  }
}
</style>
