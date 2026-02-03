<template>
  <div class="landing">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">SKIN.STORIES</div>
        <nav class="nav">
          <a href="#services">Услуги</a>
          <a href="#how-it-works">Как это работает</a>
          <a href="#about">О клинике</a>
          <a href="#contacts">Контакты</a>
          <a :href="telegramBotLink" target="_blank" class="nav-cta">Записаться</a>
        </nav>
        <div class="mobile-contacts">
          <a href="tel:+79855376169" class="phone-link">+7 (985) 537-61-69</a>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-overlay">
        <span class="tagline">КОСМЕТОЛОГИЧЕСКАЯ КЛИНИКА</span>
        <h1>Skin Stories</h1>
        <p class="subtitle">Аппаратная и инъекционная косметология.<br>Персональный подход к красоте и здоровью вашей кожи.</p>
        <div class="hero-buttons">
          <a :href="telegramBotLink" target="_blank" class="btn btn-primary">Онлайн-консультация</a>
          <a href="tel:+79855376169" class="btn btn-secondary">+7 (985) 537-61-69</a>
        </div>
        <div class="hero-messengers">
          <span>Записаться через:</span>
          <a href="https://t.me/skinstories_clinic" target="_blank" class="messenger-link">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
            Telegram
          </a>
          <a href="https://wa.me/79855376169" target="_blank" class="messenger-link">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="services">
      <div class="section-header">
        <span class="tagline">УСЛУГИ</span>
        <h2>Наши процедуры</h2>
        <p class="section-desc">Современные методики аппаратной и инъекционной косметологии</p>
      </div>
      <div class="services-grid">
        <div class="service-card">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3>Аппаратная косметология</h3>
          <p>Vivace, Ultraformer, BBL Sciton, Fotona, Morpheus — передовое оборудование для омоложения и коррекции</p>
          <ul class="service-features">
            <li>RF-лифтинг</li>
            <li>SMAS-лифтинг</li>
            <li>Фотоомоложение</li>
            <li>Лазерные процедуры</li>
          </ul>
        </div>
        <div class="service-card">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
          </div>
          <h3>Ботулинотерапия</h3>
          <p>Популярный метод коррекции мимических морщин, устранения птоза и гипергидроза</p>
          <ul class="service-features">
            <li>Коррекция морщин</li>
            <li>Лифтинг бровей</li>
            <li>Лечение гипергидроза</li>
            <li>Устранение птоза</li>
          </ul>
        </div>
        <div class="service-card">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
            </svg>
          </div>
          <h3>Биоревитализация</h3>
          <p>Инъекционная процедура, направленная на глубокое увлажнение кожи гиалуроновой кислотой</p>
          <ul class="service-features">
            <li>Глубокое увлажнение</li>
            <li>Улучшение тургора</li>
            <li>Сияние кожи</li>
            <li>Anti-age эффект</li>
          </ul>
        </div>
        <div class="service-card">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/>
            </svg>
          </div>
          <h3>Контурная пластика</h3>
          <p>Моделирование черт лица с помощью филлеров на основе гиалуроновой кислоты</p>
          <ul class="service-features">
            <li>Увеличение губ</li>
            <li>Коррекция скул</li>
            <li>Моделирование подбородка</li>
            <li>Коррекция носа</li>
          </ul>
        </div>
        <div class="service-card">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>
            </svg>
          </div>
          <h3>Капельницы красоты</h3>
          <p>Внутривенные инфузии витаминов и антиоксидантов для сияния кожи изнутри</p>
          <ul class="service-features">
            <li>Детокс-программы</li>
            <li>Витаминные коктейли</li>
            <li>Anti-age терапия</li>
            <li>Восстановление</li>
          </ul>
        </div>
        <div class="service-card">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>
          <h3>Косметология для мужчин</h3>
          <p>Специализированные процедуры с учётом особенностей мужской кожи</p>
          <ul class="service-features">
            <li>Омоложение лица</li>
            <li>Коррекция морщин</li>
            <li>Лечение акне</li>
            <li>Уход за кожей</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-header">
        <span class="tagline">ПРОЦЕСС</span>
        <h2>Как записаться</h2>
        <p class="section-desc">Простой путь к красоте и здоровью кожи</p>
      </div>
      <div class="steps">
        <div class="step-card">
          <span class="step-num">01</span>
          <h3>Свяжитесь с нами</h3>
          <p>Через сайт, социальные сети или мессенджеры — выберите удобный способ</p>
        </div>
        <div class="step-card">
          <span class="step-num">02</span>
          <h3>Консультация</h3>
          <p>Получите консультацию от квалифицированных врачей-косметологов</p>
        </div>
        <div class="step-card">
          <span class="step-num">03</span>
          <h3>Процедура</h3>
          <p>Пройдите процедуру под контролем специалиста на профессиональном оборудовании</p>
        </div>
        <div class="step-card">
          <span class="step-num">04</span>
          <h3>Результат</h3>
          <p>Наслаждайтесь результатом и получите рекомендации по уходу</p>
        </div>
      </div>
    </section>

    <!-- Online Consultation -->
    <section class="online-consultation">
      <div class="online-content">
        <span class="tagline">ОНЛАЙН</span>
        <h2>Онлайн-консультация</h2>
        <p class="online-desc">Не можете приехать в клинику? Получите профессиональную консультацию онлайн через наш Telegram-бот.</p>
        <div class="online-features">
          <div class="online-feature">
            <span class="feature-num">1</span>
            <div>
              <h4>Заполните анкету</h4>
              <p>Ответьте на вопросы о коже и загрузите фото</p>
            </div>
          </div>
          <div class="online-feature">
            <span class="feature-num">2</span>
            <div>
              <h4>Анализ специалиста</h4>
              <p>Врач изучит вашу анкету и фотографии</p>
            </div>
          </div>
          <div class="online-feature">
            <span class="feature-num">3</span>
            <div>
              <h4>Получите рекомендации</h4>
              <p>Персональный план ухода за кожей</p>
            </div>
          </div>
        </div>
        <a :href="telegramBotLink" target="_blank" class="btn btn-primary">Начать онлайн-консультацию</a>
      </div>
      <div class="online-image"></div>
    </section>

    <!-- About / Benefits -->
    <section id="about" class="benefits">
      <div class="benefits-content">
        <span class="tagline">О КЛИНИКЕ</span>
        <h2>Почему выбирают Skin Stories</h2>
        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Современное оборудование</h4>
              <p>Vivace, Ultraformer, BBL Sciton, Fotona, Morpheus — только передовые технологии</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Квалифицированные врачи</h4>
              <p>Опытные специалисты с медицинским образованием и постоянным повышением квалификации</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Индивидуальный подход</h4>
              <p>Подбираем процедуры с учётом особенностей именно вашей кожи</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-dash">—</span>
            <div class="benefit-text">
              <h4>Комфортная атмосфера</h4>
              <p>Уютная клиника в центре Москвы с премиальным сервисом</p>
            </div>
          </div>
        </div>
      </div>
      <div class="benefits-image"></div>
    </section>

    <!-- Equipment -->
    <section class="equipment">
      <div class="section-header">
        <span class="tagline tagline-dark">ОБОРУДОВАНИЕ</span>
        <h2 class="dark-text">Передовые технологии</h2>
        <p class="section-desc dark-text">Используем только сертифицированное оборудование от мировых лидеров</p>
      </div>
      <div class="equipment-grid">
        <div class="equipment-item">
          <h4>Vivace</h4>
          <p>RF-микроигольчатая система для омоложения</p>
        </div>
        <div class="equipment-item">
          <h4>Ultraformer</h4>
          <p>SMAS-лифтинг без хирургического вмешательства</p>
        </div>
        <div class="equipment-item">
          <h4>BBL Sciton</h4>
          <p>Фотоомоложение и лечение пигментации</p>
        </div>
        <div class="equipment-item">
          <h4>Fotona</h4>
          <p>Лазерные процедуры для кожи и тела</p>
        </div>
        <div class="equipment-item">
          <h4>Morpheus</h4>
          <p>Фракционный RF для ремоделирования кожи</p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <h2>Запишитесь на консультацию</h2>
      <p class="cta-subtitle">Подберём процедуры индивидуально для вас</p>
      <div class="cta-buttons">
        <a href="tel:+79855376169" class="btn btn-primary">+7 (985) 537-61-69</a>
        <a :href="telegramBotLink" target="_blank" class="btn btn-secondary-light">Онлайн-консультация</a>
      </div>
      <div class="cta-messengers">
        <a href="https://t.me/skinstories_clinic" target="_blank">Telegram</a>
        <span>•</span>
        <a href="https://wa.me/79855376169" target="_blank">WhatsApp</a>
      </div>
    </section>

    <!-- Contacts -->
    <section id="contacts" class="contacts">
      <div class="contacts-info">
        <span class="tagline">КОНТАКТЫ</span>
        <h2>Как нас найти</h2>
        <div class="contact-details">
          <div class="contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
            <div>
              <h4>Адрес</h4>
              <p>Москва, ул. Садовническая, 5<br>БЦ «PARADISE PLACE»</p>
            </div>
          </div>
          <div class="contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
            </svg>
            <div>
              <h4>Телефон</h4>
              <p><a href="tel:+79855376169">+7 (985) 537-61-69</a></p>
            </div>
          </div>
          <div class="contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
            </svg>
            <div>
              <h4>Мессенджеры</h4>
              <p>
                <a href="https://t.me/skinstories_clinic" target="_blank">Telegram</a> •
                <a href="https://wa.me/79855376169" target="_blank">WhatsApp</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="contacts-map">
        <iframe
          src="https://yandex.ru/map-widget/v1/?um=constructor%3A8b8a8c8a8c8a8c8a&amp;source=constructor&amp;ll=37.631893%2C55.742793&amp;z=16&amp;pt=37.631893%2C55.742793"
          width="100%"
          height="100%"
          frameborder="0"
          style="filter: grayscale(100%) invert(92%) contrast(83%);"
        ></iframe>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-main">
        <div class="footer-brand">
          <div class="footer-logo">SKIN.STORIES</div>
          <p>Косметологическая клиника в центре Москвы. Аппаратная и инъекционная косметология.</p>
        </div>
        <div class="footer-nav">
          <div class="footer-col">
            <h5>Навигация</h5>
            <a href="#services">Услуги</a>
            <a href="#how-it-works">Как это работает</a>
            <a href="#about">О клинике</a>
            <a href="#contacts">Контакты</a>
          </div>
          <div class="footer-col">
            <h5>Контакты</h5>
            <a href="tel:+79855376169">+7 (985) 537-61-69</a>
            <a href="https://t.me/skinstories_clinic" target="_blank">Telegram</a>
            <a href="https://wa.me/79855376169" target="_blank">WhatsApp</a>
          </div>
          <div class="footer-col">
            <h5>Адрес</h5>
            <span>Москва, ул. Садовническая, 5</span>
            <span>БЦ «PARADISE PLACE»</span>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <div class="footer-legal">
          <span>© 2024 Skin.Stories. Все права защищены.</span>
          <span>ИП Шамхалова Ханика Магомедовна</span>
          <span>ОГРНИП: 323774600182758 | ИНН: 054603204003</span>
        </div>
        <div class="footer-social">
          <a href="https://t.me/skinstories_clinic" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="m22 2-11 11"/></svg>
          </a>
          <a href="https://wa.me/79855376169" target="_blank">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <a href="https://instagram.com/skinstories" target="_blank">
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

