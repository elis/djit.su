import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown, Layout, Menu, Progress } from 'antd'
import styled from 'styled-components'
import { FundTwoTone, PictureTwoTone } from '@ant-design/icons'
import DjitsuSymbol from '../components/djitsu-symbol'
import { useTheme } from '../theme'

export const Header = () => {
  const [theme] = useTheme()

  return (
    <StyledHeader theme={theme.isDark ? 'dark' : 'light'}>
      <div className="logo">
        <Link to="/">
          <DjitsuSymbol size={16} />
        </Link>
      </div>
      <Menu
        className="main-menu"
        theme={theme.isDark ? 'dark' : 'light'}
        mode="horizontal"
        defaultSelectedKeys={['2']}
      />
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
    z-index: 50;
    position: sticky;
    top: var(--titlebar-height);
    -webkit-app-region: drag;
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

const DEFAULT_PREVIEW_THEME = {
  previewing: false,
  isPreview: false,
  set: false,
  theme: '',
  base: '',
  start: 0,
  progress: 0
}
const SET_AFTER = 800
const UPDATE_INTERVAL = 30

export const ThemeDropdown = ({ children }) => {
  const [themeState, themeActions] = useTheme()

  const [previewTheme, setPreviewTheme] = useState(DEFAULT_PREVIEW_THEME)

  const darkThemes = useMemo(
    () => themeState.availableThemes?.filter(({ isDark }) => isDark),
    [themeState.availableThemes]
  )
  const lightThemes = useMemo(
    () => themeState.availableThemes?.filter(({ isDark }) => !isDark),
    [themeState.availableThemes]
  )

  const enterTheme = useCallback(
    (event, theme) => {
      if (theme !== previewTheme.base && theme !== themeState.theme)
        setPreviewTheme({
          theme,
          start: Date.now(),
          isPreview: false,
          previewing: true,
          set: false,
          progress: 0,
          base: previewTheme.base || themeState.theme || ''
        })
    },
    [themeState.theme, previewTheme.base]
  )

  const leaveTheme = useCallback(() => {
    if (previewTheme.base) themeActions.setTheme(previewTheme.base)
    setPreviewTheme(DEFAULT_PREVIEW_THEME)
  }, [previewTheme, themeActions])

  const selectTheme = useCallback(
    async (event, theme) => {
      themeActions.setTheme(theme)
      await themeActions.saveTheme(theme, false)
      setPreviewTheme(v => ({ ...v, base: '' }))
    },
    [themeActions]
  )

  const getThemeIcon = useCallback(themeName => {
    if (themeName === 'djitsu-dark-theme')
      return <PictureTwoTone twoToneColor="#ECA" />
    if (themeName === 'djitsu-light-theme')
      return <PictureTwoTone twoToneColor="#ACE" />

    return <FundTwoTone />
  }, [])

  useEffect(() => {
    if (previewTheme.set && !previewTheme.isPreview) {
      setPreviewTheme(v => ({ ...v, isPreview: true }))
      themeActions.setTheme(previewTheme.theme)
    }
  }, [previewTheme, themeActions])

  useEffect(() => {
    if (previewTheme.start && previewTheme.previewing && !previewTheme.set) {
      const tid = setTimeout(() => {
        setPreviewTheme(v => {
          const nextProgress = +v.progress + UPDATE_INTERVAL / SET_AFTER
          // console.log('⏰䷢', 'next progress is:', nextProgress)
          if (nextProgress >= 1) return { ...v, progress: 1, set: true }
          return { ...v, progress: nextProgress }
        })
      }, UPDATE_INTERVAL)

      return () => clearTimeout(tid)
    }
    return () => {}
  }, [previewTheme])

  const onMouseEnterItem = useCallback(
    name => event => enterTheme(event, name),
    [enterTheme]
  )

  const menu = (
    <Menu>
      {lightThemes.length > 0 && (
        <Menu.ItemGroup title={`Light Themes — ${lightThemes.length}`}>
          {lightThemes.map(({ name, title }) => (
            <ThemeMenuItem
              key={`theme-${name}`}
              onClick={event => selectTheme(event, name)}
              onMouseEnter={onMouseEnterItem(name)}
              onMouseLeave={() => leaveTheme()}
              icon={getThemeIcon(name)}
            >
              {(
                previewTheme.base
                  ? name === previewTheme.base
                  : name === themeState.theme
              ) ? (
                <strong>{title || name}</strong>
              ) : (
                <span>{title || name}</span>
              )}

              {name === previewTheme.theme &&
                previewTheme.previewing &&
                !previewTheme.set && (
                  <ProgressTheme
                    type="line"
                    size="small"
                    showInfo={false}
                    percent={previewTheme.progress * 100}
                    strokeLinecap="square"
                    // steps={20}
                    strokeColor="#52c41a"
                  />
                )}
            </ThemeMenuItem>
          ))}
        </Menu.ItemGroup>
      )}
      {darkThemes.length > 0 && (
        <Menu.ItemGroup title={`Dark Themes — ${darkThemes.length}`}>
          {darkThemes.map(({ name, title }) => (
            <ThemeMenuItem
              key={`theme-${name}`}
              onClick={event => selectTheme(event, name)}
              onMouseEnter={event => enterTheme(event, name)}
              onMouseLeave={() => leaveTheme()}
              icon={getThemeIcon(name)}
            >
              {(
                previewTheme.base
                  ? name === previewTheme.base
                  : name === themeState.theme
              ) ? (
                <strong>{title || name}</strong>
              ) : (
                <span>{title || name}</span>
              )}
              {name === previewTheme.theme &&
                previewTheme.previewing &&
                !previewTheme.set && (
                  <ProgressTheme
                    type="line"
                    size="small"
                    showInfo={false}
                    percent={previewTheme.progress * 100}
                    strokeLinecap="square"
                    // steps={30}
                    strokeColor="#52c41a"
                  />
                )}
            </ThemeMenuItem>
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

const ThemeMenuItem = styled(Menu.Item)`
  position: relative;
  > span > .ant-progress {
    position: absolute;
    z-index: 29;
    line-height: 1px;
    > .ant-progress-outer {
      height: 6px;
    }
  }
  > span > :not(.ant-progress) {
    z-index: 30;
    position: relative;
  }
`

const ProgressTheme = styled(Progress)`
  bottom: 0;
  left: 0;
  right: 0;
  /* top: 0; */
  /* & > .ant-progress-inner {
    width: 12px !important;
    height: 12px !important;
  } */
`

export default Header
