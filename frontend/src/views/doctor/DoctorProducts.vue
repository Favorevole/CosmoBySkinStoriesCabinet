<template>
  <div class="page">
    <div class="page-header">
      <h1>Каталог продуктов</h1>
      <button @click="openCreate" class="btn btn-primary">+ Добавить</button>
    </div>

    <div class="filters" v-if="categories.length">
      <button :class="['filter-btn', { active: !filterCategory }]" @click="filterCategory = ''; loadItems()">Все</button>
      <button
        v-for="cat in categories"
        :key="cat"
        :class="['filter-btn', { active: filterCategory === cat }]"
        @click="filterCategory = cat; loadItems()"
      >{{ cat }}</button>
    </div>

    <div v-if="successMsg" class="toast">{{ successMsg }}</div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty">Нет продуктов. Добавьте первый!</div>
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="item-card">
        <div class="item-header">
          <strong>{{ item.name }}</strong>
          <span v-if="item.brand" class="tag">{{ item.brand }}</span>
          <span v-if="item.category" class="tag cat">{{ item.category }}</span>
          <span v-if="item.isAffiliate" class="tag affiliate">💰 Партнер</span>
        </div>
        <div v-if="item.shopName" class="item-shop">
          <small>🏪 {{ item.shopName }}</small>
          <small v-if="item.commission" class="commission">Комиссия: {{ item.commission }}%</small>
        </div>
        <a v-if="item.affiliateLink || item.shopUrl || item.url" :href="item.affiliateLink || item.shopUrl || item.url" target="_blank" class="item-url">
          {{ item.affiliateLink ? '🔗 Партнерская ссылка' : (item.shopUrl ? '🏪 Ссылка на магазин' : '🔗 Ссылка') }}
        </a>
        <p v-if="item.notes" class="item-notes">{{ item.notes }}</p>
        <div v-if="item.isAffiliate && (item.clicks > 0 || item.conversions > 0)" class="item-stats">
          <small>👆 Кликов: {{ item.clicks }}</small>
          <small>✅ Конверсий: {{ item.conversions }}</small>
        </div>
        <div class="item-actions">
          <button @click="openEdit(item)" class="btn-link">Редактировать</button>
          <button @click="remove(item.id)" class="btn-link danger">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>{{ editing ? 'Редактировать продукт' : 'Новый продукт' }}</h3>
        <div class="field">
          <label>Название *</label>
          <input type="text" v-model="form.name" placeholder="Название продукта" maxlength="200">
        </div>
        <div class="field">
          <label>Бренд</label>
          <input type="text" v-model="form.brand" placeholder="Бренд">
        </div>
        <div class="field">
          <label>Категория</label>
          <input type="text" v-model="form.category" placeholder="Очищение, Увлажнение, SPF...">
        </div>
        <div class="field">
          <label>Ссылка</label>
          <input type="url" v-model="form.url" placeholder="https://...">
        </div>
        <div class="field">
          <label>Заметки</label>
          <textarea v-model="form.notes" rows="3" placeholder="Заметки о продукте..."></textarea>
        </div>

        <!-- Affiliate fields -->
        <div class="field">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isAffiliate">
            💰 Партнерский продукт (получаю комиссию)
          </label>
        </div>

        <template v-if="form.isAffiliate">
          <div class="field">
            <label>Название магазина</label>
            <input type="text" v-model="form.shopName" placeholder="Ozon, Wildberries, Летуаль..." maxlength="200">
          </div>
          <div class="field">
            <label>Ссылка на магазин</label>
            <input type="url" v-model="form.shopUrl" placeholder="https://ozon.ru/product/...">
            <small class="hint">Прямая ссылка на продукт в магазине</small>
          </div>
          <div class="field">
            <label>Партнерская ссылка</label>
            <input type="url" v-model="form.affiliateLink" placeholder="https://ozon.ru/t/abc123">
            <small class="hint">Реферальная ссылка с вашим кодом</small>
          </div>
          <div class="field">
            <label>Комиссия (%)</label>
            <input type="number" v-model.number="form.commission" placeholder="5" min="0" max="100" step="0.1">
            <small class="hint">Процент комиссии от продажи</small>
          </div>
        </template>
        <div class="modal-actions">
          <button @click="showModal = false" class="btn btn-secondary">Отмена</button>
          <button @click="save" :disabled="!form.name || saving" class="btn btn-primary">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getProductsList, createProduct, updateProduct, deleteProduct } from '../../api/doctorCabinet.js';

const items = ref([]);
const allItems = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editing = ref(null);
const saving = ref(false);
const filterCategory = ref('');
const form = ref({
  name: '',
  brand: '',
  category: '',
  url: '',
  notes: '',
  isAffiliate: false,
  shopName: '',
  shopUrl: '',
  affiliateLink: '',
  commission: null
});
const successMsg = ref(null);

