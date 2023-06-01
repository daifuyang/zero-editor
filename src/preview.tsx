import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import { Loading } from '@alifd/next';
import { buildComponents, assetBundle, AssetLevel, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import {
  getProjectSchemaFromLocalStorage,
  getPackagesFromLocalStorage,
} from './services/website/mockService';

import { RuntimeOptionsConfig } from '@alilc/lowcode-datasource-types';

import axios from 'axios';
import { RequestOptions, AsObject } from 'universal-request/lib/types';
import { getArticleLink, getListLink, getSiteId, navigatorTo,tips } from './utils/utils';
import moment from 'moment';
import { message } from 'antd';

export function createFetchHandler(config?: Record<string, unknown>) {
  return async function (options: RuntimeOptionsConfig) {
    const siteId = getSiteId();
    const requestConfig: RequestOptions = {
      ...options,
      url: options.uri,
      method: options.method as RequestOptions['method'],
      data: options.params as AsObject,
      headers: options.headers as AsObject,
      ...config,
    };

    if (!requestConfig?.headers?.Authorization) {
      const token = localStorage.getItem('token');
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    const _config: any = JSON.parse(JSON.stringify(requestConfig));
    _config.params.siteId = siteId;

    const response = await axios(_config);

    if (response.data.code != 1) {
      message.error(response.data.msg);
    }

    return response.data;
  };
}

const getScenarioName = function () {
  if (location.search) {
    return new URLSearchParams(location.search.slice(1)).get('scenarioName') || 'index';
  }
  return 'index';
};

const getSiteId = function () {
  if (location.search) {
    return new URLSearchParams(location.search.slice(1)).get('siteId');
  }
  return '';
};

const SamplePreview = () => {
  const [data, setData] = useState({});

  async function init() {
    const scenarioName = getScenarioName();
    const packages = getPackagesFromLocalStorage(scenarioName);
    const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);
    const { componentsMap: componentsMapArray, componentsTree } = projectSchema;
    const componentsMap: any = {};
    componentsMapArray.forEach((component: any) => {
      componentsMap[component.componentName] = component;
    });
    const schema = componentsTree[0];

    const libraryMap = {};
    const libraryAsset = [];

    packages.forEach(({ package: _package, library, urls, renderUrls }) => {
      libraryMap[_package] = library;
      if (renderUrls) {
        libraryAsset.push(renderUrls);
      } else if (urls) {
        libraryAsset.push(urls);
      }
    });

    const vendors = [assetBundle(libraryAsset, AssetLevel.Library)];

    // TODO asset may cause pollution
    const assetLoader = new AssetLoader();
    await assetLoader.load(libraryAsset);
    const components = await injectComponents(buildComponents(libraryMap, componentsMap));

    setData({
      schema,
      components,
    });
  }

  const siteId = getSiteId()

  const { schema, components } = data;

  if (!schema || !components) {
    init();
    return <Loading fullScreen />;
  }

  return (
    <div className="lowcode-plugin-sample-preview">
      <ReactRenderer
        className="lowcode-plugin-sample-preview-content"
        schema={schema}
        components={components}
        appHelper={{
          utils: {
            getListLink,
            getArticleLink,
            navigatorTo,
            history: {
              push:   tips
            },
            moment,
          },
          constants: {
            siteId
          },
          requestHandlersMap: {
            fetch: createFetchHandler(),
          },
        }}
      />
    </div>
  );
};

ReactDOM.render(<SamplePreview />, document.getElementById('ice-container'));
