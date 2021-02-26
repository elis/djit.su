import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Col, Divider, Row } from 'antd'
import TypeSelector from './type-selector'
import SearchInput from './search-input'
import ViewSelector from './view-selector'
import Pagination from './pagination'
import PageInfo from './page-info'

export const HeaderRow = (props) => {
  const {
    showStats = true,
    totalAvailable = 0,
    viewOptions,
    setViewOption
  } = props

  const viewTypeChanged = useCallback(
    (value) => {
      if (viewOptions.selectedType !== value)
        setViewOption('selectedType', value)
    },
    [viewOptions.selectedType]
  )

  const searchChanged = useCallback((newValue) => {
    setViewOption('search', () => newValue)
  }, [])

  const viewStyleChanged = useCallback(
    (event) => {
      const {
        target: { value }
      } = event
      if (viewOptions.selectedView !== value)
        setViewOption('selectedView', value)
    },
    [viewOptions.selectedView]
  )

  return (
    <>
      <Row justify='space-between'>
        <Col>
          <TypeSelector
            onChange={viewTypeChanged}
            selected={viewOptions.selectedType}
          />
        </Col>
        <Col>
          <Row gutter={16}>
            <Col>
              <SearchInput onChange={searchChanged} />
            </Col>
            <Col>
              <ViewSelector
                onChange={viewStyleChanged}
                selected={viewOptions.selectedView}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider style={{ margin: '4px 0' }} />
      <Row justify='space-between'>
        <Col>
          {showStats && (
            <PageInfo
              page={viewOptions.page}
              pageSize={viewOptions.pageSize}
              total={totalAvailable}
              search={viewOptions.search}
            />
          )}
        </Col>
        <Col>
          <Pagination
            page={viewOptions.page}
            pageSize={viewOptions.pageSize}
            total={totalAvailable}
            onChange={(page) => setViewOption({ page })}
          />
        </Col>
      </Row>
    </>
  )
}

HeaderRow.propTypes = {
  totalAvailable: PropTypes.number,
  showStats: PropTypes.bool,
  onViewOptionsChange: PropTypes.func
}
HeaderRow.defaultProps = {
  showStats: true
}
export default HeaderRow
