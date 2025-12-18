<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  createAdminArticle,
  getAdminArticleById,
  updateAdminArticle
} from '../../api/articles';
import { uploadAdminFile } from '../../api/uploads';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref('');

const id = computed(() => route.params.id);
const isEdit = computed(() => !!id.value);

const slug = ref('');
const title = ref('');
const summary = ref('');
const content = ref('# New Article\n\nWrite markdown here...');
const status = ref('draft');
const scheduledAtInput = ref('');

const contentTextarea = ref(null);
const uploadLoading = ref(false);
const uploadError = ref('');
const lastUpload = ref(null);

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDatetimeLocalInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function insertIntoContent(text) {
  const current = content.value || '';
  const el = contentTextarea.value;

  if (!el || typeof el.selectionStart !== 'number' || typeof el.selectionEnd !== 'number') {
    content.value = `${current}${text}`;
    return;
  }

  const start = el.selectionStart;
  const end = el.selectionEnd;
  content.value = `${current.slice(0, start)}${text}${current.slice(end)}`;

  nextTick(() => {
    try {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    } catch (e) {}
  });
}

async function handleFileChange(e) {
  const file = e?.target?.files?.[0];
  if (!file) return;

  uploadLoading.value = true;
  uploadError.value = '';
  lastUpload.value = null;
  try {
    const result = await uploadAdminFile(file);
    const item = result.item;
    lastUpload.value = item;

    const name = item.originalName || item.filename;
    const isImage = item.mimeType && item.mimeType.startsWith('image/');
    const md = isImage
      ? `\n\n![${name}](${item.url})\n\n`
      : `\n\n[${name}](${item.url})\n\n`;

    insertIntoContent(md);
  } catch (err) {
    uploadError.value = err?.response?.data?.error?.message || 'Upload failed';
  } finally {
    uploadLoading.value = false;
    if (e?.target) e.target.value = '';
  }
}

const previewHtml = computed(() => {
  const raw = marked.parse(content.value || '');
  return DOMPurify.sanitize(raw);
});

async function load() {
  if (!isEdit.value) return;

  loading.value = true;
  error.value = '';
  try {
    const result = await getAdminArticleById(id.value);
    const a = result.item;

    slug.value = a.slug || '';
    title.value = a.title || '';
    summary.value = a.summary || '';
    content.value = a.content || '';
    status.value = a.status || 'draft';
    scheduledAtInput.value = toDatetimeLocalInputValue(a.scheduledAt);
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Failed to load';
  } finally {
    loading.value = false;
  }
}

async function save() {
  error.value = '';

  if (status.value === 'scheduled') {
    if (!scheduledAtInput.value) {
      error.value = 'Scheduled time is required';
      return;
    }

    const d = new Date(scheduledAtInput.value);
    if (Number.isNaN(d.getTime())) {
      error.value = 'Scheduled time is invalid';
      return;
    }
  }

  loading.value = true;
  try {
    const payload = {
      slug: slug.value,
      title: title.value,
      summary: summary.value ? summary.value : null,
      content: content.value,
      status: status.value,
      scheduledAt:
        status.value === 'scheduled'
          ? new Date(scheduledAtInput.value).toISOString()
          : null
    };

    if (isEdit.value) {
      await updateAdminArticle(id.value, payload);
    } else {
      await createAdminArticle(payload);
    }

    router.push('/admin/articles');
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Save failed';
  } finally {
    loading.value = false;
  }
}

watch(status, (v) => {
  if (v !== 'scheduled') {
    scheduledAtInput.value = '';
  }
});

onMounted(() => load());
</script>

<template>
  <div class="stack">
    <div class="row" style="justify-content: space-between">
      <h1 style="margin: 0">{{ isEdit ? 'Edit Article' : 'New Article' }}</h1>
      <div class="row">
        <button class="btn secondary" type="button" @click="router.push('/admin/articles')">
          Back
        </button>
        <button class="btn" type="button" :disabled="loading" @click="save">
          {{ loading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="card error">{{ error }}</div>

    <div class="row" style="align-items: stretch; flex-wrap: wrap">
      <div class="card" style="flex: 1; min-width: 320px">
        <div class="stack">
          <div class="stack" style="gap: 6px">
            <label class="muted">Slug</label>
            <input class="input" v-model="slug" placeholder="my-article" />
          </div>

          <div class="stack" style="gap: 6px">
            <label class="muted">Title</label>
            <input class="input" v-model="title" placeholder="Article title" />
          </div>

          <div class="stack" style="gap: 6px">
            <label class="muted">Summary</label>
            <input class="input" v-model="summary" placeholder="Short summary (optional)" />
          </div>

          <div class="row" style="gap: 10px">
            <div style="flex: 1;gap: 6px" class="stack">
              <label class="muted">Status</label>
              <select class="select" v-model="status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div v-if="status === 'scheduled'" style="flex: 1;gap: 6px" class="stack">
              <label class="muted">Scheduled at</label>
              <input class="input" type="datetime-local" v-model="scheduledAtInput" />
            </div>
          </div>

          <div class="stack" style="gap: 6px">
            <label class="muted">Content (Markdown)</label>
            <textarea ref="contentTextarea" class="textarea" v-model="content"></textarea>
          </div>

          <div class="stack" style="gap: 6px">
            <label class="muted">Upload image / file</label>
            <input
              class="input"
              type="file"
              :disabled="uploadLoading"
              @change="handleFileChange"
            />
            <div v-if="uploadLoading" class="muted">Uploading...</div>
            <div v-if="uploadError" class="error">{{ uploadError }}</div>
            <div v-if="lastUpload" class="muted">
              Uploaded:
              <a :href="lastUpload.url" target="_blank" rel="noreferrer">{{ lastUpload.originalName }}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="flex: 1; min-width: 320px">
        <div class="stack" style="gap: 8px">
          <strong>Preview</strong>
          <div class="markdown" v-html="previewHtml"></div>
        </div>
      </div>
    </div>
  </div>
</template>
