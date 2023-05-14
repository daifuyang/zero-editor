import React from 'react';
import { Search, Nav, Divider } from '@alifd/next';
import { PluginProps } from '@alilc/lowcode-types';
import cls from 'classnames/bind';
import style from './index.module.scss';
import IconOfPane from './Icon';
import {
  Text,
  StandardComponentMeta,
  SnippetMeta,
  createI18n,
  getTextReader,
} from './utils/transform';

const snippets = [
  {
    group: '页面 & 页头',
    categories: [
      {
        title: '页头',
        key: 'header',
        items: [
          {
            title: '页头',
            screenshot:
              'https://aipage.bce.baidu.com/resources/upload/ace3ca9d57a52d9/1609997517157.png',
            schema: {
              componentName: 'Div',
              props: {},
              children: [],
            },
          },
          {
            title: '页头',
            key: 'header',
            screenshot:
            'https://aipage.bce.baidu.com/resources/upload/ace3ca9d57a52d9/1609997517157.png',
            schema: {
              componentName: 'Div',
              props: {},
              children: [],
            },
          },
        ],
      },
      {
        title: '页尾',
        key: 'footer',
        items: [
          {
            title: '页尾',
            screenshot:
              'https://aipage.bce.baidu.com/resources/upload/ace3ca9d57a52d9/1609997517157.png',
            schema: {
              componentName: 'Div',
              props: {},
              children: [],
            },
          },
        ],
      },
    ],
  },
  {
    group: '页面头图',
    categories: [
      {
        title: '头图',
        key: 'firstPage',
        items: [
          {
            screenshot:
              'https://img.alicdn.com/imgextra/i3/O1CN018CwRJM1ZkIpmeEfRD_!!6000000003232-55-tps-128-128.svg',
            schema: {
              componentName: 'Div',
              props: {},
              children: [],
            },
          },
        ],
      },
    ],
  },
  {
    group: '图文板块',
    categories: [
      {
        title: '左右图文',
        key: 'leftList',
        items: [
          {
            screenshot:
              'https://img.alicdn.com/imgextra/i3/O1CN018CwRJM1ZkIpmeEfRD_!!6000000003232-55-tps-128-128.svg',
            schema: {
              componentName: 'Div',
              props: {},
              children: [],
            },
          },
        ],
      },
      {
        title: '列表图文',
        key: 'list',
        items: [
          {
            screenshot:
              'https://img.alicdn.com/imgextra/i3/O1CN018CwRJM1ZkIpmeEfRD_!!6000000003232-55-tps-128-128.svg',
            schema: {
              componentName: 'Div',
              props: {},
              children: [],
            },
          },
        ],
      },
    ],
  },
  // {
  //   group: '图文板块',
  //   category: [
  //     {
  //       title: '左右图文',
  //       key: 'leftList',
  //     },
  //     {
  //       title: '列表图文',
  //       key: 'list',
  //     },
  //     {
  //       title: '分屏图文',
  //       key: 'middleList',
  //     },
  //     {
  //       title: '简约图文',
  //       key: 'simpleList',
  //     },
  //   ],
  // },
];

const { Item, Group } = Nav;

const { material, common, project } = window.AliLowCodeEngine || {};

const isNewEngineVersion = !!material;

const cx = cls.bind(style);

interface ComponentPaneProps extends PluginProps {
  [key: string]: any;
}

interface ComponentPaneState {
  category: any;
  list: any;
  keyword: string;
}

export default class ComponentPane extends React.Component<ComponentPaneProps, ComponentPaneState> {
  static displayName = 'LowcodeComponentPane';

  state: ComponentPaneState = {
    category: [],
    list: [],
    keyword: '',
  };

  t: (input: Text) => string;

  getStrKeywords: (keywords: Text[]) => string;

  getKeyToSearch(c: StandardComponentMeta | SnippetMeta) {
    const strTitle = this.t(c.title);
    const strComponentName = this.t(c.componentName);
    const strDescription = 'description' in c ? this.t(c.description) : '';
    const strKeywords = 'keywords' in c ? this.getStrKeywords(c.keywords || []) : '';
    return `${strTitle}#${strComponentName}#${strDescription}#${strKeywords}`.toLowerCase();
  }

  constructor(props) {
    super(props);
    this.t = getTextReader(props.lang);
    this.getStrKeywords = (keywords: Text[]): string => {
      if (typeof keywords === 'string') {
        return keywords;
      }
      if (keywords && Array.isArray(keywords) && keywords.length) {
        return keywords.map((keyword) => this.t(keyword)).join('-');
      }
      return '';
    };
  }

