<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const userLabel = computed(() => {
  if (!auth.user) return '';
  return `${auth.user.email} (${auth.user.role})`;
});

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <div>
    <div class="nav">
      <div class="container nav-inner">
        <div class="row" style="gap: 10px">
          <router-link to="/admin/articles"><strong>Admin</strong></router-link>
          <span v-if="userLabel" class="muted">{{ userLabel }}</span>
        </div>
        <div class="nav-links">
          <router-link to="/articles">Public</router-link>
          <button class="btn secondary" type="button" @click="logout">Logout</button>
        </div>
      </div>
    </div>

    <div class="container">
      <router-view />
    </div>
  </div>
</template>
