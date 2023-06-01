import { authRequest } from '../../request';

export function getForms(data: any = {}) {
  return authRequest('/api/v1/lowcode/admin/form', {
    method: 'get',
    data,
  });
}

export function addForm(data: any = {}) {
  return authRequest('/api/v1/lowcode/admin/form', {
    method: 'POST',
    data,
  });
}

export function showForm(formId:string) {
  return authRequest(`/api/v1/lowcode/admin/form/${formId}`,{
  });
}

export function editForm(id: string,data: any = {}) {
  return authRequest(`/api/v1/lowcode/admin/form/${id}`, {
    method: 'POST',
    data,
  });
}
