import * as React from 'react';
import { TreeSelect } from 'antd';
import './style.less';
import { getForms } from 'src/services/console/api/form';

interface State {
  treeData: [];
}

interface pageSetterProps {
  // 当前值
  value: string;
  // 默认值
  defaultValue: string;
  // setter 唯一输出
  onChange: (val: string) => void;
  // AltStringSetter 特殊配置
  placeholder: string;
}

export default class PageSetter extends React.PureComponent<pageSetterProps> {
  // 声明 Setter 的 title
  static displayName = 'PageSetter';
  state: State;
  constructor(props: any) {
    super(props);
    this.state = {
      treeData: [],
    };
  }

  componentDidMount() {
    const { onChange, value, defaultValue } = this.props;
    if (value === undefined && defaultValue) {
      onChange(defaultValue);
    }
    this.fetchData();
  }

  recursion(arr: []) {
    arr.forEach((item: any) => {
      item.id = `/${(window as any).state.siteId}/admin/form/${item.id}`;
      if (item.routes) {
        this.recursion(item.routes);
      }
    });
    return arr;
  }

  async fetchData() {
    const res: any = await getForms();
    if (res.code === 1) {
      this.setState({
        treeData: this.recursion(res.data),
      });
    }
  }

  render() {
    const { onChange, value, placeholder } = this.props;
    return (
      <TreeSelect
        style={{ width: '100%' }}
        treeData={this.state.treeData}
        fieldNames={{ label: 'name', value: 'id', children: 'routes' }}
        value={value}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        allowClear
        treeDefaultExpandAll
        placeholder={placeholder || ''}
        onChange={(val: any) => onChange(val)}
      />
    );
  }
}
