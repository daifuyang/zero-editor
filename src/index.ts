import { init, plugins } from '@alilc/lowcode-engine';

import WebInitPlugin from './plugins/plugin-web-init'; // 网站配置器注册
import SaveWebsitePlugin from './plugins/plugin-web-save';
import PreviewWebPlugin from './plugins/plugin-web-preview';

import WebDataSource from './plugins/plugin-web-datasource';

import FormInitPlugin from './plugins/plugin-form-init'; // 表单配置器注册
import SaveFormPlugin from './plugins/plugin-form-save';
import PreviewFormPlugin from './plugins/plugin-form-preview';

import UndoRedoPlugin from '@alilc/lowcode-plugin-undo-redo';
import ZhEnPlugin from '@alilc/lowcode-plugin-zh-en';
import CodeGenPlugin from '@alilc/lowcode-plugin-code-generator';
import DataSourcePanePlugin from '@alilc/lowcode-plugin-datasource-pane';
// import DataSourcePanePlugin from '../lowcode-plugins/packages/plugin-datasource-pane/src';
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import CodeEditorPlugin from '@alilc/lowcode-plugin-code-editor';
import ManualPlugin from '@alilc/lowcode-plugin-manual';
import InjectPlugin from '@alilc/lowcode-plugin-inject';
import SimulatorResizerPlugin from '@alilc/lowcode-plugin-simulator-select';
import ComponentPanelPlugin from './plugins/plugin-component-panel';
import AdvComponentPanelPlugin from './plugins/plugin-adv-component-pane';
import DefaultSettersRegistryPlugin from './plugins/plugin-default-setters-registry';
import LoadIncrementalAssetsWidgetPlugin from './plugins/plugin-load-incremental-assets-widget';

import CustomSetterPlugin from './plugins/plugin-custom-setter';
import SetRefPropPlugin from '@alilc/lowcode-plugin-set-ref-prop';
import LogoSamplePlugin from './plugins/plugin-logo-sample';

import { getListLink,getArticleLink, navigatorTo } from 'src/utils/utils'

import moment from 'moment';

import 'antd/dist/antd.css';
import './global.scss';

import { RuntimeOptionsConfig } from '@alilc/lowcode-datasource-types';

import request from 'universal-request';
import { RequestOptions, AsObject } from 'universal-request/lib/types';
import { showPage } from './services/website/api/appPage';
import { getSiteId } from './utils/utils';

export function createFetchHandler(config?: Record<string, unknown>) {
  return async function (options: RuntimeOptionsConfig) {

    const siteId = getSiteId()

    const requestConfig: RequestOptions = {
      ...options,
      url: options.uri,
      method: options.method as RequestOptions['method'],
      data: options.params as AsObject,
      headers: options.headers as AsObject,
      ...config,
    };
    requestConfig.params.siteId = siteId
    const response = await request(requestConfig);
    return response.data;
  };
}

async function registerPlugins() {
  const { state: { scene } = { scene } } = window as any;

  await plugins.register(InjectPlugin);

  const scenarioName = 'codecloud';
  const displayName = 'zerocmf';

  if (scene == 'website') {
    await plugins.register(WebInitPlugin, {
      scenarioName,
      displayName,
    });
    await plugins.register(SaveWebsitePlugin);
    await plugins.register(PreviewWebPlugin);
  } else if (scene == 'form') {
    await plugins.register(FormInitPlugin, {
      scenarioName: 'form-' + scenarioName,
      displayName,
    });
    await plugins.register(SaveFormPlugin);
    await plugins.register(PreviewFormPlugin);
  }

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
        schema: {},
      },
    ],
  });

  await plugins.register(CodeEditorPlugin);

  // 注册出码插件
  // await plugins.register(CodeGenPlugin);

  await plugins.register(CustomSetterPlugin);

  if (scene == 'website') {
    await plugins.register(WebDataSource);
  }
}

(async function main() {
  const { Next } = window as any;
  const { Notification } = Next;
  const params = new URLSearchParams(location.search.slice(1));

  const siteId: any = params.get('siteId'); //
  const scene: any = params.get('scene') || 'website'; // 应用场景
  const appId: any = params.get('appId'); // 渠道id
  const pageId: any = params.get('pageId'); // 页面id
  const debug: any = params.get('debug'); //是否调试模式
  const formId: any = params.get('formId'); // 表单id

  if (!siteId) {
    return Notification.open({ title: '系统错误', content: '站点不存在', type: 'error' });
  }

  if (scene == 'website') {
    if (!appId || !pageId) {
      return Notification.open({ title: '系统错误', content: '错误的URL', type: 'error' });
    }
    if (!pageId) {
      return {
        code: 0,
        msg: '页面不存在',
      };
    }
    const res: any = await showPage(pageId);
    if (res.code != 1) {
      return Notification.open({ title: '系统错误', content: res.msg, type: 'error' });
    }
  } else if (scene == 'form') {
    if (!formId) {
      return Notification.open({ title: '系统错误', content: '错误的URL', type: 'error' });
    }
  }

  (window as any).state = {
    scene,
    appId: Number(appId),
    pageId: Number(pageId),
    formId: Number(formId),
    debug,
  };

  await registerPlugins();
  init(document.getElementById('lce-container')!, {
    // locale: 'zh-CN',
    enableCondition: true,
    enableCanvasLock: true,
    // 默认绑定变量
    supportVariableGlobally: true,
    requestHandlersMap: {
      fetch: createFetchHandler(),
    },
    appHelper:{
      utils: {
        getListLink,
        getArticleLink,
        navigatorTo,
        moment,
      }
    }
  });
})();
