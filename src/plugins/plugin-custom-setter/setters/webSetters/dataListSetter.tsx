import { IPublicModelNode, IPublicEnumTransformStage } from '@alilc/lowcode-types';
import * as React from 'react';
import { Modal, Tabs, Tooltip, Button, TreeSelect, Input, Table } from 'antd';
import _ from 'lodash';
import { getTextReader } from 'src/utils/utils';
import './index.scss';

const { Search } = Input;

interface DataListSetterProps {
  // 当前值
  value: any;
  // 默认值
  defaultValue: any;
  // setter 唯一输出
  onChange: (val: any) => void;
  field: any;
  onClose: Function;
}

const columns = [
  {
    title: '分类ID',
    dataIndex: 'id',
    width: 140,
  },
  {
    title: '分类名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '分类描述',
    dataIndex: 'description',
  },
];

type State = {
  open: boolean;
  treeData: any;
  expandedRowKeys: any;
  categoryIds: any;
  categoryData: any;
  scope: string;
};

export default class DataListSetter extends React.PureComponent<DataListSetterProps> {
  // 声明 Setter 的 title
  static displayName = 'DataListSetter';
  handleChange: (value: string) => void;
  onOpen: () => void;
  onOk: () => void;
  onClose: () => void;
  onRowChange: (selectedRowKeys: any) => void;
  state: State;

  t: (input: Text) => string;

  constructor(props: any) {
    super(props);
    this.t = getTextReader('zh-CN');

    const state: State = {
      scope: '',
      expandedRowKeys: [],
      treeData: [],
      categoryIds: [],
      categoryData: [],
      open: false,
    };

    this.state = state;

    this.handleChange = (value: string) => {
      this.setState({
        scope: value,
      });
    };

    this.onOk = () => {
      const { field, value, onChange } = this.props;

      const { node }: { node: IPublicModelNode & { propsData: any } } = field;

      const { scope, categoryIds } = this.state;

      const schema: any = node?.exportSchema(IPublicEnumTransformStage.Save);

      schema.props._unsafe_MixedSetter____loop____select = 'JsonSetter';
      schema.loop = [];

      // 清空原作用域
      if (value?.scope) {
        this.recursionScope(schema.children, value?.scope, (element: any) => {
          const id = `article_list_${this.state.categoryIds.join('_')}`;
          element.props._unsafe_MixedSetter____loop____select = 'VariableSetter';
          // 绑定loop
          element.loop = [];
        });
      }

      if (!scope) {
        const id = `article_list_${categoryIds.join('_')}`;
        schema.props._unsafe_MixedSetter____loop____select = 'VariableSetter';
        schema.loop = {
          type: 'JSExpression',
          value: `this.state.${id}`,
        };
      } else {
        this.recursionScope(schema.children, this.state.scope, (element: any) => {
          const id = `article_list_${this.state.categoryIds.join('_')}`;
          element.props._unsafe_MixedSetter____loop____select = 'VariableSetter';
          // 绑定loop
          element.loop = {
            type: 'JSExpression',
            value: `this.state.${id}`,
          };
        });
      }

      node?.importSchema(schema);

      // 新增数据源数据

      // 1、获取当前作用域
      // 2、替换到数据源
      // 3、删除原来的绑定loop，修改为当前作用域下的loop
      if (value?.categoryIds != categoryIds) {
        onChange({
          title: '文章分类',
          categoryIds: this.state.categoryIds,
          scope,
        });

        const id = `article_list_${categoryIds.join('_')}`;

        // 增加文章列表
        const apiList = [
          {
            type: 'fetch',
            isInit: true,
            options: {
              params: {
                pageSize: '8',
              },
              method: 'GET',
              isCors: false,
              timeout: 5000,
              headers: {},
              uri: `/api/v1/portal/app/list?ids=${categoryIds}`,
            },
            id,
            dataHandler: {
              type: 'JSFunction',
              value:
                'function(res) { \n  if(res?.code != 1) {\n    return []\n  }\n  let {data = []} = res.data\n  return data\n}',
            },
          },
        ];

        if (categoryIds?.length > 0) {
          (window as any).assignDataSource((oldList: any) => {
            // 删除原来的api
            let list = [...oldList];
            const { categoryIds } = value || {};
            if (categoryIds) {
              list = _.filter(oldList, (o) => {
                const id = `article_list_${categoryIds.join('_')}`;
                return o.id != id;
              });
            }
            return _.unionBy(apiList, list, 'id');
          });
        }
      }
      this.onClose();

      (window as any).AliLowCodeEngine.project.simulatorHost?.rerender();
    };

    this.onOpen = () => {
      const { field = {} } = this.props;
      const { node }: { node: IPublicModelNode } = field;

      const treeData = this.recursionComponents(field.node?.children);

      this.setState({
        open: true,
        treeData,
      });
    };

    this.onClose = () => {
      this.setState({
        scope: '',
        expandedRowKeys: [],
        categoryIds: [],
        open: false,
      });
      // if (this.props.onClose) {
      //   this.props.onClose();
      // }
    };

    this.onRowChange = (selectedRowKeys) => {
      this.setState({
        categoryIds: selectedRowKeys,
      });
    };
  }

