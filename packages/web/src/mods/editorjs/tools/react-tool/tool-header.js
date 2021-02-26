import React, { useState, useCallback, useEffect } from 'react'
import useToggle from 'djitsu/utils/hooks/use-toggle'
import PropTypes from 'prop-types'
import { Form, Input, Space, PageHeader, Button, Tooltip } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useTool } from './tool.context'

export const ToolHeader = (props) => {
  const { placeholder } = props
  const [editName, toggleEditName, setEditName] = useToggle(false)
  const usedTool = useTool()
  const [tos, toa] = usedTool
  const [inputValue, setInputValue] = useState(tos.options.name)

  const toggleView = (name) => {
    toa.toggleView(name)
  }

  const onSubmitName = useCallback(
    ({ name }) => {
      setEditName(false)
      setInputValue(name)
      toa.setBlockName(name)
    },
    [editName, inputValue]
  )
  const editBlockName = () => {
    toggleEditName()
  }

  const cancelEdit = () => {
    setEditName(false)
  }

  useEffect(() => {
    setInputValue(tos.options.name)
  }, [tos.options.name])

  const blockTitleValue = editName ? (
    <Form
      onFinish={onSubmitName}
      layout='inline'
      initialValues={{
        name: inputValue
      }}
    >
      <Form.Item name='name'>
        <Input placeholder='Block name' size='small' />
      </Form.Item>
      <Form.Item shouldUpdate={true} className='actions'>
        {() => (
          <Space>
            <VButton
              type='primary'
              size='small'
              htmlType='submit'
              onClick={() => {
                console.log('welp')
              }}
            >
              Save
            </VButton>
            <VButton type='ghost' size='small' onClick={cancelEdit}>
              Cancel
            </VButton>
          </Space>
        )}
      </Form.Item>
    </Form>
  ) : (
    <span onDoubleClick={editBlockName}>
      {tos.options.name || <em>{placeholder || 'Untitled'}</em>}
    </span>
  )

  return (
    <StyledBlockHeader
      key={`po-${tos.options.name}`}
      className={`block-header ${editName ? 'edit-name' : ''}`}
      title={blockTitleValue}
      tags={
        <>
          <VButton
            onClick={() => {
              console.log('ON CLICK ON editBlockName()')
              editBlockName()
            }}
            size='small'
          >
            <EditOutlined size='42' />
          </VButton>
        </>
      }
      extra={
        <>
          <span>
            {!!tos?.views?.length &&
              tos.views
                .sort(() => -1)
                .map(({ name, details: { icon, label } }) => (
                  <Tooltip
                    mouseEnterDelay={0.5}
                    title={
                      (tos.viewOptions?.[name]?.hidden ? `Show ` : `Hide `) +
                      label
                    }
                    key={name}
                    placement='bottom'
                  >
                    <VButton
                      size='small'
                      onClick={() => toggleView(name)}
                      ghost
                      active={!tos.viewOptions?.[name]?.hidden}
                    >
                      {icon}
                    </VButton>
                  </Tooltip>
                ))}
          </span>
        </>
      }
      // breadcrumb={{ routes }}
      // subTitle='Yo yo yo!'
    ></StyledBlockHeader>
  )
}

ToolHeader.propTypes = {
  title: PropTypes.string,
  onChange: PropTypes.func
}

const StyledBlockHeader = styled(PageHeader)`
  &.block-header {
    &.ant-page-header {
      /************ */
      /* VIEW MODE */
      /* ************/

      border-bottom: 1px solid var(--tool-outline-color);

      padding: 0 var(--control-padding-horizontal);
      .ant-page-header-heading {
        &-tags,
        &-extra {
          opacity: 0.2;
          transition: all 120ms ease-in-out;
        }
      }
      .ant-page-header-heading-left {
        padding: 0;
        margin: 0;
        .ant-page-header-heading-title {
          line-height: 20px;
          font-size: 12px;
          transition: all 120ms ease-in-out;
          font-weight: normal;
          > span:only-child > em {
            font-style: normal;
            opacity: 0.1;
            transition: all 1200ms ease-in-out;
          }
        }
      }
      .ant-page-header-heading-extra {
        .ant-btn {
          color: var(--theme-dark-text-3);
          .anticon {
            color: inherit;
          }
          &.active,
          &:active,
          &:hover {
            color: var(--primary-color);
          }
        }
      }
      &:hover {
        .ant-page-header-heading {
          &-extra,
          &-tags {
            opacity: 1;
          }
        }
        .ant-page-header-heading-title {
          > span:only-child > em {
            opacity: 0.5;
          }
        }
      }

      /************ */
      /* EDIT MODE */
      /* ************/

      &.edit-name {
        padding-left: 0;
        .ant-page-header-heading-left {
          form {
            margin-top: -2px;
            .ant-form-item-control-input {
              min-height: 24px;
            }
            input {
              font-size: 12px;
            }
            .actions {
              font-size: 11px;
              .ant-btn {
                min-height: 0;
                height: 17px;
                line-height: 17px;
                color: #eee;
              }
            }
          }
        }
        .ant-page-header-heading-tags {
          display: none;
        }
      }
    }
  }
`

export const VButton = ({ active, ...props }) => {
  return <StyledVButton className={active ? 'active' : ''} {...props} />
}

const StyledVButton = styled(Button)`
  &.ant-btn {
    color: inherit;
    border: none;
    font-size: inherit;
    box-shadow: none;
    display: inline-flex;
    align-items: center;
    &:hover {
      color: var(--blue-accent-primary);
    }
    &[disabled] {
      background: none;
      pointer-events: none;
    }
    &.active {
      /* color: var(--blue-accent-primary);
      &:hover {
        color: inherit;
      } */
    }
  }
`

export default ToolHeader
