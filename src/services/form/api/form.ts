import { authRequest } from '../../request';

export const forms = async (params = {}) => {
  return authRequest(`/api/v1/portal/admin/form`, {
      method: 'get',
      params
    });
}

(window as any).services.forms = forms

export const showForm = async (formId: number) => {
    return authRequest(`/api/v1/portal/admin/form/${formId}`, {
        method: 'get',
      });
}

export const addForm = async (data = {}) => {
  return authRequest('/api/v1/portal/admin/form', {
    method: 'post',
    data
  });
};

export const saveForm = async (formId: number, data = {}) => {
  return authRequest(`/api/v1/portal/admin/form/${formId}`, {
    method: 'post',
    data
  });
};
