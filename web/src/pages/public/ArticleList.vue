<script setup>
import { onMounted, ref } from 'vue';
import { listPublicArticles } from '../../api/articles';

const loading = ref(false);
const error = ref('');
const items = ref([]);
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 });

async function load(page = 1) {
  loading.value = true;
  error.value = '';
  try {
    const result = await listPublicArticles({ page, limit: pagination.value.limit });
    items.value = result.items || [];
    pagination.value = result.pagination || pagination.value;
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Failed to load articles';
  } finally {
    loading.value = false;
  }
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString();
}

onMounted(() => load(1));
</script>

<template>
  <div class="stack">
    <h1>Articles</h1>

    <div v-if="error" class="card error">{{ error }}</div>

    <div v-if="loading" class="muted">Loading...</div>

    <div v-else class="stack">
      <div v-for="a in items" :key="a.id" class="card">
        <div class="stack" style="gap: 6px">
          <router-link :to="`/articles/${a.slug}`"><strong>{{ a.title }}</strong></router-link>
          <div class="muted" style="font-size: 13px">{{ formatDate(a.publishedAt) }}</div>
          <div v-if="a.summary" class="muted">{{ a.summary }}</div>
        </div>
      </div>

      <div class="row" style="justify-content: space-between">
        <button
          class="btn secondary"
          type="button"
          :disabled="pagination.page <= 1 || loading"
          @click="load(pagination.page - 1)"
        >
          Prev
        </button>

        <div class="muted">Page {{ pagination.page }} / {{ pagination.totalPages }}</div>

        <button
          class="btn secondary"
          type="button"
          :disabled="pagination.page >= pagination.totalPages || loading"
          @click="load(pagination.page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
