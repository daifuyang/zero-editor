import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Notification } from '@alifd/next';
import { injectAssets } from '@alilc/lowcode-plugin-inject';
import assets from 'src/services/website/assets.json';
import { getPageSchema } from 'src/services/website/service';
import { listPage } from 'src/services/website/api/appPage';
import { showPage } from '../../services/website/api/appPage';
import { request } from 'src/services/request';

const assignSchema = (data: any, schema: any, position: 'start' | 'end' = 'end') => {
  const schemaStr = data.schema;
  let snippet = null;
  let dataSource: any = {};
  try {
    if (schemaStr) {
      const schemaObj = JSON.parse(schemaStr);
      snippet = schemaObj.snippet;
      dataSource = schemaObj.dataSource;
    }
  } catch (error) {}

  if (snippet) {
    if (position == 'start') {
      schema.children.unshift(snippet);
    } else {
      schema.children.push(snippet);
    }
  }

  // 增加必要的数据源
  if (schema.dataSource?.list && dataSource?.list) {
    const { list = [] } = dataSource;
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      const itemExist = schema?.dataSource?.list.find((n: any) => {
        return n.id === item.id;
      });
      if (!itemExist) {
        schema.dataSource?.list?.push(item);
      }
    }
  }
};

const fetchData = async () => {
  const pageId: any = (window as any).state.pageId;
  if (!pageId) {
    return {
      code: 0,
      msg: '页面不存在',
    };
  }
  const res: any = await showPage(pageId);
  return res;
};

const EditorInitPlugin = (ctx: IPublicModelPluginContext, options: any) => {
  return {
    async init() {
      const { material, config, project } = ctx;

      const scenarioName = options['scenarioName'];
      const scenarioDisplayName = options['displayName'] || scenarioName;
      const scenarioInfo = options['info'] || {};
      // 保存在config中用于引擎范围其他插件使用
      config.set('scenarioName', scenarioName);
      config.set('scenarioDisplayName', scenarioDisplayName);
      config.set('scenarioInfo', scenarioInfo);

      const {
        state: { appId, debug },
      } = window as any;

      // 设置物料描述
      if (debug != null) {
        await material.setAssets(await injectAssets(assets));
      } else {
        const assets: any = await request((window as any).config.webAssetsUrl);
        if (assets) {
          await material.setAssets(assets);
        }
      }

      const res = await fetchData();
      if (res.code != 1) {
        return Notification.open({ title: '系统错误', content: res.msg, type: 'error' });
      }

      const { data } = res;
      config.set('pageData', data);

      const schema = await getPageSchema(data);
      (window as any).publicPage = {
        headerId: 0,
        footerId: 0,
      };

      const hasHeader = schema.children?.filter((n: any) => n.componentName !== 'Header');
      const hasFooter = schema.children?.filter((n: any) => n.componentName !== 'Footer');
      if (hasHeader || hasFooter) {
        const publicRes: any = await listPage(appId, { isPublic: 1, paginate: 'no' });
        if (publicRes.code === 1) {
          // 加载公共区块
          const { data = [] } = publicRes;
          let header = data?.find((n: any) => n.type === 'header');
          let footer = data?.find((n: any) => n.type === 'footer');
          if (header && hasHeader) {
            (window as any).publicPage.headerId = header.id;
            (window as any).publicPage.headerStatus = header.status;
            (window as any).publicPage.header = header;
            schema.children = hasHeader;
            assignSchema(header, schema, 'start');
          }

          if (footer && hasFooter) {
            (window as any).publicPage.footerId = footer.id;
            (window as any).publicPage.footerStatus = footer.status;
            (window as any).publicPage.footer = footer;
            schema.children = hasFooter;
            assignSchema(footer, schema);
          }
        }
      }
      // 加载 schema
      project.openDocument(schema);
    },
  };
};
EditorInitPlugin.pluginName = 'WebInitPlugin';
EditorInitPlugin.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [],
  },
};
export default EditorInitPlugin;
