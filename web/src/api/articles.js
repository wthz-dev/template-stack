import { http } from './http';

export async function listPublicArticles(params) {
  const { data } = await http.get('/articles', { params });
  return data;
}

export async function getPublicArticleBySlug(slug) {
  const { data } = await http.get(`/articles/${encodeURIComponent(slug)}`);
  return data;
}

export async function listAdminArticles(params) {
  const { data } = await http.get('/admin/articles', { params });
  return data;
}

export async function getAdminArticleById(id) {
  const { data } = await http.get(`/admin/articles/${id}`);
  return data;
}

export async function createAdminArticle(payload) {
  const { data } = await http.post('/admin/articles', payload);
  return data;
}

export async function updateAdminArticle(id, payload) {
  const { data } = await http.put(`/admin/articles/${id}`, payload);
  return data;
}

export async function deleteAdminArticle(id) {
  await http.delete(`/admin/articles/${id}`);
}
