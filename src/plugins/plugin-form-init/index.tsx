import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Notification } from '@alifd/next';
import { injectAssets } from '@alilc/lowcode-plugin-inject';
import assets from 'src/services/form/assets.json';
import defaultSchema from 'src/services/form/schema.json';
import { request } from 'src/services/request';
import { showForm } from 'src/services/form/api/form';
import { getPageSchema } from 'src/services/form/service';

const fetchData = async () => {
  const formId: any = (window as any).state.formId;
  if (!formId) {
    return {
      code: 0,
      msg: '页面不存在',
    };
  }
  const res: any = await showForm(formId);
  return res;
};

const FormInitPlugin = (ctx: IPublicModelPluginContext, options: any) => {
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
        state: { debug },
      } = window as any;

      // 设置物料描述
      if (debug != null) {
        await material.setAssets(await injectAssets(assets));
      } else {
        const assets: any = await request((window as any).config.formAssetsUrl);
        if (assets) {
          await material.setAssets(assets);
        }
      }

      const res = await fetchData();
      if (res.code != 1) {
        return Notification.open({ title: '系统错误', content: res.msg, type: 'error' });
      }

      const { data } = res;
      config.set('formData', data);

      const schema = await getPageSchema(data);
      // 加载 schema
      project.openDocument(schema);
    },
  };
};
FormInitPlugin.pluginName = 'FormInitPlugin';
FormInitPlugin.meta = {
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
export default FormInitPlugin;
