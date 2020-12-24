import { Input } from 'antd'
import React from 'react'

export const SearchInput = (props) => {
  return (
    <Input.Search
      size='small'
      placeholder='Search'
      onSearch={(value) => {
        props.onChange?.(value)
      }}
    />
  )
}

export default SearchInput
