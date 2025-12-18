import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import PublicLayout from '../layouts/PublicLayout.vue';
import AdminLayout from '../layouts/AdminLayout.vue';

import ArticleList from '../pages/public/ArticleList.vue';
import ArticleDetail from '../pages/public/ArticleDetail.vue';

import AdminLogin from '../pages/admin/AdminLogin.vue';
import AdminArticleList from '../pages/admin/AdminArticleList.vue';
import AdminArticleForm from '../pages/admin/AdminArticleForm.vue';

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', redirect: '/articles' },
      { path: 'articles', component: ArticleList },
      { path: 'articles/:slug', component: ArticleDetail, props: true }
    ]
  },
  {
    path: '/admin/login',
    component: AdminLogin
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin', 'editor'] },
    children: [
      { path: '', redirect: '/admin/articles' },
      { path: 'articles', component: AdminArticleList },
      { path: 'articles/new', component: AdminArticleForm },
      { path: 'articles/:id', component: AdminArticleForm, props: true }
    ]
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.path === '/admin/login' && auth.token) {
    try {
      if (!auth.user) await auth.fetchMe();
      return '/admin/articles';
    } catch {
      auth.logout();
    }
  }

  if (!to.meta?.requiresAuth) return true;

  if (!auth.token) {
    return { path: '/admin/login', query: { redirect: to.fullPath } };
  }

  if (!auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      auth.logout();
      return { path: '/admin/login', query: { redirect: to.fullPath } };
    }
  }

  const allowedRoles = to.meta?.roles;
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(auth.user?.role)) {
      return '/';
    }
  }

  return true;
});
