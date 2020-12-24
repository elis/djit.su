import React from 'react'
import { Select } from 'antd'
import { GlobalOutlined, LinkOutlined } from '@ant-design/icons'

export const TypeSelector = (props) => {
  return (
    <>
      Show:{' '}
      <Select
        value={props.selected}
        size='small'
        style={{ width: 120 }}
        bordered={false}
        onChange={props.onChange}
      >
        <Select.Option value='all'>All</Select.Option>
        <Select.Option value='published'>
          <GlobalOutlined /> Published
        </Select.Option>
        <Select.Option value='shared'>
          <LinkOutlined /> Shared
        </Select.Option>
      </Select>
    </>
  )
}

export default TypeSelector
