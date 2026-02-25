<template>
  <div class="care-scheme">
    <!-- Greeting -->
    <div v-if="scheme.greeting" class="section greeting">
      <p>{{ scheme.greeting }}</p>
    </div>

    <!-- Analysis -->
    <div v-if="scheme.analysis || scheme.analysisText" class="section">
      <h3 class="section-title">🔬 Анализ состояния кожи</h3>
      <div class="section-content" v-html="formatText(scheme.analysis || scheme.analysisText)"></div>
    </div>

    <!-- Goals -->
    <div v-if="scheme.goals || scheme.goalsText" class="section">
      <h3 class="section-title">🎯 Основные задачи ухода</h3>
      <div class="section-content" v-html="formatText(scheme.goals || scheme.goalsText)"></div>
    </div>

    <!-- Strategy -->
    <div v-if="scheme.strategy || scheme.strategyText" class="section">
      <h3 class="section-title">🧭 Основная стратегия ухода</h3>
      <div class="section-content" v-html="formatText(scheme.strategy || scheme.strategyText)"></div>
    </div>

    <!-- Morning Routine -->
    <div v-if="hasMorningRoutine" class="section">
      <h3 class="section-title">☀️ Утренний уход</h3>
      <div class="routine">
        <div
          v-for="step in morningRoutine"
          :key="step.step"
          class="routine-step"
        >
          <div class="step-number">{{ step.step }}</div>
          <div class="step-content">
            <h4 class="step-name">{{ step.name }}</h4>
            <p class="step-description">{{ step.description }}</p>
            <div v-if="step.ingredients && step.ingredients.length" class="step-ingredients">
              <strong>Активные компоненты:</strong>
              <span class="ingredient" v-for="(ing, idx) in step.ingredients" :key="idx">
                {{ ing }}
              </span>
            </div>
            <div v-if="step.frequency" class="step-frequency">
              📅 {{ step.frequency }}
            </div>
            <div v-if="step.products && step.products.length" class="step-products">
              <div v-for="(product, idx) in step.products" :key="idx" class="product-item">
                <a v-if="product.link" :href="product.link" target="_blank" rel="noopener">
                  <strong>{{ product.brand }}</strong> {{ product.name }}
                </a>
                <span v-else>
                  <strong>{{ product.brand }}</strong> {{ product.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Evening Routine -->
    <div v-if="hasEveningRoutine" class="section">
      <h3 class="section-title">🌙 Вечерний уход</h3>
      <div class="routine">
        <div
          v-for="step in eveningRoutine"
          :key="step.step"
          class="routine-step"
        >
          <div class="step-number">{{ step.step }}</div>
          <div class="step-content">
            <h4 class="step-name">{{ step.name }}</h4>
            <p class="step-description">{{ step.description }}</p>
            <div v-if="step.ingredients && step.ingredients.length" class="step-ingredients">
              <strong>Активные компоненты:</strong>
              <span class="ingredient" v-for="(ing, idx) in step.ingredients" :key="idx">
                {{ ing }}
              </span>
            </div>
            <div v-if="step.frequency" class="step-frequency">
              📅 {{ step.frequency }}
            </div>
            <div v-if="step.products && step.products.length" class="step-products">
              <div v-for="(product, idx) in step.products" :key="idx" class="product-item">
                <a v-if="product.link" :href="product.link" target="_blank" rel="noopener">
                  <strong>{{ product.brand }}</strong> {{ product.name }}
                </a>
                <span v-else>
                  <strong>{{ product.brand }}</strong> {{ product.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Warnings -->
    <div v-if="scheme.warnings || scheme.warningsText" class="section">
      <h3 class="section-title">⚠️ Ограничения и триггеры</h3>
      <div class="section-content warning-content" v-html="formatText(scheme.warnings || scheme.warningsText)"></div>
    </div>

    <!-- Timeline -->
    <div v-if="scheme.timeline || scheme.timelineText" class="section">
      <h3 class="section-title">📈 Ожидаемая динамика</h3>
      <div class="section-content" v-html="formatText(scheme.timeline || scheme.timelineText)"></div>
    </div>

    <!-- Notes -->
    <div v-if="scheme.notes" class="section">
      <h3 class="section-title">💡 Дополнительно</h3>
      <div class="section-content" v-html="formatText(scheme.notes)"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  scheme: {
    type: Object,
    required: true
  }
});

const morningRoutine = computed(() => {
  if (Array.isArray(props.scheme.morningRoutine)) {
    return props.scheme.morningRoutine;
  }
  return [];
});

const eveningRoutine = computed(() => {
  if (Array.isArray(props.scheme.eveningRoutine)) {
    return props.scheme.eveningRoutine;
  }
  return [];
});

const hasMorningRoutine = computed(() => morningRoutine.value.length > 0);
const hasEveningRoutine = computed(() => eveningRoutine.value.length > 0);

function formatText(text) {
  if (!text) return '';

  // Convert line breaks to HTML
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/, '<p>$1</p>');
}
</script>

<style scoped>
.care-scheme {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.section {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 24px;
}

.greeting {
  background: linear-gradient(135deg, #f8f6f3 0%, #fff 100%);
  text-align: center;
  font-size: 16px;
  color: #1a1a1c;
  line-height: 1.6;
}

.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  color: #1a1a1c;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.section-content {
  font-size: 15px;
  color: #333;
  line-height: 1.7;
}

.section-content :deep(p) {
  margin: 0 0 12px 0;
}

.section-content :deep(p:last-child) {
  margin-bottom: 0;
}

.warning-content {
  background: #fffbf0;
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

.routine {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.routine-step {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #faf9f7;
  border-radius: 10px;
  border: 1px solid #e8e4db;
}

.step-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #8b7355;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-name {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1c;
  margin: 0;
}

.step-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.step-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 13px;
}

.step-ingredients strong {
  color: #666;
}

.ingredient {
  background: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #e8e4db;
  color: #8b7355;
  font-weight: 500;
}

.step-frequency {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  background: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  width: fit-content;
}

.step-products {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.product-item {
  font-size: 14px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 8px;
}

.product-item a {
  color: #8b7355;
  text-decoration: none;
  transition: color 0.2s;
}

.product-item a:hover {
  color: #6a5440;
  text-decoration: underline;
}

.product-item strong {
  color: #1a1a1c;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .section {
    padding: 18px;
  }

  .section-title {
    font-size: 20px;
  }

  .routine-step {
    flex-direction: column;
    padding: 14px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>
