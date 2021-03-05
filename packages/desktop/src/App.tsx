import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Button, Divider, Modal, Select } from 'antd';
import { ExampleComponent, MyEditor } from '@djitsu/editor'
import { ipcRenderer } from 'electron'
import { DjitsuTheme, useTheme, themes } from './theme'
import styled from 'styled-components'
import { ThemeSwitcherProvider } from './theme/css-theme-switcher';

import icon from '../assets/icon.svg';


import './App.global.less';
import './App.global.scss';
import DjitsuRoutes from './routes';
import SystemService from './services/system';
import { RecoilRoot } from 'recoil';

const Hello__DEPRECATED = () => {
  const [themeState, themeActions] = useTheme()
  const [theme, setTheme] = useState('light')
  const [output, setOutput] = useState('')
  const [isModalVisible, setModalVisible] = useState(false)
  const loadData = async () => {
    console.log('loading stuff:', './')
    const files = await ipcRenderer.invoke('get-file-selection', 'test', { jest: 'fest' })

    console.log('we got some files:', files)
  }
  const showDevTools = () => {
    ipcRenderer.invoke('open-dev-tools', 'test', { jest: 'fest' })
  }
  const toggleTheme = () => {
    // setTheme(theme === 'dark' ? 'light' : 'dark')
    themeActions.switchTheme()
  }

  useEffect(() => {
    if (themeState.theme.match(/dark/)) {
      ipcRenderer.invoke('dark-mode:set', true)
    } else {
      ipcRenderer.invoke('dark-mode:set', false)
    }
    localStorage.setItem('djitsu-theme', themeState.theme)
    // document.getElementsByTagName('html')[0]
    //   .setAttribute('data-theme', theme)
  }, [themeState.theme])


  useEffect(() => {
    (async () => {
      // const themes = await themeActions.getThemes()
      // const darks = await themeActions.getThemes('dark')
      // const lights = await themeActions.getThemes('light')
      console.log('Process.env:', process.env)
      // console.log('darks:', darks)
      // console.log('lights:', lights)

    })()
  }, [])

  const selectTheme = (theme: string) => {
    themeActions.setTheme(theme)
  }
  return (
    <div>
      <SystemService />
      <StyleLauncher>

        <span>Welcome to</span>
        <h1>Djitsu</h1>
      </StyleLauncher>
      <StyleLauncher>
        <Button type='primary' onClick={loadData} size='large' icon={<i className='ri-admin-line' />}>Select File or Directory</Button>
        <Button onClick={showDevTools}>Show Dev Tools</Button>
        <Divider />
        <Select style={{width: 240}} onChange={selectTheme} value={themeState.theme}>
          <Select.OptGroup label='Light Themes'>
            {themeState.availableThemes?.filter(({dark}) => !dark).map(({name}) => (
              <Select.Option value={name}>{name}</Select.Option>
            ))}
          </Select.OptGroup>
          <Select.OptGroup label='Dark Themes'>
            {themeState.availableThemes?.filter(({dark}) => dark).map(({name}) => (
              <Select.Option value={name}>{name}</Select.Option>
            ))}
          </Select.OptGroup>
        </Select>
        <Divider />
        <Button onClick={toggleTheme} icon={<i className='ri-admin-line' />} size='small'>Toggle Theme</Button>
        <Button onClick={() => setModalVisible(!isModalVisible)} size='small'>Show Modal</Button>
        <Modal title="Basic Modal" visible={isModalVisible} onOk={() => setModalVisible(false)} onCancel={() => setModalVisible(false)}>
          <span>Yo</span>
        </Modal>
      </StyleLauncher>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <Button onClick={loadData}>Hello Antd!</Button>
      <ExampleComponent text='abc DDD' />
      <div className='output'>
        {output}
      </div>
      <MyEditor />
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
};

const StyleLauncher = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`


export default function App() {
  const theme = localStorage.getItem('djitsu-theme') || 'djitsu-light-theme'

  return (
    <RecoilRoot>
      <ThemeSwitcherProvider defaultTheme={theme} themeMap={themes}>
        <DjitsuTheme theme={theme}>
          <SystemService />
          <DjitsuRoutes />
          {/* <Router>
            <Switch>
              <Route path="/" component={Hello} />
            </Switch>
          </Router> */}
        </DjitsuTheme>
      </ThemeSwitcherProvider>
    </RecoilRoot>
  );
}
