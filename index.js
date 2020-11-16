import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';

import App from './src/App';
import { name as appName } from './app.json';
import { store } from './src/redux-store';

const REGISTER_APP = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => REGISTER_APP);
