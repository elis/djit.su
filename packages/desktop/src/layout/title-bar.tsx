import React from 'react'
import { Affix, Button, Layout, Tooltip } from 'antd'
import styled from 'styled-components'
import useIPCRenderer from '../services/ipc/renderer'
import { CodeOutlined } from '@ant-design/icons'
import { ThemeDropdown } from './header'

export const TitleBar: React.FC = (props) => {
  const ipc = useIPCRenderer()
  const showDevTools = () => {
    ipc.invoke('open-dev-tools', 'test', { jest: 'fest' })
  }

  // TODO: Remove affix and make better layout

  return (
    <Affix>
      <StyledTitleBar>
        <div className='os-control' />
        <div className='title subtle'>djitsu desktop v0.1.0</div>
        <div className='late subtle'>
          {props.children}
          <ThemeDropdown>
            <Button type='text' size='small'>Theme</Button>
          </ThemeDropdown>

          <Tooltip title='Open DevTools'>
            <Button type='text' size='small' onClick={showDevTools} icon={<CodeOutlined />} />
          </Tooltip>
        </div>
      </StyledTitleBar>
    </Affix>
  )
}

const StyledTitleBar = styled(Layout.Header)`
  &.ant-layout-header {
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
    position: relative;
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