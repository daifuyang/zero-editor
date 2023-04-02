import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import ComponentsPane from './src';
const ComponentAdvComponentPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton, project } = ctx;
      // 注册组件面板
      const componentsPane = skeleton.add({
        area: 'leftArea',
        type: 'PanelDock',
        name: 'advComponentsPane',
        content: ComponentsPane,
        contentProps: {},
        props: {
          align: 'top',
          icon: 'geshi',
          description: '高级组件',
        },
      });
      componentsPane?.disable?.();
      project.onSimulatorRendererReady(() => {
        componentsPane?.enable?.();
      })
    },
  };
}
ComponentAdvComponentPlugin.pluginName = 'ComponentAdvComponentPlugin';
export default ComponentAdvComponentPlugin;