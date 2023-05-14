import { authRequest } from 'src/services/request';

export const listCategory = async () => {
  return authRequest(`/api/v1/portal/admin/category/list`, {
    method: 'get',
  });
};

(window as any).services.listCategory = listCategory;

export const postList = async (params = {}) => {
  return authRequest(`/api/v1/portal/app/list`, {
    method: 'get',
    params
  });
};
