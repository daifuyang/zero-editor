import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import BehaviorSetter from './setters/behavior-setter';
import CustomSetter from './setters/custom-setter';
import EditSetter from './setters/edit-setter';
import { DataListSetter } from './setters/webSetters';
import { FormListSetter } from './setters/fomSetters';
import AosSetter from './setters/AosSetter';

// 保存功能示例
const CustomSetterPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { setters } = ctx;
      setters.registerSetter('EditSetter', EditSetter);
      setters.registerSetter('DataListSetter', DataListSetter);
      setters.registerSetter('FormListSetter', FormListSetter);
      setters.registerSetter('AosSetter', AosSetter);
      // setters.registerSetter('BehaviorSetter', BehaviorSetter);
      // setters.registerSetter('CustomSetter', CustomSetter);
    },
  };
};
CustomSetterPlugin.pluginName = 'CustomSetterPlugin';
export default CustomSetterPlugin;
