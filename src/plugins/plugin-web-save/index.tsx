import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from '@alifd/next';
import { saveSchema, resetSchema, readLocalSchema, saveBakSchema } from '../../services/website/service';

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
      const pageData = config.get('pageData');

      const {
        state: { pageId },
      } = window as any;

      // autoSave(pageId);

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
        content: <Button onClick={() => readLocalSchema(pageId)}>加载草稿</Button>,
      });

      skeleton.add({
        name: 'saveSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: <Button onClick={() => saveSchema(pageData)}>保存</Button>,
      });

      hotkey.bind('command+s', (e) => {
        e.preventDefault();
        saveSchema(pageData);
      });
    },
  };
};
SaveWebsitePlugin.pluginName = 'SaveWebsitePlugin';
SaveWebsitePlugin.meta = {
  dependencies: ['WebInitPlugin'],
  preferenceDeclaration: {
    title: '插件配置',
    properties: [],
  },
};
export default SaveWebsitePlugin;