.mobile-contacts {
  display: none;
}

.phone-link {
  color: var(--accent-gold);
  font-weight: 500;
}

/* Hero */
.hero {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(26,26,28,0.3) 0%, rgba(26,26,28,1) 100%),
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
  font-size: 96px;
  font-weight: 300;
  line-height: 1;
  margin-bottom: 24px;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 600px;
  margin-bottom: 32px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.hero-messengers {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
  color: var(--text-muted);
}

.messenger-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.messenger-link:hover {
  color: var(--accent-gold);
}

.messenger-link svg {
  width: 18px;
  height: 18px;
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

/* Services */
.services {
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

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.service-card {
  background: var(--bg-surface);
  padding: 40px 32px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  transition: border-color 0.3s, transform 0.3s;
}

.service-card:hover {
  border-color: var(--accent-gold);
  transform: translateY(-4px);
}

.service-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 24px;
}

.service-icon svg {
  width: 100%;
  height: 100%;
  color: var(--accent-gold);
}

.service-card h3 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 12px;
}

.service-card > p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
}

.service-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-features li {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 6px 0;
  border-top: 1px solid var(--border-subtle);
}

.service-features li:first-child {
  border-top: none;
}

/* How it works */
.how-it-works {
  padding: 120px;
  background: var(--bg-surface);
}

