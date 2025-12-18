import { defineStore } from 'pinia';
import * as authApi from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth.token') || '',
    user: null,
    loading: false
  }),
  actions: {
    async login({ email, password }) {
      this.loading = true;
      try {
        const result = await authApi.login({ email, password });
        this.token = result.token;
        this.user = result.user;
        localStorage.setItem('auth.token', result.token);
        return result;
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      const result = await authApi.me();
      this.user = result.user;
      return result;
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('auth.token');
    }
  }
});
