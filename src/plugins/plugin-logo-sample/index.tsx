import React from 'react';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Dropdown, Menu } from '@alifd/next';
import './index.scss';
export interface IProps {
  logo?: string;
  href?: string;
  scenarioInfo?: any;
  scenarioDisplayName?: string;
}

const Logo: React.FC<IProps> = (props): React.ReactElement => {
  const { scenarioDisplayName } = props;
  return (
    <div className="lowcode-plugin-logo">
      <a className="logo" target="blank" href={props.href || 'https://www.zerocmf.com'} >
        {scenarioDisplayName}
      </a>
    </div>
  );
};
// 示例 Logo widget
const LogoPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton, config } = ctx;
      const scenarioDisplayName = 'zerocmf';
      config.set('scenarioDisplayName',scenarioDisplayName);
      // 注册 logo widget
      skeleton.add({
        area: 'topArea',
        type: 'Widget',
        name: 'logo',
        content: <Logo scenarioDisplayName={scenarioDisplayName} scenarioInfo={{}}  />,
        contentProps: {
          logo: 'https://img.alicdn.com/imgextra/i4/O1CN013w2bmQ25WAIha4Hx9_!!6000000007533-55-tps-137-26.svg',
          href: 'http://lowcode.zerocmf.com',
        },
        props: {
          align: 'left',
        },
      });
    },
  };
}
LogoPlugin.pluginName = 'LogoPlugin';
LogoPlugin.meta = {
  dependencies: [],
};
export default LogoPlugin;