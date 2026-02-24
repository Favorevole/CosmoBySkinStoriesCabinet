<template>
  <div class="page">
    <div class="page-header">
      <h1>Алгоритмы подбора</h1>
      <button @click="openForm()" class="btn btn-primary">Создать алгоритм</button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="algorithms.length === 0" class="empty">
      Нет алгоритмов. Создайте первый — система будет автоматически подбирать подходящие программы при просмотре заявок.
    </div>
    <div v-else class="algo-list">
      <div v-for="algo in algorithms" :key="algo.id" class="algo-card">
        <div class="algo-header">
          <div class="algo-name-row">
            <span class="algo-name">{{ algo.name }}</span>
            <span class="algo-priority" v-if="algo.priority">Приоритет: {{ algo.priority }}</span>
          </div>
          <div class="algo-actions">
            <label class="toggle">
              <input type="checkbox" :checked="algo.isActive" @change="toggleActive(algo)">
              <span class="toggle-slider"></span>
            </label>
            <button @click="openForm(algo)" class="icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button @click="remove(algo)" class="icon-btn icon-btn-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        <p v-if="algo.description" class="algo-desc">{{ algo.description }}</p>
        <div class="algo-meta">
          <span class="algo-tag">{{ algo.matchMode === 'ALL' ? 'Все условия' : 'Любое условие' }}</span>
          <span class="algo-tag">{{ algo.rules.length }} правил(а)</span>
          <span class="algo-tag" v-if="algo.outputType === 'template' && algo.template">Шаблон: {{ algo.template.title }}</span>
          <span class="algo-tag" v-if="algo.outputType === 'program' && algo.program">Программа: {{ algo.program.title }}</span>
          <span class="algo-tag" v-if="algo.outputType === 'text'">Свой текст</span>
        </div>
      </div>
    </div>

    <!-- Form modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal modal-wide">
        <h3>{{ editingAlgo ? 'Редактировать' : 'Новый' }} алгоритм</h3>

        <div class="form-group">
          <label>Название</label>
          <input v-model="form.name" maxlength="200" class="form-input" placeholder="Напр. Anti-age для сухой кожи">
        </div>

        <div class="form-group">
          <label>Описание (необязательно)</label>
          <textarea v-model="form.description" rows="2" class="form-input" placeholder="Описание алгоритма"></textarea>
        </div>

        <div class="form-group">
          <label>Режим совпадения</label>
          <div class="radio-row">
            <label class="radio-label"><input type="radio" v-model="form.matchMode" value="ALL"> Все условия</label>
            <label class="radio-label"><input type="radio" v-model="form.matchMode" value="ANY"> Любое условие</label>
          </div>
        </div>

        <!-- Rules builder -->
        <div class="form-group">
          <label>Правила</label>
          <div v-for="(rule, i) in form.rules" :key="i" class="rule-row">
            <select v-model="rule.field" class="form-select" @change="onFieldChange(rule)">
              <option value="">Выберите поле</option>
              <option v-for="f in ruleFields" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
            <select v-model="rule.operator" class="form-select">
              <option value="">Оператор</option>
              <option v-for="op in getOperators(rule.field)" :key="op.value" :value="op.value">{{ op.label }}</option>
            </select>
            <template v-if="getFieldType(rule.field) === 'enum'">
              <select v-model="rule.value" class="form-select">
                <option value="">Значение</option>
                <option v-for="v in getEnumValues(rule.field)" :key="v.value" :value="v.value">{{ v.label }}</option>
              </select>
            </template>
            <template v-else>
              <input v-model="rule.value" class="form-input form-input-sm" :placeholder="getFieldType(rule.field) === 'number' ? 'Число' : 'Текст'">
            </template>
            <button @click="form.rules.splice(i, 1)" class="icon-btn icon-btn-danger" v-if="form.rules.length > 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <button @click="addRule" class="btn btn-sm btn-secondary" style="margin-top:8px;">+ Добавить правило</button>
        </div>

        <!-- Output -->
        <div class="form-group">
          <label>Результат</label>
          <div class="radio-row">
            <label class="radio-label"><input type="radio" v-model="form.outputType" value="template"> Шаблон</label>
            <label class="radio-label"><input type="radio" v-model="form.outputType" value="program"> Программа</label>
            <label class="radio-label"><input type="radio" v-model="form.outputType" value="text"> Свой текст</label>
          </div>
        </div>

        <div v-if="form.outputType === 'template'" class="form-group">
          <select v-model="form.templateId" class="form-select">
            <option :value="null">Выберите шаблон</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.title }}</option>
          </select>
        </div>
        <div v-if="form.outputType === 'program'" class="form-group">
          <select v-model="form.programId" class="form-select">
            <option :value="null">Выберите программу</option>
            <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
        </div>
        <div v-if="form.outputType === 'text'" class="form-group">
          <textarea v-model="form.customText" rows="4" class="form-input" placeholder="Текст рекомендации"></textarea>
        </div>

        <div class="form-group">
          <label>Приоритет (больше = выше)</label>
          <input v-model.number="form.priority" type="number" min="0" class="form-input form-input-sm" style="width:100px;">
        </div>

        <div v-if="formError" class="form-error">{{ formError }}</div>

        <div class="form-actions">
          <button @click="showForm = false" class="btn btn-secondary">Отмена</button>
          <button @click="saveForm" :disabled="saving" class="btn btn-primary">
            {{ saving ? 'Сохранение...' : (editingAlgo ? 'Сохранить' : 'Создать') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getAlgorithms, createAlgorithm, updateAlgorithm, deleteAlgorithm,
  getTemplates, getPrograms
} from '../../api/doctorCabinet.js';

const algorithms = ref([]);
const templates = ref([]);
const programs = ref([]);
const loading = ref(true);
const showForm = ref(false);
const editingAlgo = ref(null);
const saving = ref(false);
const formError = ref(null);

const defaultRule = () => ({ field: '', operator: '', value: '' });
const defaultForm = () => ({
  name: '',
  description: '',
  matchMode: 'ALL',
  rules: [defaultRule()],
  outputType: 'template',
  templateId: null,
  programId: null,
  customText: '',
  priority: 0
});

const form = ref(defaultForm());

const ruleFields = [
  { value: 'skinType', label: 'Тип кожи', type: 'enum' },
  { value: 'age', label: 'Возраст', type: 'number' },
  { value: 'consultationGoal', label: 'Цель консультации', type: 'enum' },
  { value: 'priceRange', label: 'Ценовой диапазон', type: 'enum' },
  { value: 'mainProblems', label: 'Основные проблемы', type: 'text' },
  { value: 'additionalComment', label: 'Комментарий', type: 'text' },
  { value: 'source', label: 'Источник', type: 'enum' }
];

const enumValues = {
  skinType: [
    { value: 'DRY', label: 'Сухая' },
    { value: 'OILY', label: 'Жирная' },
    { value: 'COMBINATION', label: 'Комбинированная' },
    { value: 'NORMAL', label: 'Нормальная' }
  ],
  consultationGoal: [
    { value: 'FULL_CARE', label: 'Подбор ухода' },
    { value: 'REVIEW_CARE', label: 'Разбор текущего ухода' },
    { value: 'ADDITIONAL_PRODUCTS', label: 'Дополнительные средства' }
  ],
  priceRange: [
    { value: 'UP_TO_5000', label: 'до 5 000 руб.' },
    { value: 'UP_TO_10000', label: 'до 10 000 руб.' },
    { value: 'UP_TO_20000', label: 'до 20 000 руб.' },
    { value: 'OVER_20000', label: 'более 20 000 руб.' }
  ],
  source: [
    { value: 'TELEGRAM', label: 'Telegram' },
    { value: 'WEB', label: 'Сайт' }
  ]
};

const operatorsByType = {
  enum: [
    { value: 'equals', label: 'равно' },
    { value: 'not_equals', label: 'не равно' },
    { value: 'in', label: 'в списке' }
  ],
  number: [
    { value: 'equals', label: 'равно' },
    { value: 'gte', label: '>=' },
    { value: 'lte', label: '<=' },
    { value: 'between', label: 'между' }
  ],
  text: [
    { value: 'contains', label: 'содержит' }
  ]
};

function getFieldType(field) {
  const f = ruleFields.find(r => r.value === field);
  return f?.type || 'text';
}

function getOperators(field) {
  return operatorsByType[getFieldType(field)] || [];
}

function getEnumValues(field) {
  return enumValues[field] || [];
}

function onFieldChange(rule) {
  rule.operator = '';
  rule.value = '';
}

function addRule() {
  form.value.rules.push(defaultRule());
}

function openForm(algo = null) {
  editingAlgo.value = algo;
  formError.value = null;
  if (algo) {
    form.value = {
      name: algo.name,
      description: algo.description || '',
      matchMode: algo.matchMode,
      rules: JSON.parse(JSON.stringify(algo.rules)),
      outputType: algo.outputType,
      templateId: algo.templateId,
      programId: algo.programId,
      customText: algo.customText || '',
      priority: algo.priority
    };
  } else {
    form.value = defaultForm();
  }
  showForm.value = true;
}

async function saveForm() {
  formError.value = null;
  if (!form.value.name.trim()) {
    formError.value = 'Введите название';
    return;
  }
  const validRules = form.value.rules.filter(r => r.field && r.operator);
  if (validRules.length === 0) {
    formError.value = 'Добавьте хотя бы одно правило';
    return;
  }

  saving.value = true;
  try {
    const data = {
      name: form.value.name,
      description: form.value.description || null,
      matchMode: form.value.matchMode,
      rules: validRules,
      outputType: form.value.outputType,
      templateId: form.value.outputType === 'template' ? form.value.templateId : null,
      programId: form.value.outputType === 'program' ? form.value.programId : null,
      customText: form.value.outputType === 'text' ? form.value.customText : null,
      priority: form.value.priority
    };

    if (editingAlgo.value) {
      const res = await updateAlgorithm(editingAlgo.value.id, data);
      const idx = algorithms.value.findIndex(a => a.id === editingAlgo.value.id);
      if (idx !== -1) algorithms.value[idx] = res.data.algorithm;
    } else {
      const res = await createAlgorithm(data);
      algorithms.value.unshift(res.data.algorithm);
    }
    showForm.value = false;
  } catch (e) {
    formError.value = e.response?.data?.error || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}

async function toggleActive(algo) {
  try {
    const res = await updateAlgorithm(algo.id, { isActive: !algo.isActive });
    algo.isActive = res.data.algorithm.isActive;
  } catch (e) { /* silent */ }
}

async function remove(algo) {
  if (!confirm(`Удалить алгоритм "${algo.name}"?`)) return;
  try {
    await deleteAlgorithm(algo.id);
    algorithms.value = algorithms.value.filter(a => a.id !== algo.id);
  } catch (e) { /* silent */ }
}

onMounted(async () => {
  try {
    const [algoRes, tRes, pRes] = await Promise.all([
      getAlgorithms(),
      getTemplates(),
      getPrograms()
    ]);
    algorithms.value = algoRes.data.algorithms;
    templates.value = tRes.data.templates || [];
    programs.value = pRes.data.programs || [];
  } catch (e) {
    // silent
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page { padding: 32px; max-width: 900px; }
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin: 0; }
h3 { font-size: 18px; color: #1a1a1c; margin-bottom: 20px; }
.loading { text-align: center; padding: 48px; color: #999; font-size: 14px; }
.empty { text-align: center; padding: 48px; color: #999; font-size: 14px; background: #fff; border: 1px solid #e8e4db; border-radius: 14px; }

.algo-list { display: flex; flex-direction: column; gap: 12px; }
.algo-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 20px;
}
.algo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.algo-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.algo-name { font-weight: 600; font-size: 15px; color: #1a1a1c; }
.algo-priority { font-size: 11px; color: #999; }
.algo-actions { display: flex; align-items: center; gap: 8px; }
.algo-desc { font-size: 13px; color: #666; margin-top: 8px; }
.algo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.algo-tag {
  font-size: 11px;
  background: #f5f0ea;
  color: #8b7355;
  padding: 3px 8px;
  border-radius: 4px;
}

/* Toggle */
.toggle { position: relative; display: inline-block; width: 38px; height: 20px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: #ccc; border-radius: 20px; transition: 0.3s;
}
.toggle-slider::before {
  content: ''; position: absolute; height: 16px; width: 16px;
  left: 2px; bottom: 2px; background: #fff; border-radius: 50%; transition: 0.3s;
}
.toggle input:checked + .toggle-slider { background: #8b7355; }
.toggle input:checked + .toggle-slider::before { transform: translateX(18px); }

.icon-btn {
  background: none; border: none; cursor: pointer; padding: 4px;
  color: #666; transition: color 0.2s;
}
.icon-btn:hover { color: #1a1a1c; }
.icon-btn-danger:hover { color: #dc2626; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal {
  background: #fff; border-radius: 16px; padding: 28px;
  width: 100%; max-height: 85vh; overflow-y: auto;
}
.modal-wide { max-width: 600px; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block; font-size: 13px; font-weight: 500;
  color: #1a1a1c; margin-bottom: 6px;
}
.form-input {
  width: 100%; padding: 10px 14px;
  border: 1px solid #e8e4db; border-radius: 8px;
  font-size: 14px; font-family: 'Inter', sans-serif;
  background: #faf9f7; color: #1a1a1c; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #8b7355; }
.form-input-sm { padding: 8px 10px; font-size: 13px; }
.form-select {
  padding: 8px 10px; border: 1px solid #e8e4db;
  border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif;
  background: #faf9f7; color: #1a1a1c;
}
.form-select:focus { outline: none; border-color: #8b7355; }

.radio-row { display: flex; gap: 16px; }
.radio-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #666; cursor: pointer;
}

.rule-row {
  display: flex; gap: 6px; align-items: center;
  margin-bottom: 6px; flex-wrap: wrap;
}
.rule-row .form-select { flex: 1; min-width: 120px; }
.rule-row .form-input-sm { flex: 1; min-width: 80px; }

.form-error {
  padding: 10px; background: #fef2f2;
  border: 1px solid #fecaca; color: #dc2626;
  border-radius: 8px; font-size: 13px; margin-bottom: 12px;
}
.form-actions {
  display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;
}

.btn {
  padding: 10px 20px; font-size: 14px; font-weight: 600;
  border-radius: 10px; border: none; cursor: pointer;
  font-family: 'Inter', sans-serif; transition: all 0.2s;
}
.btn-primary { background: #8b7355; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #7a6348; }
.btn-secondary { background: transparent; color: #666; border: 1px solid #e8e4db; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
  .page { padding: 20px 16px; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .rule-row { flex-direction: column; }
}
</style>
