import React, { useCallback, useMemo, useState } from 'react'
import { Button, Dropdown, Layout, Menu, Tooltip } from 'antd'

import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { CodeOutlined } from '@ant-design/icons'
import DjitsuSymbol from '../components/djitsu-symbol'
import { useTheme } from '../theme'
import useIPCRenderer from '../services/ipc/renderer'

export const Header: React.FC = props => {
  const ipc = useIPCRenderer()
  const showDevTools = () => {
    ipc.invoke('open-dev-tools', 'test', { jest: 'fest' })
  }
  return (
    <StyledHeader theme="light">
      <div className="logo">
        <Link to="/">
          <DjitsuSymbol size={16} />
        </Link>
      </div>
      <Menu
        className="main-menu"
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
      >
        {/* <Menu.Item key="1">nav 1</Menu.Item>
        <Menu.Item key="2">nav 2</Menu.Item>
        <Menu.Item key="3">nav 3</Menu.Item> */}
      </Menu>
      <span />
    </StyledHeader>
  )
}
const StyledHeader = styled(Layout.Header)`
  &.ant-layout-header {
    display: flex;
    padding-left: 0;
    height: 48px;
    line-height: 48px;
    position: relative;
    z-index: 50;
    span:empty {
      flex: 1 1 auto;
    }
    > * * {
      -webkit-app-region: no-drag;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    > .main-menu {
      flex: 1 1 auto;
    }
    .logo {
      display: flex;
      flex-direction: column;
      justify-content: center;
      a {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        min-height: 48px;
        min-width: 48px;
        > svg {
          transition: all 120ms ease-in-out;
          transform: scale(1);
        }
        &:hover {
          > svg {
            transform: scale(1.4);
            color: #fff;
          }
        }
      }
    }
    > .ant-menu {
      > .ant-menu-item {
        height: 48px;
      }
    }
  }
`

export const ThemeDropdown: React.FC = ({ children }) => {
  const [themeState, themeActions] = useTheme()
  const [baseTheme, setBaseTheme] = useState(themeState.theme)

  // <Select.OptGroup label='Light Themes'>
  //   {themeState.availableThemes?.filter(({dark}) => !dark).map(({name}) => (
  //     <Select.Option value={name}>{name}</Select.Option>
  //   ))}
  // </Select.OptGroup>
  // <Select.OptGroup label='Dark Themes'>
  //   {themeState.availableThemes?.filter(({dark}) => dark).map(({name}) => (
  //     <Select.Option value={name}>{name}</Select.Option>
  //   ))}
  // </Select.OptGroup>

  const darkThemes = useMemo(
    () => themeState.availableThemes?.filter(({ dark }) => dark),
    [themeState.availableThemes]
  )
  const lightThemes = useMemo(
    () => themeState.availableThemes?.filter(({ dark }) => !dark),
    [themeState.availableThemes]
  )

  const enterTheme = useCallback((event, theme) => {
    themeActions.setTheme(theme)
  }, [])

  const leaveTheme = useCallback(
    (event, theme) => {
      themeActions.setTheme(baseTheme)
    },
    [baseTheme]
  )

  const selectTheme = useCallback((event, theme) => {
    themeActions.setTheme(theme)
    setBaseTheme(theme)
  }, [])

  const menu = (
    <Menu>
      {lightThemes.length > 0 && (
        <Menu.ItemGroup title={`Light Themes — ${lightThemes.length}`}>
          {lightThemes.map(({ name }) => (
            <Menu.Item
              isSelected={name === themeState.theme}
              onClick={event => selectTheme(event, name)}
              onMouseEnter={event => enterTheme(event, name)}
              onMouseLeave={event => leaveTheme(event, name)}
            >
              {name}
            </Menu.Item>
          ))}
        </Menu.ItemGroup>
      )}
      {darkThemes.length > 0 && (
        <Menu.ItemGroup title={`Dark Themes — ${darkThemes.length}`}>
          {darkThemes.map(({ name }) => (
            <Menu.Item
              isSelected={name === themeState.theme}
              onClick={event => selectTheme(event, name)}
              onMouseEnter={event => enterTheme(event, name)}
              onMouseLeave={event => leaveTheme(event, name)}
            >
              {name}
            </Menu.Item>
          ))}
        </Menu.ItemGroup>
      )}
    </Menu>
  )
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      {children}
    </Dropdown>
  )
}

export default Header
