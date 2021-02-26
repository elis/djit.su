import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { List } from 'antd'

import styled from 'styled-components'
import listItem from './list-item'
import documentItem from 'djitsu/views/notebooks/document-item'

export const NotebooksList = (props) => {
  const { viewOptions, setViewOption, data, loading, totalAvailable } = props

  const handleItemClick = useCallback(
    (item) => (event) => {
      if (event.metaKey) console.log('📗 Notebook:', item)
    },
    []
  )

  const itemRenderer = useMemo(
    () =>
      (viewOptions.selectedView === 'list' ? listItem : documentItem)({
        handleItemClick
      }),
    [viewOptions.selectedView, handleItemClick]
  )

  return (
    <>
      <StyledList
        className={viewOptions.selectedView === 'tiled' ? 'tiled' : ''}
        itemLayout='horizontal'
        dataSource={data}
        renderItem={itemRenderer}
        loading={
          loading && data.length < viewOptions.page * viewOptions.pageSize
        }
        grid={
          viewOptions.selectedView === 'tiled'
            ? {
                gutter: [8, 48]
              }
            : false
        }
        pagination={{
          current: viewOptions.page,
          pageSize: viewOptions.pageSize,
          total: totalAvailable,
          onChange: (page, pageSize) => {
            setViewOption({ page, pageSize })
          }
        }}
      />
    </>
  )
}

NotebooksList.propTypes = {
  data: PropTypes.array,
  viewType: PropTypes.string
}

NotebooksList.defaultProps = {
  data: [],
  viewType: 'list'
}

const StyledList = styled(List)`
  &.ant-list {
    &.tiled {
      margin-top: 24px;
      .ant-row {
        justify-content: space-evenly;
      }
      .ant-list-items {
        .ant-list-item {
          .ant-list-item-action {
            opacity: 0.02;
            transition: opacity 120ms ease-out;
          }
          &:hover {
            .ant-list-item-action {
              opacity: 0.2;
              &:hover {
                opacity: 1;
              }
            }
          }
        }
      }
    }
  }
`

export default NotebooksList
