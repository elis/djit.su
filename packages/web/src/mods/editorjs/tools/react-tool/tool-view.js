import React, { useEffect } from 'react'
import { useTool } from './tool.context'
import ViewMeta from './view-meta'
import { Divider, Collapse } from 'antd'
import styled from 'styled-components'

export const ToolView = ({
  actions,
  name,
  label,
  description,
  icon,
  children,
  className,
  onTop = false
}) => {
  const [tos, toa] = useTool()

  console.log('🍎', onTop)

  useEffect(() => {
    const teardown = toa.setView(name, {
      label,
      children,
      icon
    })
    return () => {
      teardown()
    }
  }, [name, label])

  const vf = tos.viewOptions[name] || {}
  const { hidden } = vf

  return (
    <StyledToolView
      className={
        !onTop
          ? `tool-view ${className || ''}`
          : `tool-view ${className || ''} on-top`
      }
    >
      <Collapse activeKey={hidden ? '' : '1'}>
        <Collapse.Panel key='1'>
          {children}
          {label && (
            <ViewMeta className={onTop ? 'on-top' : null} actions={actions}>
              {icon}
              {icon && <>&nbsp;</>}
              {label}
              {description && (
                <>
                  <Divider type='vertical' />
                  <ViewMeta.HelpAction
                    title={label}
                    description={description}
                  />
                </>
              )}
            </ViewMeta>
          )}
        </Collapse.Panel>
      </Collapse>
    </StyledToolView>
  )
}

const StyledToolView = styled.section`
  &.tool-view {
    > .ant-collapse {
      background: none;
      border: none;
      > .ant-collapse-item {
        border: none;
        > .ant-collapse-header {
          display: none;
        }
        > .ant-collapse-content {
          border: none;
          background: none;
          > .ant-collapse-content-box {
            padding: 0;
          }
        }
      }
    }
  }
  .on-top {
    z-index: 9999999999999999999999999999999;
  }
`

export default ToolView
