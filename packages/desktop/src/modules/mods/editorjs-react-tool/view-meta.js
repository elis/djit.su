import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Divider, Popover } from 'antd'
import AntIcon, { QuestionCircleFilled } from '@ant-design/icons'
import Icon from '@mdi/react'
import { mdiOpenInNew } from '@mdi/js'
import Mdx from '@mdx-js/runtime'

export const ViewMeta = props => {
  return (
    <Divi orientation={props.orientation} className="block-meta smart-divi">
      <span className="title">{props.children}</span>
      {props.actions && (
        <>
          <Divider type="vertical" />
          <div className="actions">{props.actions}</div>
        </>
      )}
    </Divi>
  )
}

ViewMeta.defaultProps = {
  orientation: 'right'
}
ViewMeta.propTypes = {
  orientation: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ]),
  actions: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ])
}

const DescriptiveTitle = ({ title, description, children }) => (
  <>
    {title || children} &nbsp;
    <Popover content={mdxDescription(description)} title={title || children}>
      <QuestionCircleFilled />
    </Popover>
  </>
)

const HelpAction = ({ title, description, children }) => (
  <Popover content={mdxDescription(description)} title={title || children}>
    <QuestionCircleFilled />
  </Popover>
)

DescriptiveTitle.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node
}

ViewMeta.DescriptiveTitle = DescriptiveTitle
ViewMeta.HelpAction = HelpAction

const Divi = styled(Divider)`
  &.ant-divider {
    &.ant-divider-horizontal {
      &.ant-divider-with-text-right {
        height: auto;
        margin-top: 0px;
        display: flex;
        align-items: center;
        transition: all 90ms ease-in;

        > .ant-divider-inner-text {
          align-items: center;
          display: flex;
          font-size: 11px;
          font-weight: normal;
          transition: all 90ms ease-in;
          color: var(--theme-dark-text-3); //rgba(255, 255, 255, 0.4);

          position: relative;
          &::after,
          &::before {
            position: absolute;
            content: '';
            border-top: 1px solid #f0f;
            left: 0;
            right: 0;
            display: none;
          }
          &::before {
            top: 8px;
          }
          &::after {
            bottom: 8px;
          }

          > .title {
            cursor: default;
            display: flex;
            align-items: center;
            line-height: 29px;
            > .anticon {
              &:first-child {
                position: relative;
                top: 0;
              }
            }
          }
          .anticon {
            font-size: 10px;
            position: relative;
            top: -1px;
          }
          .ant-btn {
            height: auto;
            .anticon {
              top: auto;
            }
          }
          > .ant-divider.ant-divider-vertical {
            + .actions {
              margin-left: calc(-1 * (var(--control-padding-horizontal)));
            }
          }
          > .actions {
            > .ant-btn {
              > .anticon {
                top: 0;
                position: relative;
              }
            }
            &:last-child {
              margin-right: calc(-1 * (var(--control-padding-horizontal)));
            }
            > .ant-divider.ant-divider-vertical {
              margin: 0 1px;
            }
          }
        }
        &::before,
        &::after {
          height: 1px;
          margin-top: -2px;
          border-color: var(--separator-color);
        }
        &::before {
          width: auto;
          flex: 1 1 auto;
        }
        &:hover {
          > .ant-divider-inner-text {
          }
        }

        &:not(:nth-child(-1)) {
          margin-bottom: 0;
          /* background: #F0F; */
        }
      }
    }
  }
`

const HelpTitle = props => (
  <Divider orientation="left">{props.children}</Divider>
)
export const ExternalA = props => (
  <a href={props.href} target="_blank" rel="noopener noreferrer">
    {props.children}&nbsp;
    <AntIcon component={() => <Icon path={mdiOpenInNew} size={0.4} />} />
  </a>
)
const PopoverDescription = styled.div`
  max-width: 320px;
  font-size: 11px;
  .ant-divider-inner-text {
    font-size: 11px;
  }
`

const mdxDescription = mdx => (
  <PopoverDescription>
    <Mdx
      components={{
        Divider: HelpTitle,
        A: ExternalA
      }}
      scope={{}}
    >
      {mdx}
    </Mdx>
  </PopoverDescription>
)

export default ViewMeta
