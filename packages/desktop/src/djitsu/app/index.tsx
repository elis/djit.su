import React from 'react'
import { RecoilRoot } from 'recoil'
import DjitsuRoutes from '../routes'
import DjitsuTheme from '../theme'
import QueryService from '../services/react-query'
import SystemService from '../services/system'

import 'antd/dist/antd.css'

import '../../App.global.less'
import '../../App.global.scss'

export default function App() {
  return (
    <QueryService>
      <RecoilRoot>
        <DjitsuTheme>
          <SystemService />
          <DjitsuRoutes />
        </DjitsuTheme>
      </RecoilRoot>
    </QueryService>
  )
}
