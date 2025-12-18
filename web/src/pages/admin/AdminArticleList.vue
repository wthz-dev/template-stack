<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { deleteAdminArticle, listAdminArticles } from '../../api/articles';

const router = useRouter();

const loading = ref(false);
const error = ref('');
const items = ref([]);

const status = ref('');
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 });

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString();
}

async function load(page = 1) {
  loading.value = true;
  error.value = '';
  try {
    const params = { page, limit: pagination.value.limit };
    if (status.value) params.status = status.value;

    const result = await listAdminArticles(params);
    items.value = result.items || [];
    pagination.value = result.pagination || pagination.value;
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Failed to load';
  } finally {
    loading.value = false;
  }
}

async function remove(id) {
  if (!confirm('Delete this article?')) return;

  loading.value = true;
  error.value = '';
  try {
    await deleteAdminArticle(id);
    await load(pagination.value.page);
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Delete failed';
  } finally {
    loading.value = false;
  }
}

onMounted(() => load(1));
</script>

<template>
  <div class="stack">
    <div class="row" style="justify-content: space-between">
      <h1 style="margin: 0">Manage Articles</h1>
      <button class="btn" type="button" @click="router.push('/admin/articles/new')">New Article</button>
    </div>

    <div class="card row" style="justify-content: space-between; flex-wrap: wrap">
      <div class="row" style="gap: 8px">
        <span class="muted">Status</span>
        <select class="select" v-model="status" @change="load(1)">
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div class="muted">Total: {{ pagination.total }}</div>
    </div>

    <div v-if="error" class="card error">{{ error }}</div>

    <div v-if="loading" class="muted">Loading...</div>

    <div v-else class="card" style="padding: 0">
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Publish/Schedule</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id">
            <td>
              <router-link :to="`/admin/articles/${a.id}`"><strong>{{ a.title }}</strong></router-link>
              <div v-if="a.author" class="muted" style="font-size: 12px">
                {{ a.author.email }}
              </div>
            </td>
            <td class="muted">{{ a.slug }}</td>
            <td>
              <span class="muted">{{ a.status }}</span>
            </td>
            <td class="muted" style="font-size: 13px">
              <div v-if="a.status === 'published'">{{ formatDate(a.publishedAt) }}</div>
              <div v-else-if="a.status === 'scheduled'">{{ formatDate(a.scheduledAt) }}</div>
              <div v-else>-</div>
            </td>
            <td style="text-align: right">
              <button class="btn danger" type="button" @click="remove(a.id)">Delete</button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="5" class="muted" style="padding: 18px">No items</td>
          </tr>
        </tbody>
      </table>
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
</template>