  componentDidMount() {
    const list = [];
    snippets.forEach((data: any) => {
      const { categories } = data;
      list.push(...categories);
    });
    this.setState({ category: snippets, list });
  }

  /**
   * 初始化组件列表
   * TODO: 无副作用，可多次执行
   */

  registerAdditive = (shell: HTMLDivElement | null) => {
    if (!shell || shell.dataset.registered) {
      return;
    }

    const { editor } = this.props;
    const designer = !isNewEngineVersion ? editor?.get('designer') : null;
    const _dragon = isNewEngineVersion ? common.designerCabin.dragon : designer?.dragon;
    if (!_dragon || (!isNewEngineVersion && !designer)) {
      return;
    }

    // eslint-disable-next-line
    const click = (e: Event) => {};

    shell.addEventListener('click', click);

    _dragon.from(shell, (e: Event) => {
      const doc = isNewEngineVersion ? project.getCurrentDocument() : designer?.currentDocument;
      if (!doc) {
        return false;
      }

      const dragTarget = {
        type: 'nodedata',
        data: {
          componentName: 'Breadcrumb',
          props: {},
          children: [],
        },
      };

      return dragTarget;
    });

    shell.dataset.registered = 'true';
  };

  handleSearch = (keyword = '') => {
    this.setState({
      keyword: keyword.toLowerCase(),
    });
  };

  renderEmptyContent() {
    return (
      <div className={cx('empty')}>
        <img src="//g.alicdn.com/uxcore/pic/empty.png" />
        <div className={cx('content')}>
          {this.t(createI18n('暂无组件，请在物料站点添加', 'No components, please add materials'))}
        </div>
      </div>
    );
  }

  renderContent() {
    const { list, category, keyword } = this.state;
    const hasContent = true;
    if (!hasContent) {
      return this.renderEmptyContent();
    }

    return (
      <div className={cx('list-body')}>
        <div className={cx('list-sidebar')}>
          <Nav
            style={{ width: '110px' }}
            type="line"
            embeddable={true}
            selectedKeys={['页头']}
            defaultOpenAll
          >
            {category?.map((_data: any) => {
              const { group, categories } = _data;
              return (
                <Group key={group} label={group}>
                  {categories?.map((item) => (
                    <Item key={item.title}>{item.title}</Item>
                  ))}
                </Group>
              );
            })}
            {/* <Group label="页头&页尾">
              <Item>页头</Item>
              <Item>页尾</Item>
            </Group>
            <Group label="页面头图">
              <Item>页面头图</Item>
            </Group>
            <Group label="图文板块">
              <Item>左右图文</Item>
              <Item>图文列表</Item>
              <Item>分屏图文</Item>
              <Item>简约图文</Item>
            </Group>
            <Item>页头&页尾</Item>
            <Item>页面头图</Item>
            <Item>图文板块</Item>
            <Item>轮播&图集</Item> */}
          </Nav>
        </div>
        <div ref={this.registerAdditive} className={cx('list-content')}>
          {list?.map((item) => (
            <React.Fragment key={item?.title}>
              <div className={cx('sub-title')}>{item?.title}</div>
              <Divider />
              <div className={cx('list-wrap')}>
                {item?.items?.map((_item) => {
                  return (
                    <div className={cx('list-item')}>
                      <div className={cx('list-img-wrap')}>
                        {_item?.screenshot && <img src={_item.screenshot} alt={_item?.title} />}
                      </div>
                      {_item?.title && <h5>{_item.title}</h5>}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
          {/*          <div className={cx('sub-title')}>页头</div>
          <Divider />
          <div className={cx('list-wrap')}>
            <div className={cx('list-item')}>
              <div className={cx('list-img-wrap')}>
                <img
                  src="https://aipage.bce.baidu.com/resources/upload/ace3ca9d57a52d9/1609997517157.png"
                  alt=""
                />
              </div>
              <h5>通用导航</h5>
            </div>
            <div className={cx('list-item')}>
              <div className={cx('list-img-wrap')}>
                <img
                  src="https://aipage.bce.baidu.com/resources/upload/ace3ca9d57a52d9/1609997517157.png"
                  alt=""
                />
              </div>
              <h5>通用导航</h5>
            </div>
          </div> */}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className={cx('lowcode-component-panel')}>
        <div className={cx('header')}>
          <Search
            className={cx('search')}
            placeholder="搜索组件"
            shape="simple"
            hasClear
            autoFocus
            onSearch={this.handleSearch}
            onChange={this.handleSearch}
          />
        </div>
        {this.renderContent()}
      </div>
    );
  }
}

export const PaneIcon = IconOfPane;
