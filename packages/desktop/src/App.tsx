import React from 'react';
import { RecoilRoot } from 'recoil';

import { DjitsuTheme, themes } from './theme'
import { ThemeSwitcherProvider } from './theme/css-theme-switcher';
import SystemService from './services/system';

import DjitsuRoutes from './routes';

import './App.global.less';
import './App.global.scss';

export default function App() {
  const theme = localStorage.getItem('djitsu-theme') || 'djitsu-light-theme'

  return (
    <RecoilRoot>
      <ThemeSwitcherProvider defaultTheme={theme} themeMap={themes}>
        <DjitsuTheme theme={theme}>
          <SystemService />
          <DjitsuRoutes />
        </DjitsuTheme>
      </ThemeSwitcherProvider>
    </RecoilRoot>
  );
}
