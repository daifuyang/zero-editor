import { Modal } from "antd";

export function getTextReader(lang: string) {
  return (input: Text): string => {
    if (typeof input === 'string') {
      return input;
    }
    if (typeof input === 'object' && input.type === 'i18n') {
      return input[lang];
    }
    return '';
  };
}

const countDown = (url:string) => {
  const modal = Modal.success({
    title: '系统提示',
    content: `设计模式下无法跳转，请在原站点尝试！跳转链接：${url}?siteId=${getSiteId()}`,
  });
}

export const getListLink = (category: any) => {
  let link = "";
  if (category?.id) {
    link = `/list/${category.id}`;
    const { id, alias } = category;
    if (alias) {
      link = `/${alias}`;
    }
  }
  return link;
};

/*
 *@Author: frank
 *@Date: 2022-07-02 09:52:41
 *@Description: 获取跳转路由链接
 */

export const getArticleLink = (post: any = {}) => {
  if (post?.more_json?.alias) {
    return post?.more_json?.alias;
  }
  let link = "article";
  if (post?.alias) {
    link = post.alias;
  }

  return `/${link}/${post.id}`;
};

export const navigatorTo = (data:any,type:string) => {
  let url
  if (type == "article") {
    url = getArticleLink(data)
  }else {
    url = getListLink(data)
  }
  countDown(url)
}

export const getSiteId = () => {
  const params: any = new URLSearchParams(location.search.slice(1));
  return params.get('siteId');
};
