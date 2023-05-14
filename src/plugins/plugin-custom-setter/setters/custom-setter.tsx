import React, { Component } from 'react';
import { Switch } from '@alifd/next';
// import classNames from 'classnames';

class CustomSetter extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      maxWidth: 0,
      mxHeight: 0,
      init: true,
    };
  }

  componentDidMount() {
    const { value, defaultValue = true } = this.props;
    if (value == undefined && defaultValue) {
      this.onChange(defaultValue);
    }

    const { field, selected } = this.props;
  }

  onChange(value: any) {
    const { onChange, selected } = this.props;
    if (selected?.parent) {
      selected.parent.isRGLContainerNode = value;
    }
    onChange(value);
  }

  render() {
    const { value, placeholder } = this.props;
    return (
      <Switch
        checked={value}
        placeholder={placeholder || ''}
        onChange={(val: any) => this.onChange(val)}
      />
    );
  }
}

export default CustomSetter;
