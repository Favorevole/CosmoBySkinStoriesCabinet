<template>
  <div class="landing">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">SKIN.STORIES</div>
        <nav class="nav">
          <a href="#how-it-works">How It Works</a>
          <a href="#demo">Demo</a>
          <a href="#technology">Technology</a>
          <a href="#pricing">Pricing</a>
          <a href="#final-cta" class="nav-cta">Join Waitlist</a>
        </nav>
        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
        <a href="#how-it-works" @click="mobileMenuOpen = false">How It Works</a>
        <a href="#demo" @click="mobileMenuOpen = false">Demo</a>
        <a href="#technology" @click="mobileMenuOpen = false">Technology</a>
        <a href="#pricing" @click="mobileMenuOpen = false">Pricing</a>
        <a href="#final-cta" class="mobile-cta" @click="mobileMenuOpen = false">Join Waitlist</a>
      </div>
    </header>

    <!-- SECTION 1: HERO -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-grid-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <span class="tagline">AI-POWERED SKIN ANALYSIS</span>
          <h1>Your skin tells a story.<br><span class="hero-highlight">We help you read it.</span></h1>
          <p class="subtitle">Advanced AI technology that understands your skin's unique needs, delivering personalized care recommendations backed by dermatological science.</p>
          <form class="waitlist-form" @submit.prevent="submitWaitlist">
            <input
              type="email"
              v-model="email"
              placeholder="Enter your email"
              required
              class="waitlist-input"
            />
            <button type="submit" class="btn btn-primary">Get Early Access</button>
          </form>
          <p class="waitlist-note">Join 2,400+ people on the waitlist. No spam, ever.</p>
        </div>
        <div class="hero-mockup">
          <div class="app-mockup">
            <div class="mockup-screen">
              <div class="mockup-header">
                <span class="mockup-time">9:41</span>
                <span class="mockup-title">Skin.Stories</span>
                <div class="mockup-icons">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>
              <div class="mockup-content">
                <div class="mockup-face">
                  <div class="scan-line"></div>
                  <div class="scan-point scan-point-1"></div>
                  <div class="scan-point scan-point-2"></div>
                  <div class="scan-point scan-point-3"></div>
                </div>
                <div class="mockup-analysis">
                  <div class="analysis-item">
                    <span class="analysis-label">Hydration</span>
                    <div class="analysis-bar">
                      <div class="analysis-fill" style="width: 72%"></div>
                    </div>
                    <span class="analysis-value">72%</span>
                  </div>
                  <div class="analysis-item">
                    <span class="analysis-label">Elasticity</span>
                    <div class="analysis-bar">
                      <div class="analysis-fill" style="width: 85%"></div>
                    </div>
                    <span class="analysis-value">85%</span>
                  </div>
                  <div class="analysis-item">
                    <span class="analysis-label">Balance</span>
                    <div class="analysis-bar">
                      <div class="analysis-fill" style="width: 68%"></div>
                    </div>
                    <span class="analysis-value">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-scroll-indicator">
        <span>Scroll to explore</span>
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <!-- SECTION 2: HOW IT WORKS -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-header">
        <span class="tagline">THE PROCESS</span>
        <h2>Simple. Scientific. Personal.</h2>
        <p class="section-desc">Three steps to understanding your skin's unique story</p>
      </div>
      <div class="steps">
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="12" cy="10" r="3"/>
              <path d="M6 21v-1a6 6 0 0 1 12 0v1"/>
            </svg>
          </div>
          <div class="step-number">01</div>
          <h3>Capture</h3>
          <p>Take a photo of your skin using our guided camera system. Our AI ensures optimal lighting and angle for accurate analysis.</p>
          <div class="step-indicator">
            <span class="step-dot active"></span>
            <span class="step-line"></span>
          </div>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="step-number">02</div>
          <h3>Analyze</h3>
          <p>Our AI examines 47 different skin parameters, from hydration levels to pore density, creating your unique skin profile.</p>
          <div class="step-indicator">
            <span class="step-dot"></span>
            <span class="step-line"></span>
          </div>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div class="step-number">03</div>
          <h3>Personalize</h3>
          <p>Receive a tailored skincare routine with product recommendations that adapt as your skin evolves over time.</p>
          <div class="step-indicator">
            <span class="step-dot"></span>
            <span class="step-line-end"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: INTERACTIVE DEMO -->
    <section id="demo" class="demo">
      <div class="demo-container">
        <div class="demo-header">
          <span class="tagline">EXPERIENCE IT</span>
          <h2>See the magic in action</h2>
          <p class="section-desc">Watch how our AI transforms a simple photo into deep skin insights</p>
        </div>
        <div class="demo-interface">
          <div class="demo-upload-area">
            <div class="upload-box">
              <div class="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p class="upload-text">Drop your photo here</p>
              <span class="upload-hint">or click to browse</span>
            </div>
          </div>
          <div class="demo-scanning">
            <div class="scan-visual">
              <div class="face-outline">
                <div class="scan-beam"></div>
              </div>
              <div class="scan-data">
                <div class="data-point" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.3}s` }">
                  <span class="data-dot"></span>
                </div>
              </div>
            </div>
            <div class="scan-progress">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <span class="progress-text">Analyzing skin parameters...</span>
            </div>
          </div>
          <div class="demo-results">
            <div class="result-card">
              <div class="result-header">
                <h4>Your Skin Profile</h4>
                <span class="result-badge">AI Analysis Complete</span>
              </div>
              <div class="result-metrics">
                <div class="metric">
                  <div class="metric-circle" style="--progress: 78">
                    <span class="metric-value">78</span>
                  </div>
                  <span class="metric-label">Hydration</span>
                </div>
                <div class="metric">
                  <div class="metric-circle" style="--progress: 85">
                    <span class="metric-value">85</span>
                  </div>
                  <span class="metric-label">Elasticity</span>
                </div>
                <div class="metric">
                  <div class="metric-circle" style="--progress: 62">
                    <span class="metric-value">62</span>
                  </div>
                  <span class="metric-label">Clarity</span>
                </div>
                <div class="metric">
                  <div class="metric-circle" style="--progress: 71">
                    <span class="metric-value">71</span>
                  </div>
                  <span class="metric-label">Texture</span>
                </div>
              </div>
              <div class="result-insights">
                <h5>Key Insights</h5>
                <ul>
                  <li><span class="insight-icon insight-hydration">💧</span> Slight dehydration in T-zone area</li>
                  <li><span class="insight-icon insight-balance">🌿</span> Good oil balance overall</li>
                  <li><span class="insight-icon insight-sensitivity">🌸</span> Mild sensitivity detected around cheeks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: SKIN JOURNEY -->
    <section class="skin-journey">
      <div class="journey-content">
        <div class="section-header">
          <span class="tagline tagline-light">YOUR JOURNEY</span>
          <h2 class="light-text">Every skin has a story worth telling</h2>
          <p class="section-desc light-text">Real transformation starts with understanding. We celebrate skin in all its forms—not perfection, but progress.</p>
        </div>
        <div class="journey-phases">
          <div class="phase">
            <div class="phase-image phase-before"></div>
            <div class="phase-content">
              <span class="phase-label">Before</span>
              <h4>Uncertainty</h4>
              <p>Not knowing what your skin needs, trying products that don't work, feeling frustrated.</p>
            </div>
          </div>
          <div class="phase phase-center">
            <div class="phase-image phase-during"></div>
            <div class="phase-content">
              <span class="phase-label">During</span>
              <h4>Discovery</h4>
              <p>Understanding your unique skin profile, learning what works specifically for you.</p>
            </div>
          </div>
          <div class="phase">
            <div class="phase-image phase-after"></div>
            <div class="phase-content">
              <span class="phase-label">After</span>
              <h4>Confidence</h4>
              <p>A personalized routine you trust, skin that feels healthy and cared for.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: TECHNOLOGY -->
    <section id="technology" class="technology">
      <div class="tech-content">
        <div class="tech-visual">
          <div class="tech-grid">
            <div class="grid-cell" v-for="n in 25" :key="n"></div>
          </div>
          <div class="tech-overlay">
            <div class="data-stream">
              <div class="stream-line" v-for="n in 8" :key="n" :style="{ animationDelay: `${n * 0.2}s` }"></div>
            </div>
          </div>
          <div class="tech-center">
            <div class="ai-core">
              <div class="core-ring ring-1"></div>
              <div class="core-ring ring-2"></div>
              <div class="core-ring ring-3"></div>
              <div class="core-icon">AI</div>
            </div>
          </div>
        </div>
        <div class="tech-info">
          <span class="tagline">POWERED BY SCIENCE</span>
          <h2>Advanced AI meets dermatological expertise</h2>
          <div class="tech-cards">
            <div class="tech-card glass-card">
              <div class="tech-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h4>Deep Learning</h4>
              <p>Trained on 2M+ skin images across all types, tones, and conditions</p>
            </div>
            <div class="tech-card glass-card">
              <div class="tech-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h4>Real-time Analysis</h4>
              <p>47 skin parameters analyzed in under 3 seconds with 94% accuracy</p>
            </div>
            <div class="tech-card glass-card">
              <div class="tech-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h4>Personalized Care</h4>
              <p>Recommendations that evolve with your skin's changing needs</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 6: SOCIAL PROOF -->
    <section class="social-proof">
      <div class="section-header">
        <span class="tagline">REAL STORIES</span>
        <h2>What our early users say</h2>
      </div>
      <div class="testimonials">
        <div class="testimonial-card glass-card">
          <div class="testimonial-content">
            <p>"Finally, an app that understands my combination skin. The personalized routine changed everything—my skin has never been happier."</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar avatar-1"></div>
            <div class="author-info">
              <span class="author-name">Sarah M.</span>
              <span class="author-detail">Beta Tester, 3 months</span>
            </div>
          </div>
        </div>
        <div class="testimonial-card glass-card">
          <div class="testimonial-content">
            <p>"As someone with sensitive skin, I was skeptical. But the AI detected issues my dermatologist missed. Game changer."</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar avatar-2"></div>
            <div class="author-info">
              <span class="author-name">James L.</span>
              <span class="author-detail">Early Access Member</span>
            </div>
          </div>
        </div>
        <div class="testimonial-card glass-card">
          <div class="testimonial-content">
            <p>"I love how it tracks my skin's progress over time. Seeing the improvement data keeps me motivated to stick with my routine."</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar avatar-3"></div>
            <div class="author-info">
              <span class="author-name">Priya K.</span>
              <span class="author-detail">Founding Member</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 7: PRICING -->
    <section id="pricing" class="pricing">
      <div class="section-header">
        <span class="tagline">EARLY ACCESS</span>
        <h2>Join the skincare revolution</h2>
        <p class="section-desc">Limited spots available for founding members</p>
      </div>
      <div class="pricing-cards">
        <div class="pricing-card glass-card">
          <div class="pricing-header">
            <h4>Beta Access</h4>
            <div class="price">
              <span class="price-amount">Free</span>
              <span class="price-period">for early adopters</span>
            </div>
          </div>
          <ul class="pricing-features">
            <li><span class="check">✓</span> Basic skin analysis</li>
            <li><span class="check">✓</span> Weekly skin tracking</li>
            <li><span class="check">✓</span> Product recommendations</li>
            <li><span class="check">✓</span> Community access</li>
          </ul>
          <button class="btn btn-secondary">Join Beta Waitlist</button>
        </div>
        <div class="pricing-card glass-card pricing-featured">
          <div class="pricing-badge">Most Popular</div>
          <div class="pricing-header">
            <h4>Founding Member</h4>
            <div class="price">
              <span class="price-amount">$9</span>
              <span class="price-period">/month forever</span>
            </div>
          </div>
          <ul class="pricing-features">
            <li><span class="check">✓</span> Advanced AI analysis</li>
            <li><span class="check">✓</span> Daily skin tracking</li>
            <li><span class="check">✓</span> Personalized routines</li>
            <li><span class="check">✓</span> Expert consultations</li>
            <li><span class="check">✓</span> Priority support</li>
            <li><span class="check">✓</span> Locked-in pricing</li>
          </ul>
          <button class="btn btn-primary">Become a Founder</button>
        </div>
        <div class="pricing-card glass-card">
          <div class="pricing-header">
            <h4>Early Pro</h4>
            <div class="price">
              <span class="price-amount">$19</span>
              <span class="price-period">/month forever</span>
            </div>
          </div>
          <ul class="pricing-features">
            <li><span class="check">✓</span> Everything in Founding</li>
            <li><span class="check">✓</span> Unlimited analyses</li>
            <li><span class="check">✓</span> API access</li>
            <li><span class="check">✓</span> White-label reports</li>
            <li><span class="check">✓</span> Team features</li>
          </ul>
          <button class="btn btn-secondary">Join Pro Waitlist</button>
        </div>
      </div>
    </section>

    <!-- SECTION 8: FINAL CTA -->
    <section id="final-cta" class="final-cta">
      <div class="cta-content">
        <h2>Your skin's story<br>begins here</h2>
        <p class="cta-subtitle">Join thousands who are discovering a new way to understand and care for their skin.</p>
        <form class="cta-form" @submit.prevent="submitWaitlist">
          <input
            type="email"
            v-model="emailCta"
            placeholder="Enter your email"
            required
            class="cta-input"
          />
          <button type="submit" class="btn btn-cta">Get Early Access</button>
        </form>
        <div class="cta-trust">
          <span class="trust-item">✓ No credit card required</span>
          <span class="trust-item">✓ Cancel anytime</span>
          <span class="trust-item">✓ Privacy first</span>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-main">
        <div class="footer-brand">
          <div class="footer-logo">SKIN.STORIES</div>
          <p>AI-powered skin analysis that helps you understand and care for your unique skin.</p>
        </div>
        <div class="footer-nav">
          <div class="footer-col">
            <h5>Product</h5>
            <a href="#how-it-works">How It Works</a>
            <a href="#demo">Demo</a>
            <a href="#technology">Technology</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div class="footer-col">
            <h5>Company</h5>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div class="footer-col">
            <h5>Support</h5>
            <a href="mailto:hello@skin.stories">Contact</a>
            <a href="#">FAQ</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <span>© 2024 Skin.Stories. All rights reserved.</span>
        <div class="footer-social">
          <a href="#" target="_blank" aria-label="Twitter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
          </a>
          <a href="#" target="_blank" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>
          </a>
          <a href="#" target="_blank" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const emailCta = ref('');
const mobileMenuOpen = ref(false);

const submitWaitlist = () => {
  // Placeholder for waitlist submission
  console.log('Email submitted:', email.value || emailCta.value);
  alert('Thanks for joining our waitlist! We\'ll be in touch soon.');
  email.value = '';
  emailCta.value = '';
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

:root {
  /* Base Colors - Skin Tone Inspired */
  --color-porcelain: #FAF8F5;
  --color-soft-ivory: #F5F0EB;
  --color-warm-nude: #D4A574;
  --color-natural-beige: #E8DED4;
  --color-cocoa: #5C4A3D;
  --color-rich-ebony: #2D2420;

  /* Emotional Signals */
  --color-blush: #E8B4B8;
  --color-terracotta: #C67B5C;
  --color-olive: #8B9A6D;
  --color-honey: #E5B769;

  /* Functional */
  --color-overlay: rgba(45, 36, 32, 0.6);
  --color-glass: rgba(255, 255, 255, 0.7);
  --color-glass-border: rgba(255, 255, 255, 0.3);

  /* Typography */
  --font-primary: 'Manrope', sans-serif;
  --font-editorial: 'Playfair Display', serif;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
</style>

<style scoped>
/* Base */
.landing {
  min-height: 100vh;
  background: var(--color-porcelain);
  color: var(--color-cocoa);
  font-family: var(--font-primary);
  overflow-x: hidden;
}

/* Glassmorphism */
.glass-card {
  background: var(--color-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-glass-border);
  border-radius: 24px;
}

/* Typography */
h1, h2, h3, h4 {
  font-family: var(--font-editorial);
  color: var(--color-rich-ebony);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md) var(--space-xl);
  font-family: var(--font-primary);
  font-size: 16px;
  font-weight: 600;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  transition: all 0.4s ease-out;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-warm-nude);
  color: white;
  box-shadow: 0 4px 20px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover {
  background: #C49564;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(212, 165, 116, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--color-cocoa);
  border: 2px solid var(--color-natural-beige);
}

.btn-secondary:hover {
  background: var(--color-natural-beige);
  border-color: var(--color-natural-beige);
}

.btn-cta {
  background: white;
  color: var(--color-rich-ebony);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.4);
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(250, 248, 245, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-3xl);
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-editorial);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-rich-ebony);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--space-2xl);
}

.nav a {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-cocoa);
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav a:hover {
  color: var(--color-rich-ebony);
}

.nav-cta {
  padding: 12px 24px;
  background: var(--color-warm-nude);
  color: white !important;
  border-radius: 24px;
}

.nav-cta:hover {
  background: #C49564;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu-btn span {
  width: 24px;
  height: 2px;
  background: var(--color-rich-ebony);
  transition: all 0.3s ease;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  padding: var(--space-lg);
  background: var(--color-porcelain);
  border-top: 1px solid var(--color-natural-beige);
}

.mobile-menu a {
  padding: var(--space-md) 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-cocoa);
  text-decoration: none;
  border-bottom: 1px solid var(--color-natural-beige);
}

.mobile-cta {
  margin-top: var(--space-md);
  padding: var(--space-md) !important;
  background: var(--color-warm-nude);
  color: white !important;
  border-radius: 24px;
  text-align: center;
  border: none !important;
}

/* SECTION 1: HERO */
.hero {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 80px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-porcelain) 0%, var(--color-soft-ivory) 50%, var(--color-natural-beige) 100%);
  animation: breathe 8s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.hero-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(212, 165, 116, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 165, 116, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-3xl);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3xl);
  align-items: center;
}

.hero-text {
  max-width: 600px;
}

.tagline {
  display: inline-block;
  font-family: var(--font-primary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--color-warm-nude);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
}

.tagline-light {
  color: var(--color-honey);
}

.hero h1 {
  font-size: 56px;
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: var(--space-lg);
}

.hero-highlight {
  color: var(--color-warm-nude);
}

.subtitle {
  font-size: 18px;
  line-height: 1.7;
  color: var(--color-cocoa);
  margin-bottom: var(--space-xl);
  opacity: 0.9;
}

.waitlist-form {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.waitlist-input {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  font-family: var(--font-primary);
  font-size: 16px;
  border: 2px solid var(--color-natural-beige);
  border-radius: 24px;
  background: white;
  color: var(--color-rich-ebony);
  outline: none;
  transition: border-color 0.3s ease;
}

.waitlist-input:focus {
  border-color: var(--color-warm-nude);
}

.waitlist-input::placeholder {
  color: var(--color-cocoa);
  opacity: 0.5;
}

.waitlist-note {
  font-size: 14px;
  color: var(--color-cocoa);
  opacity: 0.7;
}

/* App Mockup */
.hero-mockup {
  display: flex;
  justify-content: center;
}

.app-mockup {
  width: 280px;
  height: 560px;
  background: var(--color-rich-ebony);
  border-radius: 40px;
  padding: 12px;
  box-shadow:
    0 50px 100px rgba(45, 36, 32, 0.3),
    0 20px 40px rgba(45, 36, 32, 0.2);
}

.mockup-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, var(--color-soft-ivory) 0%, var(--color-porcelain) 100%);
  border-radius: 32px;
  overflow: hidden;
}

.mockup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  font-size: 12px;
  color: var(--color-cocoa);
}

.mockup-title {
  font-weight: 600;
}

.mockup-icons {
  display: flex;
  gap: var(--space-xs);
  font-size: 10px;
}

.mockup-content {
  padding: var(--space-lg);
}

.mockup-face {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto var(--space-lg);
  background: linear-gradient(135deg, var(--color-natural-beige) 0%, var(--color-soft-ivory) 100%);
  border-radius: 50%;
  overflow: hidden;
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-warm-nude), transparent);
  animation: scanMove 2s ease-in-out infinite;
}

@keyframes scanMove {
  0%, 100% { top: 10%; }
  50% { top: 90%; }
}

.scan-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-warm-nude);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.scan-point-1 { top: 30%; left: 25%; animation-delay: 0s; }
.scan-point-2 { top: 45%; right: 20%; animation-delay: 0.5s; }
.scan-point-3 { bottom: 30%; left: 50%; animation-delay: 1s; }

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 1; }
}

.mockup-analysis {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.analysis-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-cocoa);
  width: 60px;
}

.analysis-bar {
  flex: 1;
  height: 6px;
  background: var(--color-natural-beige);
  border-radius: 3px;
  overflow: hidden;
}

.analysis-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-olive), var(--color-honey));
  border-radius: 3px;
  animation: fillGrow 2s ease-out forwards;
}

@keyframes fillGrow {
  from { width: 0 !important; }
}

.analysis-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-rich-ebony);
  width: 30px;
  text-align: right;
}

.hero-scroll-indicator {
  position: absolute;
  bottom: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-cocoa);
  font-size: 12px;
  opacity: 0.6;
}

.scroll-arrow {
  width: 20px;
  height: 20px;
  border-right: 2px solid var(--color-cocoa);
  border-bottom: 2px solid var(--color-cocoa);
  transform: rotate(45deg);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: rotate(45deg) translateY(0); }
  50% { transform: rotate(45deg) translateY(5px); }
}

/* SECTION 2: HOW IT WORKS */
.how-it-works {
  padding: var(--space-3xl);
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.section-header h2 {
  font-size: 48px;
  font-weight: 400;
  margin: var(--space-md) 0;
}

.section-desc {
  font-size: 18px;
  color: var(--color-cocoa);
  opacity: 0.8;
}

.light-text {
  color: var(--color-porcelain);
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.step-card {
  background: var(--color-soft-ivory);
  padding: var(--space-xl);
  border-radius: 24px;
  position: relative;
  transition: all 0.4s ease-out;
}

.step-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(45, 36, 32, 0.1);
}

.step-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-lg);
}

.step-icon svg {
  width: 100%;
  height: 100%;
  stroke: var(--color-warm-nude);
}

.step-number {
  font-family: var(--font-editorial);
  font-size: 64px;
  font-weight: 400;
  color: var(--color-natural-beige);
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  line-height: 1;
}

.step-card h3 {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: var(--space-md);
}

.step-card p {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-cocoa);
  opacity: 0.85;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-natural-beige);
}

.step-dot.active {
  background: var(--color-warm-nude);
}

.step-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--color-natural-beige), transparent);
}

.step-line-end {
  width: 20px;
  height: 2px;
  background: var(--color-natural-beige);
}

/* SECTION 3: DEMO */
.demo {
  padding: var(--space-3xl);
  background: var(--color-soft-ivory);
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.demo-header h2 {
  font-size: 48px;
  font-weight: 400;
  margin: var(--space-md) 0;
}

.demo-interface {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.demo-upload-area,
.demo-scanning,
.demo-results {
  background: white;
  border-radius: 24px;
  padding: var(--space-xl);
  box-shadow: 0 10px 40px rgba(45, 36, 32, 0.08);
}

.upload-box {
  border: 2px dashed var(--color-natural-beige);
  border-radius: 16px;
  padding: var(--space-2xl);
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-box:hover {
  border-color: var(--color-warm-nude);
  background: var(--color-soft-ivory);
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-md);
}

.upload-icon svg {
  width: 100%;
  height: 100%;
  stroke: var(--color-warm-nude);
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-rich-ebony);
  margin-bottom: var(--space-xs);
}

.upload-hint {
  font-size: 13px;
  color: var(--color-cocoa);
  opacity: 0.6;
}

.scan-visual {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.face-outline {
  width: 120px;
  height: 150px;
  border: 2px solid var(--color-natural-beige);
  border-radius: 60px 60px 50px 50px;
  position: relative;
  overflow: hidden;
}

.scan-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--color-warm-nude), transparent);
  animation: beamScan 1.5s ease-in-out infinite;
}

@keyframes beamScan {
  0%, 100% { top: 0; }
  50% { top: calc(100% - 4px); }
}

.scan-data {
  position: absolute;
  inset: 0;
}

.data-point {
  position: absolute;
  animation: dataAppear 3s ease-in-out infinite;
}

.data-point:nth-child(1) { top: 20%; left: 10%; }
.data-point:nth-child(2) { top: 30%; right: 15%; }
.data-point:nth-child(3) { top: 50%; left: 20%; }
.data-point:nth-child(4) { top: 60%; right: 25%; }
.data-point:nth-child(5) { bottom: 30%; left: 15%; }
.data-point:nth-child(6) { bottom: 20%; right: 10%; }

.data-dot {
  display: block;
  width: 8px;
  height: 8px;
  background: var(--color-honey);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-honey);
}

@keyframes dataAppear {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.scan-progress {
  margin-top: var(--space-lg);
}

.progress-bar {
  height: 6px;
  background: var(--color-natural-beige);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-fill {
  height: 100%;
  width: 65%;
  background: linear-gradient(90deg, var(--color-warm-nude), var(--color-honey));
  border-radius: 3px;
  animation: progressPulse 2s ease-in-out infinite;
}

@keyframes progressPulse {
  0%, 100% { width: 55%; }
  50% { width: 75%; }
}

.progress-text {
  font-size: 12px;
  color: var(--color-cocoa);
  text-align: center;
  display: block;
}

.result-card {
  height: 100%;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.result-header h4 {
  font-size: 18px;
  font-weight: 600;
}

.result-badge {
  font-size: 11px;
  font-weight: 600;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-olive);
  color: white;
  border-radius: 12px;
}

.result-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.metric {
  text-align: center;
}

.metric-circle {
  width: 50px;
  height: 50px;
  margin: 0 auto var(--space-xs);
  border-radius: 50%;
  background: conic-gradient(
    var(--color-warm-nude) calc(var(--progress) * 3.6deg),
    var(--color-natural-beige) calc(var(--progress) * 3.6deg)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.metric-circle::before {
  content: '';
  position: absolute;
  inset: 5px;
  background: white;
  border-radius: 50%;
}

.metric-value {
  position: relative;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-rich-ebony);
}

.metric-label {
  font-size: 11px;
  color: var(--color-cocoa);
}

.result-insights h5 {
  font-family: var(--font-primary);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-rich-ebony);
  margin-bottom: var(--space-sm);
}

.result-insights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-insights li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 12px;
  color: var(--color-cocoa);
  padding: var(--space-xs) 0;
}

.insight-icon {
  font-size: 14px;
}

/* SECTION 4: SKIN JOURNEY */
.skin-journey {
  padding: var(--space-3xl);
  background: var(--color-rich-ebony);
}

.journey-content {
  max-width: 1200px;
  margin: 0 auto;
}

.journey-phases {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  margin-top: var(--space-3xl);
}

.phase {
  text-align: center;
}

.phase-image {
  width: 100%;
  height: 300px;
  border-radius: 24px;
  background-size: cover;
  background-position: center;
  margin-bottom: var(--space-lg);
  opacity: 0.9;
  transition: all 0.4s ease-out;
}

.phase:hover .phase-image {
  opacity: 1;
  transform: scale(1.02);
}

.phase-before {
  background-image: url('https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80');
}

.phase-during {
  background-image: url('https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80');
}

.phase-after {
  background-image: url('https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80');
}

.phase-content {
  color: var(--color-porcelain);
}

.phase-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-honey);
  text-transform: uppercase;
  margin-bottom: var(--space-sm);
  display: block;
}

.phase-content h4 {
  font-size: 24px;
  font-weight: 500;
  color: var(--color-porcelain);
  margin-bottom: var(--space-sm);
}

.phase-content p {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.8;
}

/* SECTION 5: TECHNOLOGY */
.technology {
  padding: var(--space-3xl);
  background: var(--color-porcelain);
  overflow: hidden;
}

.tech-content {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3xl);
  align-items: center;
}

.tech-visual {
  position: relative;
  height: 500px;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  position: absolute;
  inset: 0;
  opacity: 0.3;
}

.grid-cell {
  background: var(--color-natural-beige);
  border-radius: 4px;
  animation: cellPulse 4s ease-in-out infinite;
}

.grid-cell:nth-child(odd) {
  animation-delay: 0.5s;
}

@keyframes cellPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.tech-overlay {
  position: absolute;
  inset: 0;
}

.data-stream {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-around;
}

.stream-line {
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent, var(--color-warm-nude), transparent);
  animation: streamFlow 3s linear infinite;
}

@keyframes streamFlow {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.tech-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ai-core {
  position: relative;
  width: 150px;
  height: 150px;
}

.core-ring {
  position: absolute;
  border: 2px solid var(--color-warm-nude);
  border-radius: 50%;
  animation: ringRotate 10s linear infinite;
}

.ring-1 {
  inset: 0;
  opacity: 0.3;
}

.ring-2 {
  inset: 20px;
  opacity: 0.5;
  animation-direction: reverse;
  animation-duration: 8s;
}

.ring-3 {
  inset: 40px;
  opacity: 0.8;
  animation-duration: 6s;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.core-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-editorial);
  font-size: 32px;
  font-weight: 600;
  color: var(--color-warm-nude);
}

.tech-info h2 {
  font-size: 42px;
  font-weight: 400;
  margin: var(--space-md) 0 var(--space-xl);
}

.tech-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.tech-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.tech-card-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.tech-card-icon svg {
  width: 100%;
  height: 100%;
  stroke: var(--color-warm-nude);
}

.tech-card h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.tech-card p {
  font-size: 14px;
  color: var(--color-cocoa);
  line-height: 1.6;
}

/* SECTION 6: SOCIAL PROOF */
.social-proof {
  padding: var(--space-3xl);
  background: var(--color-soft-ivory);
}

.testimonials {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  padding: var(--space-xl);
  transition: all 0.4s ease-out;
}

.testimonial-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(45, 36, 32, 0.1);
}

.testimonial-content p {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-cocoa);
  margin-bottom: var(--space-lg);
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.avatar-1 {
  background-image: url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80');
}

.avatar-2 {
  background-image: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80');
}

.avatar-3 {
  background-image: url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80');
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--color-rich-ebony);
}

.author-detail {
  font-size: 13px;
  color: var(--color-cocoa);
  opacity: 0.7;
}

/* SECTION 7: PRICING */
.pricing {
  padding: var(--space-3xl);
  background: var(--color-porcelain);
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

.pricing-card {
  padding: var(--space-xl);
  position: relative;
  transition: all 0.4s ease-out;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(45, 36, 32, 0.1);
}

.pricing-featured {
  border: 2px solid var(--color-warm-nude);
  transform: scale(1.05);
}

.pricing-featured:hover {
  transform: scale(1.05) translateY(-8px);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-xs) var(--space-md);
  background: var(--color-warm-nude);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}

.pricing-header {
  text-align: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-natural-beige);
}

.pricing-header h4 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.price {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-amount {
  font-family: var(--font-editorial);
  font-size: 48px;
  font-weight: 400;
  color: var(--color-rich-ebony);
}

.price-period {
  font-size: 14px;
  color: var(--color-cocoa);
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-xl);
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  font-size: 14px;
  color: var(--color-cocoa);
}

.pricing-features .check {
  color: var(--color-olive);
  font-weight: bold;
}

.pricing-card .btn {
  width: 100%;
}

/* SECTION 8: FINAL CTA */
.final-cta {
  padding: var(--space-3xl) var(--space-xl);
  background: var(--color-rich-ebony);
  text-align: center;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-content {
  max-width: 600px;
}

.final-cta h2 {
  font-size: 56px;
  font-weight: 400;
  color: var(--color-porcelain);
  line-height: 1.2;
  margin-bottom: var(--space-lg);
}

.cta-subtitle {
  font-size: 18px;
  color: var(--color-natural-beige);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.cta-form {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.cta-input {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  font-family: var(--font-primary);
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
  transition: all 0.3s ease;
}

.cta-input:focus {
  border-color: var(--color-warm-nude);
  background: rgba(255, 255, 255, 0.15);
}

.cta-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.cta-trust {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.trust-item {
  font-size: 13px;
  color: var(--color-natural-beige);
  opacity: 0.7;
}

/* Footer */
.footer {
  padding: var(--space-3xl) var(--space-3xl) var(--space-xl);
  background: var(--color-rich-ebony);
}

.footer-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2xl);
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  font-family: var(--font-editorial);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-porcelain);
  margin-bottom: var(--space-md);
}

.footer-brand p {
  font-size: 14px;
  color: var(--color-natural-beige);
  line-height: 1.6;
  opacity: 0.7;
}

.footer-nav {
  display: flex;
  gap: var(--space-3xl);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.footer-col h5 {
  font-family: var(--font-primary);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-warm-nude);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: var(--space-sm);
}

.footer-col a {
  font-size: 14px;
  color: var(--color-natural-beige);
  text-decoration: none;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.footer-col a:hover {
  opacity: 1;
  color: var(--color-porcelain);
}

.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: var(--space-lg);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom span {
  font-size: 13px;
  color: var(--color-natural-beige);
  opacity: 0.5;
}

.footer-social {
  display: flex;
  gap: var(--space-lg);
}

.footer-social a {
  color: var(--color-natural-beige);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.footer-social a:hover {
  opacity: 1;
  color: var(--color-porcelain);
}

.footer-social svg {
  width: 20px;
  height: 20px;
}

/* Responsive - Tablet */
@media (max-width: 1200px) {
  .header-content {
    padding: 0 var(--space-xl);
  }

  .hero-content {
    padding: var(--space-xl);
    gap: var(--space-xl);
  }

  .hero h1 {
    font-size: 44px;
  }

  .section-header h2,
  .demo-header h2,
  .tech-info h2 {
    font-size: 36px;
  }

  .how-it-works,
  .demo,
  .skin-journey,
  .technology,
  .social-proof,
  .pricing,
  .footer {
    padding: var(--space-2xl);
  }

  .tech-content {
    gap: var(--space-xl);
  }

  .tech-visual {
    height: 400px;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: none;
  }

  .mobile-menu-open {
    display: flex;
  }

  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero h1 {
    font-size: 36px;
  }

  .hero h1 br {
    display: none;
  }

  .waitlist-form {
    flex-direction: column;
  }

  .hero-mockup {
    order: -1;
  }

  .app-mockup {
    width: 220px;
    height: 440px;
  }

  .hero-scroll-indicator {
    display: none;
  }

  .steps {
    grid-template-columns: 1fr;
  }

  .demo-interface {
    grid-template-columns: 1fr;
  }

  .journey-phases {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
  }

  .tech-content {
    grid-template-columns: 1fr;
  }

  .tech-visual {
    height: 300px;
  }

  .testimonials {
    grid-template-columns: 1fr;
  }

  .pricing-cards {
    grid-template-columns: 1fr;
  }

  .pricing-featured {
    transform: none;
  }

  .pricing-featured:hover {
    transform: translateY(-8px);
  }

  .final-cta h2 {
    font-size: 36px;
  }

  .final-cta h2 br {
    display: none;
  }

  .cta-form {
    flex-direction: column;
  }

  .footer-main {
    flex-direction: column;
    gap: var(--space-xl);
  }

  .footer-nav {
    flex-direction: column;
    gap: var(--space-lg);
  }

  .footer-bottom {
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }
}

/* Mobile Small (iOS) */
@media (max-width: 480px) {
  .header {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .header-content {
    padding: 0 var(--space-md);
    height: 60px;
  }

  .logo {
    font-size: 18px;
  }

  .hero {
    min-height: 100vh;
    min-height: 100dvh;
  }

  .hero-content {
    padding: var(--space-lg);
    padding-top: 80px;
  }

  .hero h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 15px;
  }

  .app-mockup {
    width: 200px;
    height: 400px;
  }

  .btn {
    padding: var(--space-md) var(--space-lg);
    min-height: 52px;
    font-size: 15px;
    -webkit-tap-highlight-color: transparent;
  }

  .section-header h2,
  .demo-header h2,
  .tech-info h2 {
    font-size: 28px;
  }

  .section-desc {
    font-size: 15px;
  }

  .how-it-works,
  .demo,
  .skin-journey,
  .technology,
  .social-proof,
  .pricing {
    padding: var(--space-2xl) var(--space-lg);
  }

  .step-card {
    padding: var(--space-lg);
  }

  .step-number {
    font-size: 48px;
  }

  .step-card h3 {
    font-size: 22px;
  }

  .demo-upload-area,
  .demo-scanning,
  .demo-results {
    padding: var(--space-lg);
  }

  .result-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .phase-image {
    height: 200px;
  }

  .tech-visual {
    height: 250px;
  }

  .ai-core {
    width: 100px;
    height: 100px;
  }

  .core-icon {
    font-size: 24px;
  }

  .tech-card {
    padding: var(--space-md);
  }

  .testimonial-card {
    padding: var(--space-lg);
  }

  .pricing-card {
    padding: var(--space-lg);
  }

  .price-amount {
    font-size: 36px;
  }

  .final-cta {
    padding: var(--space-2xl) var(--space-lg);
    padding-bottom: calc(var(--space-2xl) + env(safe-area-inset-bottom, 0px));
    min-height: auto;
  }

  .final-cta h2 {
    font-size: 28px;
  }

  .cta-subtitle {
    font-size: 15px;
  }

  .cta-trust {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .footer {
    padding: var(--space-xl) var(--space-lg);
    padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
