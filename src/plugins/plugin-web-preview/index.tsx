import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from '@alifd/next';
import { saveSchema } from '../../services/website/mockService';


export const doPreview = (scenarioName:string) => {
  saveSchema(scenarioName);
  setTimeout(() => {
    const search = location.search
      ? `${location.search}&scenarioName=${scenarioName}`
      : `?scenarioName=${scenarioName}`;
    window.open(`./preview.html${search}`);
  }, 500);
};

// 保存功能示例
const PreviewWebPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton, config } = ctx;
      const scenarioName = config.get('scenarioName');
      skeleton.add({
        name: 'previewSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: (
          <Button type="primary" onClick={() => doPreview(scenarioName)}>
            预览
          </Button>
        ),
      });
    },
  };
};
PreviewWebPlugin.pluginName = 'PreviewWebPlugin';
PreviewWebPlugin.meta = {
  dependencies: ['WebInitPlugin'],
};
export default PreviewWebPlugin;
