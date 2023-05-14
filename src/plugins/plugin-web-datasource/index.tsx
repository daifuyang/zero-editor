import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { IPublicModelPluginContext, IPublicEnumTransformStage } from '@alilc/lowcode-types';
import { Message, Dialog, Button, TreeSelect } from '@alifd/next';
import _ from 'lodash';
import _set from 'lodash/set';
import _isEmpty from 'lodash/isEmpty';
import { listCategory, postList } from 'src/services/website/api/category';

// 选择分类弹窗
const Modal = (props: any) => {
  const { visible, onClose, onFinished } = props;
  const [treeData, setTreeData] = useState([]);
  const [cid, setCid] = useState<any>();

  const recursionData = (data: any) => {
    let newData: any = [];
    data.forEach((item: any) => {
      const newItem: any = {
        label: item.name,
        value: item.id,
        children: [],
      };
      if (item.children?.length > 0) {
        const children = recursionData(item.children);
        newItem.children = children;
      }
      newData.push(newItem);
    });
    return newData;
  };

  const fetchData = async () => {
    const res: any = await listCategory();
    if (res.code != 1) {
      Message.error(res.msg);
      return;
    }
    const data = res.data;
    const newData = recursionData(data);
    setTreeData(newData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Dialog
      v2
      title="请选择演示数据分类"
      centered
      visible={visible}
      footer={[
        <Button
          onClick={() => {
            onFinished(cid);
          }}
          type="primary"
        >
          确定
        </Button>,
      ]}
      onClose={(e) => {
        if (onClose) {
          onClose();
        }
      }}
    >
      <p>将随机选择该分类下的一篇文章作为演示数据</p>
      <TreeSelect
        onChange={(value) => {
          setCid(value);
        }}
        value={cid}
        showSearch
        treeDefaultExpandAll
        dataSource={treeData}
        style={{ width: '100%' }}
      />
    </Dialog>
  );
};

const WebDataSourcePlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton, project, config } = ctx;
      // 页面类型，对应默认的初始化接口
      // type = page
      // type = article
      // type = list
      const pageData = config.get('pageData');
      const { type, isHome, isPublic } = pageData;

      const div = document.createElement('div');

      const App = (props: any) => {
        const [visible, setVisible] = useState(true);

        // const assignDataSource = (list:any = []) => {
        //   const docSchema: any = project.exportSchema(IPublicEnumTransformStage.Save);
        //   if (!_isEmpty(docSchema)) {
        //     const oldList = docSchema?.componentsTree?.[0]?.dataSource?.list || [];
        //     const newList = _.unionBy(list, oldList, 'id');
        //     _set(docSchema, 'componentsTree[0].dataSource.list', newList);
        //     project.importSchema(docSchema);
        //   }
        // }

        const assignDataSource = (callBack: Function) => {
          const docSchema: any = project.exportSchema(IPublicEnumTransformStage.Save);
          if (!_isEmpty(docSchema)) {
            const oldList = docSchema?.componentsTree?.[0]?.dataSource?.list || [];
            const newList = callBack(oldList);
            _set(docSchema, 'componentsTree[0].dataSource.list', newList);
            project.importSchema(docSchema);
          }
        };

        (window as any).assignDataSource = assignDataSource;

        const onOpen = () => {
          setVisible(true);
        };

        const onClose = () => {
          setVisible(false);
        };

        const onFinished = async (cid: any) => {
          if (!cid) {
            Message.error('请先选择一个演示分类！');
            return;
          }

          let list: any = [];
          let id = 1
          if (!isHome) {
            switch (type) {
              case 'list':
                list = [
                  {
                    type: 'fetch',
                    isInit: true,
                    options: {
                      params: {
                        pageSize: 10,
                        ids: {
                          type: 'JSExpression',
                          value: 'this.state?.cid',
                        },
                      },
                      method: 'GET',
                      isCors: true,
                      timeout: 5000,
                      headers: {},
                      uri: '/api/v1/portal/app/list',
                    },
                    id: 'data',
                    dataHandler: {
                      type: 'JSFunction',
                      value:
                        'function(res) {\n  const { data, code } = res\n  if (code != 1) {\n    return []\n  }\n  return data\n}',
                    },
                  },
                  {
                    type: 'fetch',
                    isInit: {
                      type: 'JSExpression',
                      value: 'this.state?.cid',
                    },
                    options: {
                      params: {},
                      method: 'GET',
                      isCors: true,
                      timeout: 5000,
                      headers: {},
                      uri: {
                        type: 'JSExpression',
                        value: '"/api/v1/portal/app/breadcrumb/" + this.state?.cid',
                      },
                    },
                    id: 'breadcrumb',
                    dataHandler: {
                      type: 'JSFunction',
                      value:
                        'function(res) {\n\n  if (res?.code != 1) {\n    return []\n  }\n\n  const result = [{\n    key:"index",\n    title: "首页"\n  }]\n\n  const { data = [] } = res\n  data.forEach((item) => {\n    result.push({\n      key: item.id,\n      title: item.name\n    })\n  })\n\n\n  return result\n}',
                    },
                  },
                ];
                break;
              case 'article':
                const res:any = await postList({
                  pageSize: 1,
                  ids: cid,
                });

                if(res.code == 1) {
                  id = res.data?.data?.[0]?.id
                }

                list = [
                  {
                    type: 'fetch',
                    isInit: {
                      type: 'JSExpression',
                      value: 'this.state?.id',
                    },
                    options: {
                      method: 'GET',
                      isCors: true,
                      timeout: 5000,
                      headers: {},
                      uri: {
                        type: 'JSExpression',
                        value: '"/api/v1/portal/app/post/" + this.state?.id',
                      },
                    },
                    id: 'data',
                  },
                  {
                    type: 'fetch',
                    isInit: {
                      type: 'JSExpression',
                      value: 'this.state?.cid',
                    },
                    options: {
                      params: {},
                      method: 'GET',
                      isCors: true,
                      timeout: 5000,
                      headers: {},
                      uri: {
                        type: 'JSExpression',
                        value: '"/api/v1/portal/app/breadcrumb/" + this.state?.cid',
                      },
                    },
                    id: 'breadcrumb',
                    dataHandler: {
                      type: 'JSFunction',
                      value:
                        'function(res) {\n\n  if (res?.code != 1) {\n    return []\n  }\n\n  const result = [{\n    key:"index",\n    title: "首页"\n  }]\n\n  const { data = [] } = res\n  data.forEach((item) => {\n    result.push({\n      key: item.id,\n      title: item.name\n    })\n  })\n\n\n  return result\n}',
                    },
                  },
                ];
                break;
            }
          }

          assignDataSource((oldList: any) => {
            return _.unionBy(list, oldList, 'id');
          });

          const docSchema: any = project.exportSchema(IPublicEnumTransformStage.Save);
          if (!_isEmpty(docSchema)) {
            _set(docSchema, 'componentsTree[0].state', {
              cid,
              id
            });
            project.importSchema(docSchema);
          }

          //  需要进行

          onClose();
        };

        const registerInit = () => {
          // 注册组件面板
          const componentsPane = skeleton.add({
            area: 'leftArea',
            type: 'Dock',
            name: 'WebDataSource',
            contentProps: {},
            props: {
              align: 'top',
              icon: 'shuju',
              description: '演示数据',
              onClick: function () {
                onOpen();
              },
            },
          });

          componentsPane?.disable?.();
          project.onSimulatorRendererReady(() => {
            componentsPane?.enable?.();
          });
        };

        let element = null;
        if (!isHome) {
          switch (type) {
            case 'list':
            case 'article':
              registerInit();
              element = <Modal visible={visible} onClose={onClose} onFinished={onFinished} />;
              break;
          }
        }
        return element;
      };

      if (!isHome || isPublic) {
        ReactDOM.render(<App />, div);
      }
    },
  };
};
WebDataSourcePlugin.pluginName = 'WebDataSourcePlugin';
WebDataSourcePlugin.meta = {
  dependencies: ['WebInitPlugin'],
};
export default WebDataSourcePlugin;
