import React from 'react'
import styled from 'styled-components'
import ToolHeader from './tool-header'
import ToolView from './tool-view'

export const Tool = (props) => {
  const { placeholder, noTitle = false } = props

  return (
    <StyledToolContainer>
      {!noTitle && <ToolHeader placeholder={placeholder || 'untitled'} />}
      {props.children}
    </StyledToolContainer>
  )
}

Tool.View = ToolView

const StyledToolContainer = styled.div`
  --meta-height: 29px;
  --last-padding: 14px;
  --separator-color: var(--editor-word-highlight-background);
  margin: 0 0 18px 0;
  .tool-view {
    .ant-collapse-content {
      > .ant-collapse-content-box {
        > .smart-divi,
        > .code-editor,
        > .demo-editor,
        > .demo {
          border: 1px solid var(--separator-color);
          border-top: none;
          border-bottom: none;
        }
        > .smart-divi {
          + .code-editor,
          + .demo-editor {
            padding-top: 30px;
            margin-top: -30px;
          }
          &.ant-divider {
            &.ant-divider-horizontal {
              &.ant-divider-with-text-right {
                > .ant-divider-inner-text {
                  line-height: var(--meta-height);
                }
              }
            }
          }
        }
        > .divi-draw {
          padding-bottom: var(--last-padding);
          & + .smart-divi:last-child {
            margin-top: calc(var(--last-padding) * -1);
          }
        }
        > *:nth-last-child(2) {
          transition: all 20ms ease-in;
          padding-bottom: var(--last-padding);
          + .smart-divi:last-child {
            /* border: none; */
            &.ant-divider.ant-divider-horizontal.ant-divider-with-text-right {
              transition: all 20ms ease-in;
              /* margin-top: -11px; */
            }
          }
        }
      }
    }
    &:last-child {
      .ant-collapse-content {
        > .ant-collapse-content-box {
          > .smart-divi {
            border: none;
          }
        }
      }
    }
  }

  > x.neg {
    border: 1px solid var(--background-color);
    border-top: none;
    border-bottom: none;
    margin: -27px -1px 0;
    height: 28px;
  }
`

export default Tool