.steps {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.step-card {
  width: 260px;
  background: var(--bg-primary);
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

/* Online Consultation */
.online-consultation {
  display: flex;
  min-height: 600px;
}

.online-content {
  flex: 1;
  padding: 100px 80px;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.online-content h2 {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 400;
  margin: 16px 0 24px;
}

.online-desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 500px;
}

.online-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
}

.online-feature {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.feature-num {
  width: 32px;
  height: 32px;
  background: var(--accent-gold);
  color: var(--bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.online-feature h4 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 4px;
}

.online-feature p {
  font-size: 14px;
  color: var(--text-muted);
}

.online-image {
  width: 500px;
  background: url('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80') center/cover;
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

/* Equipment */
.equipment {
  padding: 100px 120px;
  background: var(--bg-cream);
}

.equipment-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.equipment-item {
  width: 200px;
  padding: 32px 24px;
  background: white;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.equipment-item h4 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.equipment-item p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
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
  min-height: 400px;
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

.cta-messengers {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.cta-messengers a {
  color: var(--accent-beige);
  transition: color 0.2s;
}

.cta-messengers a:hover {
  color: var(--text-primary);
}

.cta-messengers span {
  color: #A08070;
}

/* Contacts */
.contacts {
  display: flex;
  min-height: 500px;
}

.contacts-info {
  flex: 1;
  padding: 80px;
  background: var(--bg-primary);
}

.contacts-info h2 {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 400;
  margin: 16px 0 40px;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.contact-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.contact-item svg {
  width: 28px;
  height: 28px;
  color: var(--accent-gold);
  flex-shrink: 0;
}

.contact-item h4 {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.contact-item p {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.5;
}

.contact-item a {
  color: var(--text-primary);
  transition: color 0.2s;
}

.contact-item a:hover {
  color: var(--accent-gold);
}

.contacts-map {
  width: 50%;
  min-height: 400px;
}

.contacts-map iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Footer */
.footer {
  padding: 80px 120px 40px;
  background: var(--bg-surface);
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
  gap: 12px;
}

.footer-col h5 {
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-gold);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.footer-col a,
.footer-col span {
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
  align-items: flex-start;
}

.footer-legal {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-legal span {
  font-size: 12px;
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
  .services,
  .how-it-works,
  .equipment,
  .final-cta,
  .footer {
    padding-left: 40px;
    padding-right: 40px;
  }

  .online-content,
  .benefits-content,
  .contacts-info {
    padding: 60px 40px;
  }

  .benefits-image,
  .online-image {
    width: 400px;
  }

  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .mobile-contacts {
    display: block;
  }

  .hero h1 {
    font-size: 48px;
  }

  .section-header h2,
  .benefits h2,
  .online-content h2,
  .contacts-info h2 {
    font-size: 36px;
  }

  .final-cta h2 {
    font-size: 36px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .benefits,
  .online-consultation {
    flex-direction: column;
  }

  .benefits-image,
  .online-image {
    width: 100%;
    height: 300px;
  }

  .contacts {
    flex-direction: column;
  }

  .contacts-map {
    width: 100%;
    height: 300px;
  }

  .steps,
  .equipment-grid {
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

  .footer-bottom {
    flex-direction: column;
    gap: 24px;
  }

  .hero-messengers {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