  // 递归显示全部子组件
  recursionComponents(children: any) {
    const items: any = [];
    children?.forEach((item: any) => {
      if (item?.isContainer) {
        const data: any = {
          value: item.componentName,
          label: `${this.t(item.title)}(${item.componentName})`,
          children: [],
        };
        if (item?.children) {
          data.children = this.recursionComponents(item?.children);
        } else {
          data.isLeaf = true;
        }
        items.push(data);
      }
    });
    return items;
  }

  // 递归显示分类数据
  recursionCategoryData(children: any) {
    const result: any = [];
    children.forEach((item: any) => {
      if (item.children?.length > 0) {
        result.push(item.id);
        const cResult = this.recursionCategoryData(item.children);
        result.push(...cResult);
      }
    });
    return result;
  }

  // 绑定到对应的子组件loop
  recursionScope(children: any, scope: string, callback: Function) {
    for (let index = 0; index < children?.length; index++) {
      const element: any = children[index];
      if (element.componentName === scope) {
        if (callback) {
          callback(element);
        }
        break;
      }
      if (element?.children?.length > 0) {
        this.recursionScope(element.children, scope, callback);
      }
    }
    return children;
  }

  async componentDidMount() {
    const { field = {}, defaultValue, value } = this.props;
    const { node }: { node: IPublicModelNode } = field;

    const { services: { listCategory } = {} }: { services: any } = window as any;

    const { scope = '', categoryIds = [] } = value || defaultValue || {};

    if (node.isEmptyNode) {
      console.log('isEmptyNode node', node);
    }

    let categoryData = [];
    let expandedRowKeys = [];
    if (listCategory) {
      const res = await listCategory();
      if (res.code !== 1) {
        return;
      }
      categoryData = res.data;
      expandedRowKeys = this.recursionCategoryData(categoryData);
    }

    this.setState({
      scope,
      categoryIds,
      categoryData,
      expandedRowKeys,
    });
  }

  renderChildren() {
    const { field, value: list } = this.props;
    const { node }: { node: IPublicModelNode & { propsData: any } } = field;
    let title = '';
    if (list) {
      title = `${this.t(list.title)}-${list.categoryIds?.join(',')}`;
    }

    if (node.isEmptyNode) {
      return '请先拖拽生成组件模板';
    }

    let render = null;
    if (title) {
      render = (
        <span style={{ cursor: 'pointer' }} onClick={this.onOpen}>
          已绑定{title}
        </span>
      );
    } else {
      render = <Button onClick={this.onOpen}>绑定数据</Button>;
    }

    return render;
  }

  render() {
    return (
      <>
        <Modal
          width={960}
          bodyStyle={{ padding: 0 }}
          title="选择列表"
          open={this.state.open}
          onOk={this.onOk}
          onCancel={this.onClose}
        >
          <div className="datalist-setter-dialog-root">
            <Tabs
              tabPosition="left"
              items={[
                {
                  label: '分类绑定',
                  key: 'category',
                  children: (
                    <div className="datalist-setter-dialog-list-content">
                      <div className="datalist-setter-dialog-list-content-header">
                        <div className="datalist-setter-dialog-list-content-header-icon-wrap">
                          <div className="datalist-setter-dialog-list-content-header-icon">
                            <span style={{ marginLeft: '4px' }}>刷新</span>
                          </div>
                        </div>
                        <div className="datalist-setter-dialog-list-content-header-extra">
                          <Search placeholder="请输入分类名称" />
                        </div>
                      </div>
                      <h5 className="datalist-setter-dialog-list-content-title">基本设置</h5>
                      <div className="datalist-setter-dialog-list-content-configure">
                        <div className="datalist-setter-dialog-list-content-group">
                          {/* <Tooltip v2 trigger={<span>作用域：</span>} align="t">
                  选择数据绑定的元素
                </Tooltip> */}

                          <TreeSelect
                            dropdownMatchSelectWidth={false}
                            value={this.state.scope}
                            treeDefaultExpandAll
                            onChange={this.handleChange}
                            treeData={this.state?.treeData}
                            style={{ marginRight: 8, minWidth: '100px' }}
                          />
                        </div>
                      </div>
                      <div className="datalist-setter-dialog-list-content-table">
                        <Table
                          rowKey="id"
                          expandable={{
                            expandedRowKeys: this.state.expandedRowKeys,
                          }}
                          rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: this.state.categoryIds,
                            onChange: this.onRowChange,
                          }}
                          columns={columns}
                          dataSource={this.state.categoryData}
                          pagination={false}
                          scroll={{
                            y: 278,
                          }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  label: '指定文章',
                  key: 'ids',
                  children: '指定文章',
                },
              ]}
            ></Tabs>
          </div>
        </Modal>
        {this.renderChildren()}
      </>
    );
  }
}
