import React, { Component } from 'react';
import { Select, Form, InputNumber } from 'antd';
// import classNames from 'classnames';

class AosSetter extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      directionOptions: [
        {
          label: '默认',
          value: '',
        },
      ],
    };
  }

  componentDidMount() {
    const { value, defaultValue } = this.props;
    if (value == undefined && defaultValue) {
      this.onChange(defaultValue);
    }
  }

  onChange(value: any) {
    const { onChange } = this.props;
    onChange(value);
  }

  render() {
    const { value = {
      animation:"",
      direction:"",
      easing:""
    }, placeholder } = this.props;

    return (
      <Form
        initialValues={value}
        colon={false}
        labelAlign="left"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onValuesChange={(val) => {
          let newValue = { ...value, ...val };
          this.onChange(newValue);
        }}
        autoComplete="off"
      >
        <Form.Item label="动画类型" name="animation">
          <Select
            onChange={(value) => {
              let directionOptions: any = [
                {
                  label: '默认',
                  value: '',
                },
              ];
              switch (value) {
                case 'fade':
                  directionOptions = [
                    ...directionOptions,
                    {
                      label: '向上出现',
                      value: 'up',
                    },
                    {
                      label: '向下出现',
                      value: 'down',
                    },
                    {
                      label: '向左出现',
                      value: 'left',
                    },
                    {
                      label: '向右出现',
                      value: 'right',
                    },
                  ];
                  break;
                case 'flip':
                  directionOptions = [
                    ...directionOptions,
                    {
                      label: '向上翻转',
                      value: 'up',
                    },
                    {
                      label: '向下翻转',
                      value: 'down',
                    },
                    {
                      label: '向左翻转',
                      value: 'left',
                    },
                    {
                      label: '向右翻转',
                      value: 'right',
                    },
                  ];
                  break;
                case 'slide':
                  directionOptions = [
                    ...directionOptions,
                    {
                      label: '下方滑入',
                      value: 'up',
                    },
                    {
                      label: '上方滑入',
                      value: 'down',
                    },
                    {
                      label: '右侧滑入',
                      value: 'left',
                    },
                    {
                      label: '左侧滑入',
                      value: 'right',
                    },
                  ];
                  break;
                case 'zoom-in':
                  directionOptions = [
                    ...directionOptions,
                    {
                      label: '向上渐变放大',
                      value: 'up',
                    },
                    {
                      label: '向下渐变放大',
                      value: 'down',
                    },
                    {
                      label: '向左渐变放大',
                      value: 'left',
                    },
                    {
                      label: '向右渐变放大',
                      value: 'right',
                    },
                  ];
                  break;
                case 'zoom-out':
                  directionOptions = [
                    ...directionOptions,
                    {
                      label: '向上渐变缩小',
                      value: 'up',
                    },
                    {
                      label: '向下渐变缩小',
                      value: 'down',
                    },
                    {
                      label: '向左渐变缩小',
                      value: 'left',
                    },
                    {
                      label: '向右渐变缩小',
                      value: 'right',
                    },
                  ];
                  break;
              }
              this.setState({
                directionOptions,
              });
            }}
            options={[
              {
                label: '默认',
                value: '',
              },
              {
                label: '淡入淡出',
                value: 'fade',
              },
              {
                label: '翻转',
                value: 'flip',
              },
              {
                label: '滑动',
                value: 'slide',
              },
              {
                label: '放大',
                value: 'zoom-in',
              },
              {
                label: '缩小',
                value: 'zoom-out',
              },
            ]}
          />
        </Form.Item>

        <Form.Item label="动画方向" name="direction">
          <Select options={this.state.directionOptions} />
        </Form.Item>

        <Form.Item label="延迟时间" help="动画延迟时间，单位毫秒" name="delay">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="动画方式" name="easing">
          <Select
            options={[
              {
                label: '默认',
                value: '',
              },
            ]}
          />
        </Form.Item>
      </Form>
    );
  }
}

export default AosSetter;
