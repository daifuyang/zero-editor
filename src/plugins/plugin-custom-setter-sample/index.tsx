import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import BehaviorSetter from './setters/behavior-setter';
import CustomSetter from './setters/custom-setter';
import EditSetter from './setters/edit-setter';

// 保存功能示例
const CustomSetterSamplePlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { setters } = ctx;
      setters.registerSetter('EditSetter', EditSetter);
      // setters.registerSetter('BehaviorSetter', BehaviorSetter);
      // setters.registerSetter('CustomSetter', CustomSetter);
    },
  };
}
CustomSetterSamplePlugin.pluginName = 'CustomSetterSamplePlugin';
export default CustomSetterSamplePlugin;