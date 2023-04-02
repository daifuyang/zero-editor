import { material, project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject';
import { Message, Dialog } from '@alifd/next';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
import { savePage } from './api/appPage';
import schema from './schema.json';

export const saveBakSchema = async (pageId: number) => {
  // 保持到草稿
  const scenarioName = 'bak_page_' + pageId;
  setProjectSchemaToLocalStorage(scenarioName);
  await setPackgesToLocalStorage(scenarioName);
};

export const saveSchema = async (data: any) => {
  const pageId = data.id;
  // 保持到草稿
  saveBakSchema(pageId);

  const schema = JSON.stringify(project.exportSchema(IPublicEnumTransformStage.Save));
  const res: any = await savePage(pageId, { ...data, schema });
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
    return
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
