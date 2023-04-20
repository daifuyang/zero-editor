import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from '@alifd/next';
import { saveSchema, resetSchema, readLocalSchema, saveBakSchema } from '../../services/form/service';

// 保存功能示例
const SaveWebsitePlugin = (ctx: IPublicModelPluginContext, options: any) => {
  const backup = (pageId: number) => {
    saveBakSchema(pageId);
    console.log('auto backup finished');
  };

  const autoSave = (pageId: number, first = true) => {
    if (first) {
      backup(pageId);
    }
    setTimeout(() => {
      backup(pageId);
      autoSave(pageId, false);
    }, 1000 * 60 * 2);
  };

  return {
    async init() {
      const { skeleton, hotkey, config } = ctx;

      const scenarioName = config.get('scenarioName');
      const formData = config.get('formData');

      const {
        state: { formId },
      } = window as any;

      // autoSave(formId);

      skeleton.add({
        name: 'resetSchema',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: <Button onClick={() => resetSchema(scenarioName)}>重置画布</Button>,
      });

      skeleton.add({
        name: 'localSchema',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: <Button onClick={() => readLocalSchema()}>加载草稿</Button>,
      });

      skeleton.add({
        name: 'saveSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: <Button onClick={() => saveSchema(formData)}>保存</Button>,
      });

      hotkey.bind('command+s', (e) => {
        e.preventDefault();
        saveSchema(formData);
      });
    },
  };
};
SaveWebsitePlugin.pluginName = 'SaveWebsitePlugin';
SaveWebsitePlugin.meta = {
  dependencies: ['FormInitPlugin'],
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
export default SaveWebsitePlugin;
