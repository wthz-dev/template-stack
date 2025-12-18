<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');

async function submit() {
  error.value = '';
  try {
    await auth.login({ email: email.value, password: password.value });
    const redirect = route.query.redirect || '/admin/articles';
    router.push(String(redirect));
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Login failed';
  }
}
</script>

<template>
  <div class="container" style="max-width: 520px">
    <div class="stack" style="margin-top: 40px">
      <h1>Admin Login</h1>

      <div v-if="error" class="card error">{{ error }}</div>

      <form class="card stack" @submit.prevent="submit">
        <div class="stack" style="gap: 6px">
          <label class="muted">Email</label>
          <input class="input" v-model="email" type="email" autocomplete="username" required />
        </div>

        <div class="stack" style="gap: 6px">
          <label class="muted">Password</label>
          <input class="input" v-model="password" type="password" autocomplete="current-password" required />
        </div>

        <button class="btn" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <div class="muted" style="font-size: 13px">
          Seed users (from API env): admin/editor
        </div>
      </form>
    </div>
  </div>
</template>
