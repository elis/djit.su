import React from 'react';
import { RecoilRoot } from 'recoil';
import DjitsuRoutes from '../routes';
import DjitsuTheme from '../theme'
import SystemService from '../services/system';

import '../../App.global.less';
import '../../App.global.scss';

export default function App() {
  return (
    <RecoilRoot>
      <DjitsuTheme>
        <SystemService />
        <DjitsuRoutes />
      </DjitsuTheme>
    </RecoilRoot>
  );
}
