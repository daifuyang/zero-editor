import ReactDOM from 'react-dom';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Notification } from '@alifd/next';
import { injectAssets } from '@alilc/lowcode-plugin-inject';
import assets from 'src/services/console/assets.json';
import { getPageSchema } from 'src/services/console/service';
import { showForm } from 'src/services/console/api/form';
import { request } from 'src/services/request';
import { Empty } from 'antd';

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
  const res: any = await showForm(pageId);
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
        // const assets: any = await request(`/materials/web/assets-dev.json`);
        await material.setAssets(await injectAssets(assets));
      } else {
        const assets: any = await request((window as any).config.consoleAssetsUrl);
        if (assets) {
          await material.setAssets(assets);
        }
      }

      const res = await fetchData();
      if (res.code != 1) {
        Notification.open({ title: '系统错误', content: res.msg, type: 'error' });
        ReactDOM.render(<Empty />, document.body);
        return
      }

      const { data } = res;
      config.set('pageData', data);
      const schema = await getPageSchema(data);
      // // 加载 schema
      project.openDocument(schema);
    },
  };
};
EditorInitPlugin.pluginName = 'WebInitPlugin';
EditorInitPlugin.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'scenarioName',
        type: 'string',
        description: '用于localstorage存储key',
      },
      {
        key: 'displayName',
        type: 'string',
        description: '用于显示的场景名',
      },
      {
        key: 'info',
        type: 'object',
        description: '用于扩展信息',
      },
    ],
  },
};
export default EditorInitPlugin;
