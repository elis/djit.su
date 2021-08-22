import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Menu, Switch, Dropdown, Divider, Button, Tooltip } from 'antd'
import styled from 'styled-components'
import { useUser } from 'djitsu/providers/user'
import Avatar from 'antd/lib/avatar/avatar'
import AntIcon, {
  CaretDownOutlined,
  UserOutlined,
  LogoutOutlined,
  FormatPainterOutlined,
  LoadingOutlined,
  CaretUpOutlined
} from '@ant-design/icons'
import { useTheme } from 'djitsu/theme'
// import { ssr } from 'djitsu/utils/ssr'
import { useSelector } from 'djitsu/store'
import { mdiMoonWaningCrescent, mdiCogs } from '@mdi/js'
import Icon from '@mdi/react'

export const UserMenu = () => {
  const history = useHistory()
  const [userState] = useUser()
  const [themeState, themeActions] = useTheme()
  // const [ssrReady, setSsrReady] = useState()
  const authInitialized = useSelector(
    ({ auth: { initialized } }) => initialized
  )
  const [activationChanging, setActivationChanging] = useState()

  const toggleTheme = () => themeActions.switchTheme()
  const showThemeSettings = () => {
    console.log('show theme settings')
  }
  const toggleActivation = async () => {
    setActivationChanging(true)
    await themeActions.setActivation(!themeState.activation)
    setActivationChanging(false)
  }

  const [visible, _setVisible] = useState()
  const setVisible = (newVisible) => {
    console.log('SETTING VISIBLE:', newVisible)
    _setVisible(newVisible)
  }
  const goto = (path) => history.push(path)

  const TESTING = false

  return !authInitialized || !userState.initialized ? (
    <>
      <span>&nbsp;</span>
    </>
  ) : !userState?.currentUsername ? (
    <>
      <Divider type='vertical' />
      <Tooltip title='Dark mode'>
        <Switch
          size='small'
          checked={themeState.theme === 'dark'}
          onChange={() => themeActions.switchTheme()}
        />
      </Tooltip>

      <Divider type='vertical' />
      <Button type='link' onClick={() => goto('/login')}>
        Login
      </Button>
      <Divider type='vertical' />
      <Button type='primary' onClick={() => goto('/signup')}>
        Sign Up
      </Button>
    </>
  ) : (
    <>
      <Divider type='vertical' />
      <StyledPopover
        // getPopupContainer={() =>
        //   document.querySelector('.djitter-app .djs-theme')
        // }
        overlay={
          TESTING ? (
            <>
              <Menu style={{width: 180}}>
                <Menu.ItemGroup
                  title={
                    <>
                      Signed in as <strong>{userState.currentUsername}</strong>
                    </>
                  }
                />
                <Menu.ItemGroup title={<>Color Theme</>}>
                  <Menu.Item>
                    <Button onClick={() => alert('clicked')}>Sup</Button>

                  </Menu.Item>
                </Menu.ItemGroup>
              </Menu>
            </>
          ) : (
            <StyledSmallMenu style={{ width: 180 }}>
              <Menu.ItemGroup
                title={
                  <>
                    Signed in as <strong>{userState.currentUsername}</strong>
                  </>
                }
              />
              <Menu.Divider title='Hello' />
              <Menu.ItemGroup title={<>Color Theme</>}>
                <Menu.Item
                  onClick={toggleActivation}
                  icon={
                    activationChanging ? (
                      <LoadingOutlined />
                    ) : (
                      <FormatPainterOutlined />
                    )
                  }
                >
                  System Theme
                  <span />
                  <Switch
                    size='small'
                    checked={themeState.activation}
                    loading={activationChanging}
                  />
                </Menu.Item>
                {!themeState.activation && (
                  <Menu.Item
                    onClick={toggleTheme}
                    icon={
                      <AntIcon
                        component={() => <Icon path={mdiMoonWaningCrescent} />}
                      />
                    }
                  >
                    Dark Mode
                    <span />
                    <Switch
                      size='small'
                      checked={themeState.theme === 'dark'}
                    />
                  </Menu.Item>
                )}

                <Menu.Item
                  onClick={showThemeSettings}
                  icon={<AntIcon component={() => <Icon path={mdiCogs} />} />}
                >
                  Theme Settings
                </Menu.Item>
              </Menu.ItemGroup>

              <Menu.Divider />
              <Menu.Item
                onClick={() => goto('/signout')}
                icon={<LogoutOutlined />}
              >
                Sign Out
              </Menu.Item>
            </StyledSmallMenu>
          )
        }
        trigger={['click']}
        visible={visible}
        onVisibleChange={setVisible}
        placement='bottomRight'
        align={{
          offset: [0, -20] // the offset sourceNode by 10px in x and 20px in y,
        }}
      >
        <span className='btn'>
          <Avatar size={22} icon={<UserOutlined />} />
          {visible ? <CaretUpOutlined /> : <CaretDownOutlined />}
        </span>
      </StyledPopover>
    </>
  )
}

const StyledPopover = styled(Dropdown)`
  color: var(--avatar-bg);
  cursor: pointer;
`

const StyledSmallMenu = styled(Menu)`
  &.ant-dropdown-menu {
    .ant-dropdown-menu-item {
      display: flex;
      align-items: center;
      > a {
        flex: auto;
      }
      > .anticon {
        font-size: 14px;
        display: flex;
        align-items: center;
        > svg {
          width: 1em;
          height: 1em;
        }
      }
      > span {
        &:not(.anticon) {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
        }
      }

      span:empty {
        &:not(.sep) {
          flex: auto;
        }
      }
      > .ant-switch.ant-switch-small {
        margin-right: 8px;
      }
    }
  }
`
export default UserMenu
