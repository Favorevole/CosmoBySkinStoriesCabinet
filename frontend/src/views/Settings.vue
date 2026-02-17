<template>
  <div class="settings">
    <header class="page-header">
      <h1>Справочники</h1>
      <p class="page-subtitle">Управление справочниками системы</p>
    </header>

    <div class="settings-content">
      <!-- Skin Problems Section -->
      <section class="settings-section">
        <h2>Проблемы кожи</h2>
        <p class="section-description">Список проблем кожи, которые пользователи могут выбрать при заполнении анкеты</p>

        <div class="problems-list" v-if="!loadingProblems">
          <div
            v-for="(problem, index) in skinProblems"
            :key="index"
            class="problem-item"
          >
            <input
              type="text"
              v-model="skinProblems[index]"
              @input="problemsDirty = true"
              class="problem-input"
              placeholder="Название проблемы"
            />
            <button @click="removeProblem(index)" class="remove-btn" title="Удалить">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <button @click="addProblem" class="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Добавить проблему
          </button>
        </div>

        <div v-else class="loading">
          Загрузка...
        </div>

        <div class="actions">
          <button
            @click="saveProblems"
            class="save-btn"
            :disabled="!problemsDirty || savingProblems"
          >
            {{ savingProblems ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
          <button
            v-if="problemsDirty"
            @click="resetProblems"
            class="reset-btn"
          >
            Отменить
          </button>
        </div>

        <div v-if="problemsMessage" :class="['message', problemsMessageType]">
          {{ problemsMessage }}
        </div>
      </section>

      <!-- Additional Products Section -->
      <section class="settings-section">
        <h2>Дополнительные средства</h2>
        <p class="section-description">Список дополнительных средств, доступных для выбора в боте и на сайте</p>

        <div class="problems-list" v-if="!loadingProducts">
          <div
            v-for="(product, index) in additionalProducts"
            :key="index"
            class="problem-item"
          >
            <input
              type="text"
              v-model="additionalProducts[index]"
              @input="productsDirty = true"
              class="problem-input"
              placeholder="Название средства"
            />
            <button @click="removeProduct(index)" class="remove-btn" title="Удалить">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <button @click="addProduct" class="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Добавить средство
          </button>
        </div>

        <div v-else class="loading">
          Загрузка...
        </div>

        <div class="actions">
          <button
            @click="saveProducts"
            class="save-btn"
            :disabled="!productsDirty || savingProducts"
          >
            {{ savingProducts ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
          <button
            v-if="productsDirty"
            @click="resetProducts"
            class="reset-btn"
          >
            Отменить
          </button>
        </div>

        <div v-if="productsMessage" :class="['message', productsMessageType]">
          {{ productsMessage }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSkinProblems, updateSkinProblems, getAdditionalProducts, updateAdditionalProducts } from '../api/index.js';

// Skin problems state
const skinProblems = ref([]);
const originalProblems = ref([]);
const loadingProblems = ref(true);
const savingProblems = ref(false);
const problemsDirty = ref(false);
const problemsMessage = ref('');
const problemsMessageType = ref('success');

// Additional products state
const additionalProducts = ref([]);
const originalProducts = ref([]);
const loadingProducts = ref(true);
const savingProducts = ref(false);
const productsDirty = ref(false);
const productsMessage = ref('');
const productsMessageType = ref('success');

onMounted(async () => {
  await Promise.all([loadProblems(), loadProducts()]);
});

// --- Skin Problems ---
async function loadProblems() {
  loadingProblems.value = true;
  try {
    const response = await getSkinProblems();
    skinProblems.value = [...response.data];
    originalProblems.value = [...response.data];
    problemsDirty.value = false;
  } catch (error) {
    console.error('Failed to load skin problems:', error);
    showProblemsMessage('Ошибка загрузки данных', 'error');
  } finally {
    loadingProblems.value = false;
  }
}

function addProblem() {
  skinProblems.value.push('');
  problemsDirty.value = true;
}

function removeProblem(index) {
  skinProblems.value.splice(index, 1);
  problemsDirty.value = true;
}

function resetProblems() {
  skinProblems.value = [...originalProblems.value];
  problemsDirty.value = false;
  problemsMessage.value = '';
}

async function saveProblems() {
  const filtered = skinProblems.value.filter(p => p.trim() !== '');
  if (filtered.length === 0) {
    showProblemsMessage('Добавьте хотя бы одну проблему', 'error');
    return;
  }

  savingProblems.value = true;
  try {
    await updateSkinProblems(filtered);
    skinProblems.value = [...filtered];
    originalProblems.value = [...filtered];
    problemsDirty.value = false;
    showProblemsMessage('Изменения сохранены', 'success');
  } catch (error) {
    console.error('Failed to save skin problems:', error);
    showProblemsMessage('Ошибка сохранения', 'error');
  } finally {
    savingProblems.value = false;
  }
}

function showProblemsMessage(text, type) {
  problemsMessage.value = text;
  problemsMessageType.value = type;
  if (type === 'success') {
    setTimeout(() => { problemsMessage.value = ''; }, 3000);
  }
}

// --- Additional Products ---
async function loadProducts() {
  loadingProducts.value = true;
  try {
    const response = await getAdditionalProducts();
    additionalProducts.value = [...response.data];
    originalProducts.value = [...response.data];
    productsDirty.value = false;
  } catch (error) {
    console.error('Failed to load additional products:', error);
    showProductsMessage('Ошибка загрузки данных', 'error');
  } finally {
    loadingProducts.value = false;
  }
}

function addProduct() {
  additionalProducts.value.push('');
  productsDirty.value = true;
}

function removeProduct(index) {
  additionalProducts.value.splice(index, 1);
  productsDirty.value = true;
}

function resetProducts() {
  additionalProducts.value = [...originalProducts.value];
  productsDirty.value = false;
  productsMessage.value = '';
}

async function saveProducts() {
  const filtered = additionalProducts.value.filter(p => p.trim() !== '');
  if (filtered.length === 0) {
    showProductsMessage('Добавьте хотя бы одно средство', 'error');
    return;
  }

  savingProducts.value = true;
  try {
    await updateAdditionalProducts(filtered);
    additionalProducts.value = [...filtered];
    originalProducts.value = [...filtered];
    productsDirty.value = false;
    showProductsMessage('Изменения сохранены', 'success');
  } catch (error) {
    console.error('Failed to save additional products:', error);
    showProductsMessage('Ошибка сохранения', 'error');
  } finally {
    savingProducts.value = false;
  }
}

function showProductsMessage(text, type) {
  productsMessage.value = text;
  productsMessageType.value = type;
  if (type === 'success') {
    setTimeout(() => { productsMessage.value = ''; }, 3000);
  }
}
</script>

<style scoped>
.settings {
  padding: 24px;
  max-width: 800px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin: 4px 0 0 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: linear-gradient(145deg, rgba(30, 30, 32, 0.9) 0%, rgba(25, 25, 27, 0.95) 100%);
  border: 1px solid rgba(201, 169, 98, 0.1);
  border-radius: 12px;
  padding: 24px;
}

.settings-section h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 600;
  color: #C9A962;
  margin: 0 0 8px 0;
}

.section-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin: 0 0 20px 0;
}

.problems-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.problem-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.problem-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  transition: all 0.3s ease;
}

.problem-input:focus {
  outline: none;
  border-color: rgba(201, 169, 98, 0.4);
  background: rgba(0, 0, 0, 0.3);
}

.problem-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.remove-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 8px;
  color: rgba(255, 100, 100, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

.remove-btn:hover {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.5);
  color: #ff6464;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: 1px dashed rgba(201, 169, 98, 0.3);
  border-radius: 8px;
  color: rgba(201, 169, 98, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn svg {
  width: 18px;
  height: 18px;
}

.add-btn:hover {
  background: rgba(201, 169, 98, 0.05);
  border-color: rgba(201, 169, 98, 0.5);
  color: #C9A962;
}

.actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(201, 169, 98, 0.1);
}

.save-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #5D1A2D 0%, #7A2339 100%);
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(93, 26, 45, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  padding: 12px 24px;
  background: transparent;
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(201, 169, 98, 0.1);
  border-color: rgba(201, 169, 98, 0.3);
  color: #FFFFFF;
}

.message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.message.success {
  background: rgba(100, 200, 100, 0.1);
  border: 1px solid rgba(100, 200, 100, 0.3);
  color: #64c864;
}

.message.error {
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  color: #ff6464;
}

.loading {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
}

/* Mobile styles */
@media (max-width: 768px) {
  .settings {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .settings-section {
    padding: 16px;
  }

  .settings-section h2 {
    font-size: 18px;
  }

  .problem-input {
    padding: 10px 12px;
    font-size: 13px;
  }

  .remove-btn {
    width: 36px;
    height: 36px;
  }

  .actions {
    flex-direction: column;
  }

  .save-btn, .reset-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}

/* Mobile design - iOS HIG / MD3 compliant */
@media (max-width: 480px) {
  .settings {
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));
    max-width: 100%;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  /* iOS-style grouped list */
  .settings-section {
    background: #222224;
    border: none;
    border-radius: 14px;
    padding: 0;
    overflow: hidden;
  }

  .settings-section > h2 {
    padding: 16px 16px 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .section-description {
    padding: 0 16px 12px;
    font-size: 13px;
  }

  .problems-list {
    margin: 0;
    gap: 0;
    padding: 0;
  }

  .problem-item {
    padding: 12px 16px;
    gap: 12px;
    border-bottom: 1px solid rgba(201, 169, 98, 0.08);
    margin: 0;
    background: transparent;
  }

  .problem-item:last-of-type {
    border-bottom: none;
  }

  /* Larger inputs to prevent iOS zoom */
  .problem-input {
    min-height: 48px;
    padding: 14px 16px;
    font-size: 16px;
    border: none;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
  }

  .problem-input:focus {
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 2px rgba(201, 169, 98, 0.3);
  }

  /* Touch-friendly remove button */
  .remove-btn {
    min-width: 44px;
    min-height: 44px;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .remove-btn:active {
    background: rgba(255, 100, 100, 0.2);
  }

  .remove-btn svg {
    width: 20px;
    height: 20px;
  }

  /* Add button */
  .add-btn {
    margin: 0 16px 16px;
    min-height: 48px;
    padding: 14px;
    border-radius: 10px;
    font-size: 14px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .add-btn:active {
    background: rgba(201, 169, 98, 0.1);
  }

  /* Actions inside sections on mobile */
  .actions {
    padding: 12px 16px;
    border-top: 1px solid rgba(201, 169, 98, 0.08);
    display: flex;
    gap: 10px;
  }

  .save-btn,
  .reset-btn {
    flex: 1;
    min-height: 48px;
    padding: 14px 20px;
    font-size: 15px;
    border-radius: 12px;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .save-btn:active:not(:disabled),
  .reset-btn:active {
    transform: scale(0.98);
  }

  /* Toast-style message */
  .message {
    margin: 12px 16px 16px;
    padding: 14px 16px;
    border-radius: 12px;
  }
}
</style>
