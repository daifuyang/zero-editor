import { material, project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject';
import { Message, Dialog } from '@alifd/next';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
import schemaDefault from './schema.json';
import { saveForm } from './api/form';
import schema from './schema.json';

const nameKey = 'bak_form_';

export const saveBakSchema = async (formId: number) => {
  // 保持到草稿
  const scenarioName = nameKey + formId;
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

const recursionForm = (data: any[] = []) => {
  const form: any = [];
  data.forEach((item: any) => {
    let formItem: any;
    if (item.componentName === 'Form.Item') {
      const { label, name } = item.props;
      formItem = {
        key: name,
        title: label,
      };
    }

    if (item.children) {
      const children: any = recursionForm(item.children);
      form.push(...children);
    }

    if (formItem) form.push(formItem);
  });
  return form;
};

export const saveSchema = async (formData: any) => {
  const {
    state: { formId },
  } = window as any;
  // 保存到草稿
  saveBakSchema(formId);

  const schemaObj: any = project.exportSchema(IPublicEnumTransformStage.Save);
  const formObj = schemaObj['componentsTree'][0]?.children?.[0];
  const columnsObj = recursionForm(formObj.children);
  // 找出当前表单的key value映射用于回显

  const schema = JSON.stringify(schemaObj);
  const columns = JSON.stringify(columnsObj);

  const res:any = await saveForm(formId, { ...formData, schema, columns });

  if(res.code !== 1) {
    Message.error(res.msg)
  }

  Message.success('保存成功!');
};

export const readLocalSchema = () => {
  const {
    state: { formId },
  } = window as any;
  const scenarioName = nameKey + formId;
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

export const getPageSchema = (data: any) => {
  const { schema } = data;
  const schemaObj = JSON.parse(schema || '{}');
  const pageSchema = schemaObj?.componentsTree?.[0];

  if (pageSchema) {
    return pageSchema;
  }

  if (!schema) {
    return schemaDefault;
  }

  return schema;
};

(window as any).getPageSchema = getPageSchema;
