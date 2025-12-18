<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getPublicArticleBySlug } from '../../api/articles';

const route = useRoute();

const loading = ref(false);
const error = ref('');
const article = ref(null);

async function load(slug) {
  loading.value = true;
  error.value = '';
  try {
    const result = await getPublicArticleBySlug(slug);
    article.value = result.item;
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Article not found';
    article.value = null;
  } finally {
    loading.value = false;
  }
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString();
}

const html = computed(() => {
  const md = article.value?.content || '';
  const raw = marked.parse(md);
  return DOMPurify.sanitize(raw);
});

onMounted(() => load(route.params.slug));
watch(
  () => route.params.slug,
  (slug) => load(slug)
);
</script>

<template>
  <div class="stack">
    <div v-if="error" class="card error">{{ error }}</div>

    <div v-else-if="loading" class="muted">Loading...</div>

    <div v-else-if="article" class="stack">
      <div class="stack" style="gap: 6px">
        <h1 style="margin-bottom: 0">{{ article.title }}</h1>
        <div class="muted" style="font-size: 13px">
          {{ formatDate(article.publishedAt) }}
          <span v-if="article.author"> · {{ article.author.email }}</span>
        </div>
      </div>

      <div class="card">
        <div class="markdown" v-html="html" />
      </div>
    </div>
  </div>
</template>
