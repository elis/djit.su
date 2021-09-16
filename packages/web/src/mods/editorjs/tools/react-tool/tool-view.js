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
  type,
  size,
  updateSize
}) => {
  const [tos, toa] = useTool()

  console.log('🤯', { type, size, updateSize })

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

  const handleClick = (e) => {
    if (!type === 'draggable') return
    console.log('CLCIK', e)
  }

  const handleDrag = (e) => {
    if (!type === 'draggable') return
    console.log('drag', e)
  }

  return (
    <StyledToolView
      onClick={handleClick}
      onDrag={handleDrag}
      className={`tool-view ${className || ''}`}
    >
      <Collapse activeKey={hidden ? '' : '1'}>
        <Collapse.Panel key='1'>
          {children}
          {label && (
            <ViewMeta actions={actions}>
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
`

export default ToolView
