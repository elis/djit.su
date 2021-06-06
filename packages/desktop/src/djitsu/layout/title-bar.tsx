import React from 'react'
import { Button, Layout, Tooltip } from 'antd'
import styled from 'styled-components'
import { CodeOutlined, FileAddOutlined } from '@ant-design/icons'
import useIPCRenderer from '../services/ipc/renderer'
import { ThemeDropdown } from './header'

export type TitleBarProps = {
  children: React.ReactChildren
}

export const TitleBar: React.FC<TitleBarProps> = ({ children }) => {
  const ipc = useIPCRenderer()
  const showDevTools = () => {
    ipc.invoke('open-dev-tools', 'test', { jest: 'fest' })
  }

  const getLocal = async () => {
    const locals = await ipc.invoke('get-local')
    console.log('Locals:', locals)
  }

  // TODO: Remove affix and make better layout

  return (
    <StyledTitleBar>
      <div className="os-control" />
      <div className="title subtle">djitsu desktop v0.1.0</div>
      <div className="late subtle">
        {children}
        <Button
          type="text"
          size="small"
          onClick={getLocal}
          icon={<FileAddOutlined />}
        />
        <ThemeDropdown>
          <Button type="text" size="small">
            Theme
          </Button>
        </ThemeDropdown>

        <Tooltip title="Open DevTools">
          <Button
            type="text"
            size="small"
            onClick={showDevTools}
            icon={<CodeOutlined />}
          />
        </Tooltip>
      </div>
    </StyledTitleBar>
  )
}

const StyledTitleBar = styled(Layout.Header)`
  &.ant-layout-header {
    top: 0;
    --height: 28px;
    -webkit-app-region: drag;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: var(--height);
    padding: 0;
    height: var(--height);
    line-height: var(--height);
    background: var(--menu-bg);
    z-index: 99999;
    position: sticky;
    > * * {
      -webkit-app-region: no-drag;
    }
    > .title {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    > .late {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    > .subtle {
      opacity: 0.1;
      transition: opacity 120ms ease-out;
    }
    &:hover > .subtle {
      opacity: 1;
    }
  }
`

export default TitleBar