function showSuccess(msg) {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 3000);
}

const categories = computed(() => {
  const cats = new Set(allItems.value.map(i => i.category).filter(Boolean));
  return [...cats].sort();
});

onMounted(loadItems);

async function loadItems() {
  loading.value = true;
  try {
    const res = await getProductsList(filterCategory.value);
    items.value = res.data.products || [];
    if (!filterCategory.value) allItems.value = items.value;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = {
    name: '',
    brand: '',
    category: '',
    url: '',
    notes: '',
    isAffiliate: false,
    shopName: '',
    shopUrl: '',
    affiliateLink: '',
    commission: null
  };
  showModal.value = true;
}

function openEdit(item) {
  editing.value = item.id;
  form.value = {
    name: item.name,
    brand: item.brand || '',
    category: item.category || '',
    url: item.url || '',
    notes: item.notes || '',
    isAffiliate: item.isAffiliate || false,
    shopName: item.shopName || '',
    shopUrl: item.shopUrl || '',
    affiliateLink: item.affiliateLink || '',
    commission: item.commission || null
  };
  showModal.value = true;
}

async function save() {
  saving.value = true;
  try {
    if (editing.value) {
      await updateProduct(editing.value, form.value);
    } else {
      await createProduct(form.value);
    }
    showModal.value = false;
    filterCategory.value = '';
    await loadItems();
    showSuccess(editing.value ? 'Продукт обновлён' : 'Продукт добавлен');
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка');
  } finally {
    saving.value = false;
  }
}

async function remove(id) {
  if (!confirm('Удалить продукт?')) return;
  try {
    await deleteProduct(id);
    filterCategory.value = '';
    await loadItems();
    showSuccess('Продукт удалён');
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка');
  }
}
</script>

<style scoped>
.page { padding: 32px; max-width: 800px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin: 0; }
h3 { font-size: 18px; color: #1a1a1c; margin-bottom: 20px; }
.loading, .empty { text-align: center; padding: 48px; color: #999; font-size: 14px; }

.filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-btn {
  padding: 6px 14px; border: 1px solid #e8e4db; border-radius: 20px; background: #fff;
  color: #666; font-size: 12px; font-family: 'Inter', sans-serif; cursor: pointer;
}
.filter-btn.active { background: #8b7355; color: #fff; border-color: #8b7355; }

.list { display: flex; flex-direction: column; gap: 12px; }
.item-card { background: #fff; border: 1px solid #e8e4db; border-radius: 12px; padding: 18px 20px; }
.item-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.item-header strong { font-size: 15px; color: #1a1a1c; }
.tag { font-size: 11px; background: #f0e6d3; color: #8b7355; padding: 2px 8px; border-radius: 4px; }
.tag.cat { background: #e8e4db; color: #666; }
.tag.affiliate { background: #dcfce7; color: #16a34a; font-weight: 600; }
.item-shop { display: flex; gap: 12px; align-items: center; margin-top: 6px; font-size: 12px; color: #666; }
.item-shop .commission { color: #16a34a; font-weight: 500; }
.item-url { font-size: 13px; color: #8b7355; word-break: break-all; margin-top: 6px; display: inline-block; }
.item-notes { font-size: 13px; color: #666; margin-top: 6px; }
.item-stats { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: #666; }
.item-actions { margin-top: 12px; display: flex; gap: 16px; }
.btn-link { background: none; border: none; color: #8b7355; font-size: 13px; cursor: pointer; padding: 0; font-family: inherit; }
.btn-link:hover { text-decoration: underline; }
.btn-link.danger { color: #dc2626; }

.btn { padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 10px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; }
.btn-primary { background: #8b7355; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #7a6348; }
.btn-secondary { background: transparent; color: #666; border: 1px solid #e8e4db; }
.btn:disabled { opacity: 0.5; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 500px; max-height: 85vh; overflow-y: auto; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 500; color: #666; margin-bottom: 6px; }
.field .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; color: #1a1a1c; }
.field .checkbox-label input[type="checkbox"] { width: auto; cursor: pointer; }
.field .hint { display: block; margin-top: 4px; font-size: 12px; color: #999; }
.field input, .field textarea { width: 100%; padding: 12px 14px; border: 1px solid #e8e4db; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif; color: #1a1a1c; background: #faf9f7; box-sizing: border-box; }
.field input[type="number"] { width: 120px; }
.field textarea { resize: vertical; }
.field input:focus, .field textarea:focus { outline: none; border-color: #8b7355; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

.toast {
  padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
  border-radius: 10px; font-size: 14px; margin-bottom: 16px;
}

@media (max-width: 640px) { .page { padding: 20px 16px; } }
</style>
