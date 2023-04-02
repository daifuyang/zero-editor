import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from '@alifd/next';
import { saveSchema, resetSchema, readLocalSchema, saveBakSchema } from '../../services/service';

// 保存功能示例
const SaveSamplePlugin = (ctx: IPublicModelPluginContext, options: any) => {
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
      const { data } = options;
      const { skeleton, hotkey, config } = ctx;
      const scenarioName = config.get('scenarioName');

      autoSave(data.id);

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
        content: <Button onClick={() => readLocalSchema(data.id)}>加载草稿</Button>,
      });

      skeleton.add({
        name: 'saveSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: <Button onClick={() => saveSchema(data)}>保存</Button>,
      });

      hotkey.bind('command+s', (e) => {
        e.preventDefault();
        saveSchema(data);
      });
    },
  };
};
SaveSamplePlugin.pluginName = 'SaveSamplePlugin';
SaveSamplePlugin.meta = {
  dependencies: ['EditorInitPlugin'],
  preferenceDeclaration: {
    title: '保存插件配置',
    properties: [
      {
        key: 'data',
        type: 'object',
        description: '当前页面的数据',
      },
    ],
  },
};
export default SaveSamplePlugin;
