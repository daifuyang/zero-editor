import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from '@alifd/next';
import {
  saveSchema,
} from '../../services/form/mockService';

import { doPreview } from '../plugin-web-preview';

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
}
PreviewWebPlugin.pluginName = 'PreviewWebPlugin';
PreviewWebPlugin.meta = {
  dependencies: ['FormInitPlugin'],
};
export default PreviewWebPlugin;