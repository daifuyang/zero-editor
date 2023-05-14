import { IPublicEnumTransformStage, IPublicModelNode } from '@alilc/lowcode-types';
import { Button, ConfigProvider, Modal, Table, message } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import React from 'react';

interface State {
  open: boolean;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
  };
  form: any;
  dataSource: any[];
}

interface FormListSetterProps {
  // 当前值
  value: any;
  // 默认值
  initialValue: any;
  // setter 唯一输出
  onChange: (val: any) => void;
  field: any;
}

export default class FormListSetter extends React.PureComponent<FormListSetterProps> {
  // 声明 Setter 的 title
  static displayName = 'FormListSetter';
  state: State;
  setOpen: (bool: boolean) => void;
  onOk: () => void;
  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      form: [],
      dataSource: [],
    };

    this.setOpen = (bool) => {
      if (bool) {
        this.fetchData();
      }
      this.setState({
        form: bool ? this.props.value : {},
        open: bool,
      });
    };

    this.onOk = () => {
      const { field, onChange } = this.props;
      const { node }: { node: IPublicModelNode & { propsData: any } } = field;

      const { form = {} } = this.state;
      const { id, name } = form;

      if (onChange) {
        onChange({
          id,
          name,
        });
      }

      //   追加表单到
      const formSchema = (window as any).getPageSchema(form);
      const saveSchema: any = node?.exportSchema(IPublicEnumTransformStage.Save);
      if (formSchema.children.length > 0) {
        saveSchema.children = formSchema.children[0]?.children;
        saveSchema.children.forEach((item: any) => {
          item.isLocked = true;
        });
        saveSchema.props.onFinish = {
          type: 'JSExpression',
          value:
            "function() {\n      const self = this;\n      try {\n        return (function onFinish(values) {\n  console.log('onFinish', values);\n}).apply(self, arguments);\n      } catch(e) {\n        logger.warn('call function which parsed by lowcode failed: ', e);\n        return e.message;\n      }\n    }",
        };
        node?.importSchema(saveSchema);
        (window as any).AliLowCodeEngine.project.simulatorHost?.rerender();
        this.setState({
          open: false,
        });
      }
    };
  }

  columns = [
    {
      title: '表单ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '表单名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '表单描述',
      dataIndex: 'description',
      key: '表单描述',
    },
  ];

  async fetchData() {
    const res = await (window as any).services.forms();
    if (res.code != 1) {
      message.error(res.msg);
      return;
    }
    const { current, page_size: pageSize, total } = res;
    this.setState({
      dataSource: res.data.data,
      pagination: {
        current,
        pageSize,
        total,
      },
    });
    return;
  }

  componentDidMount() {
    const { onChange, value, initialValue } = this.props;
    if (value == undefined && initialValue) {
      onChange(initialValue);
    }
  }

  render() {
    const { value } = this.props;
    const { form, dataSource, pagination } = this.state;
    return (
      <ConfigProvider locale={zhCN}>
        <Modal
          destroyOnClose
          width={960}
          title="选择表单"
          centered
          onCancel={() => {
            this.setOpen(false);
          }}
          onOk={this.onOk}
          open={this.state.open}
        >
          <Table
            rowKey={'id'}
            onRow={(form) => ({
              onClick: () => {
                this.setState({
                  form,
                });
              },
            })}
            rowSelection={{
              type: 'radio',
              selectedRowKeys: [form?.id],
              onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
                console.log(selectedRowKeys, selectedRows);
                this.setState({
                  form: selectedRows[0],
                });
              },
            }}
            dataSource={dataSource}
            columns={this.columns}
            pagination={pagination}
          />
        </Modal>
        {value?.id ? (
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              this.setOpen(true);
            }}
          >
            已绑定 - {value?.name}
          </span>
        ) : (
          <Button
            onClick={() => {
              this.setOpen(true);
            }}
          >
            选择表单
          </Button>
        )}
      </ConfigProvider>
    );
  }
}

// const FormListSetter = (props: FormListSetterProps) => {
//   const [open, setOpen] = useState(false);

//   const [pagination, setPagination] = useState({
//     current: 1,
//     total: 0,
//     pageSize: 10,
//   });

//   const [form, setForm] = useState({});

//   const [dataSource, setDataSource] = useState([]);

//   const fetchData = async (params: any = {}) => {
//     const res = await (window as any).services.forms();
//     if (res.code != 1) {
//       message.error(res.msg);
//       return;
//     }
//     const { current, page_size: pageSize, total } = res;
//     setDataSource(res.data.data);
//     setPagination({
//       current,
//       pageSize,
//       total,
//     });
//     return;
//   };

//   //   useEffect(() => {
//   //     fetchData();
//   //   }, []);

//   const columns = [
//     {
//       title: '表单ID',
//       dataIndex: 'id',
//       key: 'id',
//     },
//     {
//       title: '表单名称',
//       dataIndex: 'name',
//       key: 'name',
//     },
//     {
//       title: '表单描述',
//       dataIndex: 'description',
//       key: '表单描述',
//     },
//   ];

//   return (
//     <ConfigProvider locale={zhCN}>
//       <Modal
//         destroyOnClose
//         width={960}
//         title="选择表单"
//         centered
//         onCancel={() => {
//           setOpen(false);
//         }}
//         open={open}
//       >
//         <Table
//           rowSelection={{
//             type: 'radio',
//             onChange(selectedRowKeys, selectedRows, info) {
//               console.log(selectedRowKeys, selectedRows, info);
//             },
//           }}
//           dataSource={dataSource}
//           columns={columns}
//           pagination={pagination}
//         />
//       </Modal>
//       <Button
//         onClick={() => {
//           setOpen(true);
//         }}
//       >
//         选择表单
//       </Button>
//     </ConfigProvider>
//   );
// };
// export default FormListSetter;
