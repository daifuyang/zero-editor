import { init, plugins } from '@alilc/lowcode-engine';
import EditorInitPlugin from './plugins/plugin-editor-init';
import UndoRedoPlugin from '@alilc/lowcode-plugin-undo-redo';
import ZhEnPlugin from '@alilc/lowcode-plugin-zh-en';
import CodeGenPlugin from '@alilc/lowcode-plugin-code-generator';
import DataSourcePanePlugin from '@alilc/lowcode-plugin-datasource-pane';
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import CodeEditorPlugin from '@alilc/lowcode-plugin-code-editor';
import ManualPlugin from '@alilc/lowcode-plugin-manual';
import InjectPlugin from '@alilc/lowcode-plugin-inject';
import SimulatorResizerPlugin from '@alilc/lowcode-plugin-simulator-select';
import ComponentPanelPlugin from './plugins/plugin-component-panel';
import AdvComponentPanelPlugin from './plugins/plugin-adv-component-pane';
import DefaultSettersRegistryPlugin from './plugins/plugin-default-setters-registry';
import LoadIncrementalAssetsWidgetPlugin from './plugins/plugin-load-incremental-assets-widget';
import SaveSamplePlugin from './plugins/plugin-save-sample';
import PreviewSamplePlugin from './plugins/plugin-preview-sample';
import CustomSetterSamplePlugin from './plugins/plugin-custom-setter-sample';
import SetRefPropPlugin from '@alilc/lowcode-plugin-set-ref-prop';
import LogoSamplePlugin from './plugins/plugin-logo-sample';
import './global.scss';
import { showPage } from './services/api/appPage';

import { RuntimeOptionsConfig } from '@alilc/lowcode-datasource-types';

import request from 'universal-request';
import { RequestOptions, AsObject } from 'universal-request/lib/types';

export function createFetchHandler(config?: Record<string, unknown>) {
  return async function(options: RuntimeOptionsConfig) {
    const requestConfig: RequestOptions = {
      ...options,
      url: options.uri,
      method: options.method as RequestOptions['method'],
      data: options.params as AsObject,
      headers: options.headers as AsObject,
      ...config,
    };
    const response = await request(requestConfig);
    return response.data;
  };
}

async function registerPlugins(data: any) {
  await plugins.register(InjectPlugin);

  await plugins.register(EditorInitPlugin, {
    scenarioName: 'codecloud',
    displayName: '码上云',
    data,
  });

  // 设置内置 setter 和事件绑定、插件绑定面板
  await plugins.register(DefaultSettersRegistryPlugin);

  await plugins.register(LogoSamplePlugin);

  await plugins.register(ComponentPanelPlugin);

  await plugins.register(AdvComponentPanelPlugin);

  await plugins.register(SchemaPlugin);

  await plugins.register(ManualPlugin);
  // 注册回退/前进
  await plugins.register(UndoRedoPlugin);

  // 注册中英文切换
  await plugins.register(ZhEnPlugin);

  await plugins.register(SetRefPropPlugin);

  await plugins.register(SimulatorResizerPlugin);

  // await plugins.register(LoadIncrementalAssetsWidgetPlugin);

  // 插件参数声明 & 传递，参考：https://lowcode-engine.cn/site/docs/api/plugins#设置插件参数版本示例
  await plugins.register(DataSourcePanePlugin, {
    importPlugins: [],
    dataSourceTypes: [
      {
        type: 'fetch',
      },
      {
        type: 'jsonp',
      },
    ],
  });

  await plugins.register(CodeEditorPlugin);

  // 注册出码插件
  // await plugins.register(CodeGenPlugin);

  await plugins.register(SaveSamplePlugin, {
    data,
  });

  await plugins.register(PreviewSamplePlugin);

  await plugins.register(CustomSetterSamplePlugin);
}

const fetchData = async () => {
  const pageId: any = new URLSearchParams(location.search.slice(1)).get('pageId');
  if (!pageId) {
    return {
      code: 0,
      msg: '页面不存在',
    };
  }
  const res: any = await showPage(pageId);
  return res;
};

(async function main() {
  const { React, ReactDOM, Next } = window as any;
  const { Notification } = Next;

  const res = await fetchData();
  if (res.code != 1) {
    Notification.open({ title: '系统错误', content: res.msg, type: 'error' });
    return;
  }

  const { data } = res;
  await registerPlugins(data);
  init(document.getElementById('lce-container')!, {
    // locale: 'zh-CN',
    enableCondition: true,
    enableCanvasLock: true,
    // 默认绑定变量
    supportVariableGlobally: true,
    requestHandlersMap: {
      fetch: createFetchHandler(),
    },
  });
})();
