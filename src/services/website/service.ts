import { material, project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject';
import { Message, Dialog } from '@alifd/next';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
import { addPage, savePage } from './api/appPage';
import _ from 'lodash';
import _set from 'lodash/set';
import schema from './schema.json';

export const saveBakSchema = async (pageId: number) => {
  // 保持到草稿
  const scenarioName = 'bak_page_' + pageId;
  setProjectSchemaToLocalStorage(scenarioName);
  await setPackgesToLocalStorage(scenarioName);
};

const assignSnippet = (schema: any) => {
  const component = schema?.exportSchema();
  const snippet = {
    componentName: component?.componentName,
    title: component?.title,
    props: component?.props,
    children: component?.children,
  };

  return snippet;
};

export const saveSchema = async (pageData: any) => {
  const {
    state: { appId, pageId },
  } = window as any;
  // 保存到草稿
  saveBakSchema(pageId);

  // 获取公共区块schema
  let headerSchema: any = project.currentDocument?.root?.children?.find(
    (n) => n.componentName === 'Header',
  );

  let footerSchema: any = project.currentDocument?.root?.children?.find(
    (n) => n.componentName === 'Footer',
  );

  const {
    publicPage: { header, footer, headerId, headerStatus, footerId, footerStatus },
  } = window as any;

  let headerRes: any;
  if (headerSchema) {
    const snippet = assignSnippet(headerSchema);
    const saveSchema = {
      dataSource: {
        list: [
          {
            type: 'fetch',
            isInit: true,
            options: {
              params: {},
              method: 'GET',
              isCors: true,
              timeout: 5000,
              headers: {},
              uri: '/api/v1/portal/app/nav/1',
            },
            id: 'nav',
            dataHandler: {
              type: 'JSFunction',
              value:
                'function(res) { \n  if(res.code != 1) {\n    return []\n  }\n  return res.data \n  }',
            },
          },
        ],
      },
      snippet,
    };
    const params = {
      appId,
      isPublic: 1,
      name: ' 公共页头',
      type: 'header',
      schema: JSON.stringify(saveSchema),
      status: 1,
    };
    if (headerId) {
      // 修改
      headerRes = await savePage(headerId, params);
    } else {
      // 新增
      headerRes = await addPage(params);
    }
  } else if(headerId) {
    let params: any = {
      ...header,
      status: 0,
    };
    if (headerStatus != 0) {
      headerRes = await savePage(headerId, params);
    }
  }

  let footerRes: any;
  if (footerSchema) {
    const snippet = assignSnippet(footerSchema);
    const saveSchema = {
      snippet,
    };
    const params = {
      appId,
      isPublic: 1,
      name: ' 公共页脚',
      type: 'footer',
      schema: JSON.stringify(saveSchema),
      status: 1,
    };
    if (footerId) {
      // 修改
      footerRes = await savePage(footerId, params);
    } else {
      // 新增
      footerRes = await addPage(params);
    }
  } else if(footerId) {
    let params: any = {
      ...footer,
      status: 0,
    };
    if (footerStatus != 0) {
      footerRes = await savePage(footerId, params);
    }
  }

  const exportSchema = project.exportSchema(IPublicEnumTransformStage.Save);

  if (pageData.type == 'article' || pageData.type == 'list') {
    // 删除演示数据api
    const oldList = exportSchema?.componentsTree?.[0]?.dataSource?.list || [];
    const newList = _.filter(oldList, function (o) {
      return o.id != 'data';
    });
    _set(exportSchema, 'componentsTree[0].dataSource.list', newList);
  }
  const schema = JSON.stringify(exportSchema);
  const res: any = await savePage(pageId, { ...pageData, schema });
  if (res.code != 1) {
    Message.error(res.msg);
    return;
  }
  Message.success(res.msg);
};

export const readLocalSchema = (pageId: number) => {
  const scenarioName = 'bak_page_' + pageId;
  const schemaObj = getProjectSchemaFromLocalStorage(scenarioName);
  const pageSchema = schemaObj?.componentsTree?.[0];

  if (pageSchema) {
    // 加载 schema
    project.getCurrentDocument()?.importSchema(pageSchema);
    project.simulatorHost?.rerender();
    Message.success('本地草稿恢复成功！');
    return;
  }
  Message.success('暂无本地草稿！');
};

export const resetSchema = async (scenarioName: string = 'unknown') => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: '确定要重置吗？您所有的修改都将消失！',
        onOk: () => {
          resolve();
        },
        onCancel: () => {
          reject();
        },
      });
    });
  } catch (err) {
    return;
  }

  let defaultSchema = schema || {
    componentsTree: [{ componentName: 'Page', fileName: 'sample' }],
    componentsMap: material.componentsMap,
    version: '1.0.0',
    i18n: {},
  };

  project.getCurrentDocument()?.importSchema(defaultSchema as any);
  project.simulatorHost?.rerender();

  setProjectSchemaToLocalStorage(scenarioName);
  await setPackgesToLocalStorage(scenarioName);
  Message.success('成功重置页面');
};

const getLSName = (scenarioName: string, ns: string = 'projectSchema') => `${scenarioName}:${ns}`;

export const getProjectSchemaFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName)) || '{}');
};

const setProjectSchemaToLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }

  const saveData = JSON.stringify(project.exportSchema(IPublicEnumTransformStage.Save));
  window.localStorage.setItem(getLSName(scenarioName), saveData);
};

const setPackgesToLocalStorage = async (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  const packages = await filterPackages(material.getAssets().packages);
  window.localStorage.setItem(getLSName(scenarioName, 'packages'), JSON.stringify(packages));
};

export const getPackagesFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName, 'packages')) || '{}');
};

export const getPageSchema = async (data: any) => {
  const { schema } = data;
  const schemaObj = JSON.parse(schema || '{}');
  const pageSchema = schemaObj?.componentsTree?.[0];

  if (pageSchema) {
    return pageSchema;
  }

  return schema;
};
