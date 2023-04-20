import { authRequest } from '../../request';

export const listPage = async (appId: number,params = {}) => {
  return authRequest(`/api/v1/portal/admin/app_page/all/${appId}`, {
      method: 'get',
      params
    });
}

export const showPage = async (pageId: number) => {
    return authRequest(`/api/v1/portal/admin/app_page/${pageId}`, {
        method: 'get',
      });
}

export const addPage = async (data = {}) => {
  return authRequest('/api/v1/portal/admin/app_page', {
    method: 'post',
    data
  });
};

export const savePage = async (pageId: number, data = {}) => {
  return authRequest(`/api/v1/portal/admin/app_page/${pageId}`, {
    method: 'post',
    data
  });
};
