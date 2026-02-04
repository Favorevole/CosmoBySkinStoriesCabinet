<template>
  <div class="settings">
    <header class="page-header">
      <h1>Настройки</h1>
    </header>

    <div class="settings-content">
      <!-- Skin Problems Section -->
      <section class="settings-section">
        <h2>Проблемы кожи</h2>
        <p class="section-description">Список проблем кожи, которые пользователи могут выбрать при заполнении анкеты</p>

        <div class="problems-list" v-if="!loading">
          <div
            v-for="(problem, index) in skinProblems"
            :key="index"
            class="problem-item"
          >
            <input
              type="text"
              v-model="skinProblems[index]"
              @input="markDirty"
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
            :disabled="!isDirty || saving"
          >
            {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
          <button
            v-if="isDirty"
            @click="resetProblems"
            class="reset-btn"
          >
            Отменить
          </button>
        </div>

        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSkinProblems, updateSkinProblems } from '../api/index.js';

const skinProblems = ref([]);
const originalProblems = ref([]);
const loading = ref(true);
const saving = ref(false);
const isDirty = ref(false);
const message = ref('');
const messageType = ref('success');

onMounted(async () => {
  await loadProblems();
});

async function loadProblems() {
  loading.value = true;
  try {
    const response = await getSkinProblems();
    skinProblems.value = [...response.data];
    originalProblems.value = [...response.data];
    isDirty.value = false;
  } catch (error) {
    console.error('Failed to load skin problems:', error);
    showMessage('Ошибка загрузки данных', 'error');
  } finally {
    loading.value = false;
  }
}

function markDirty() {
  isDirty.value = true;
}

function addProblem() {
  skinProblems.value.push('');
  isDirty.value = true;
}

function removeProblem(index) {
  skinProblems.value.splice(index, 1);
  isDirty.value = true;
}

function resetProblems() {
  skinProblems.value = [...originalProblems.value];
  isDirty.value = false;
  message.value = '';
}

async function saveProblems() {
  // Filter out empty strings
  const filteredProblems = skinProblems.value.filter(p => p.trim() !== '');

  if (filteredProblems.length === 0) {
    showMessage('Добавьте хотя бы одну проблему', 'error');
    return;
  }

  saving.value = true;
  try {
    await updateSkinProblems(filteredProblems);
    skinProblems.value = [...filteredProblems];
    originalProblems.value = [...filteredProblems];
    isDirty.value = false;
    showMessage('Изменения сохранены', 'success');
  } catch (error) {
    console.error('Failed to save skin problems:', error);
    showMessage('Ошибка сохранения', 'error');
  } finally {
    saving.value = false;
  }
}

function showMessage(text, type) {
  message.value = text;
  messageType.value = type;
  if (type === 'success') {
    setTimeout(() => {
      message.value = '';
    }, 3000);
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

@media (max-width: 480px) {
  .settings {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 18px;
  }

  .settings-section {
    padding: 12px;
  }

  .section-description {
    font-size: 12px;
  }

  .problem-item {
    gap: 6px;
  }

  .problem-input {
    padding: 8px 10px;
    font-size: 12px;
  }

  .remove-btn {
    width: 32px;
    height: 32px;
  }

  .remove-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>
