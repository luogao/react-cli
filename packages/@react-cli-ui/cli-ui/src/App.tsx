import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import ReactNotification from 'react-notifications-component';
import cn from 'classnames';
import { Provider } from 'react-redux';

import i18n from './i18n';
import { Footer, ConnectionStatus, AppLayout } from '@components';
import { useSettings } from '@hooks';
import { SettingsContext } from '@context';
import { renderRoutes } from './router';
import css from '@styles/main.module.less';
import { store } from 'store';

export default function App() {
  const settings = useSettings();
  const styles = cn(css.appContainer, {
    [css.dark]: settings.darkTheme,
  });
  console.log(settings.socketReady);
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <SettingsContext.Provider value={settings}>
          <Router>
            <div className={styles}>
              <ConnectionStatus />
              <AppLayout>{renderRoutes()}</AppLayout>
              <Footer />
              <ReactNotification />
            </div>
          </Router>
        </SettingsContext.Provider>
      </I18nextProvider>
    </Provider>
  );
}
