import { http } from './http';

export async function uploadAdminFile(file, options) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await http.post('/admin/uploads', formData, options);
  return data;
}
