import { authRequest } from '../request';

export const showPage = async (pageId: number) => {
    return authRequest(`/api/v1/portal/admin/app_page/${pageId}`, {
        method: 'get',
      });
}

export const savePage = async (pageId: number, data = {}) => {
  return authRequest(`/api/v1/portal/admin/app_page/${pageId}`, {
    method: 'post',
    data
  });
};
