import React from 'react'
import { Button, Divider, Layout } from 'antd'
import { useTheme } from 'djitsu/theme'
import styled from 'styled-components'
import BrandButton from './components/brand-button'
// import { useNotebook } from 'djitsu/providers/notebook'
import UserMenu from './components/user-menu'
import DocumentButton from './components/document-button'
import { ssr } from 'djitsu/utils/ssr'
import { LikeFilled } from '@ant-design/icons'
import { useHistory } from 'djitsu/adapters/routes'
import { useUser } from 'djitsu/providers/user'
const { Header: AntHeader } = Layout

export const Header = () => {
  const [userState] = useUser()
  const history = useHistory()
  console.log('history!', history)
  const [theme] = useTheme()
  const displayItems = userState?.currentUsername ? (
    <>
      <Divider type='vertical' />
      <Button
        href='/notebooks'
        type={history.location.pathname === '/notebooks' ? 'primary' : 'link'}
        onClick={(event) => {
          event.preventDefault()
          if (history.location.pathname !== '/notebooks')
            history.push('/notebooks')
        }}
      >
        Notebooks
      </Button>
    </>
  ) : (
    <></>
  )

  return (
    <StyledHeader
      className='header'
      // theme={theme.theme === 'dark' ? 'light' : 'dark'}
      theme={'light'}
      themed={theme.theme}
    >
      <BrandButton />
      {displayItems}
      <span />
      <div
        className='setter'
        style={{ visibility: 'hidden', position: 'absolute', left: '-9999px' }}
      >
        <Button type='primary' icon={<LikeFilled />}>
          Test!
        </Button>
        <Divider type='vertical' />
      </div>
      {!ssr && <DocumentButton />}
      <UserMenu />
    </StyledHeader>
  )
}

const StyledHeader = styled(AntHeader)`
  &.ant-layout-header.header {
    display: flex;
    align-items: center;
    padding: 0 8px;
    position: sticky;
    top: 0;
    @media (min-width: 576px) {
      padding: 0 24px;
    }

    height: 38px;
    box-shadow: 0 -6px 10px rgba(0, 0, 0, 0.5),
      0 -6px 12px rgba(255, 255, 255, 0.5);

    &::after {
      display: block;
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      pointer-events: none;
      z-index: -10;
      background: var(--background-color);
      backdrop-filter: blur(8px);
    }
    .ant-divider {
      &.ant-divider-vertical {
        background-color: ${({ themed }) =>
          themed === 'dark'
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(0, 0, 0, 0.06)'};
      }
    }
    span:empty {
      &:not(.sep) {
        flex: 1 1 auto;
      }
      &.sep {
        display: block;
        margin: 0 0.75em;
        border-right: 1px solid
          ${({ themed }) =>
            themed === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.03)'};
        height: 100%;
      }
    }
    .logo {
      line-height: 38px;
      display: flex;
      align-items: stretch;
      height: 100%;
      &,
      > a {
        color: ${({ themed }) =>
          themed === 'dark'
            ? 'rgba(243, 243, 243, 0.97)'
            : 'rgba(9, 9, 9, 0.97)'};
      }
      > a {
        height: 100%;
        display: flex;
        align-items: center;
        .ant-badge {
          .anticon.ant-scroll-number-custom-component {
            top: 12px;
          }
        }
      }
      > a > span {
        font-size: 30px;
        display: inline-block;
        margin-top: 1px;
        @media (min-width: 576px) {
          margin-top: -7px;
        }

        @media screen and (min-device-width: 1200px) and (max-device-width: 1600px) and (-webkit-min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {
          margin-top: -7px;
        }
        @media screen and (-webkit-device-pixel-ratio: 4) and (orientation: landscape) {
          margin-top: 1px;
        }
      }
      > a > em {
        display: inline-block;
        font-style: normal;
        font-size: 14px;
        font-weight: 300;
        position: relative;
        margin-left: 0.5em;
      }
      html body &:not(:hover) {
        background: transparent;
      }
    }
    > .network-status {
      &.offline {
      }
    }
    .document-toolbar {
      display: flex;
      align-items: center;
      flex: auto;
    }
    .ant-btn {
      &.ant-btn-heads {
        transition: all 220ms ease-out;
        background: none;
        border: none;
        &:not(.ant-btn-dangerous) {
          color: ${({ themed }) =>
            themed !== 'dark'
              ? 'var(--neutral-dark)'
              : 'rgba(255, 255, 255, 0.8)'};
        }
        box-shadow: none;

        > .anticon {
          font-size: 14px;
        }
        &:hover {
          &:not(.ant-btn-dangerous) {
            color: var(--primary-color);
          }
          background: ${({ themed }) =>
            themed !== 'dark'
              ? 'rgba(190, 190, 190, 0.1)'
              : 'rgba(190, 190, 190, 0.1)'};
        }
      }
    }
    > .ant-menu {
      line-height: 38px;
    }
  }
`

export default Header
