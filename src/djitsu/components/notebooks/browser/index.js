import React, { useCallback, useEffect } from 'react'
import LayoutCard from 'djitsu/components/layout-card'
import { Button } from 'antd'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import { mdiFilePlus } from '@mdi/js'
import PropTypes from 'prop-types'
import HeaderRow from './header-row'
import useStates from 'djitsu/utils/hooks/use-states'
import NotebooksList from './notebooks-list'
import { useHistory } from 'djitsu/adapters/routes'

export const NotebookBrowser = (props) => {
  const {
    title,
    allowNew = true,
    headerExtra,
    onChange,
    data,
    selectedView,
    totalAvailable,
    loading
  } = props

  const history = useHistory()

  const [viewOptions, setViewOption] = useStates({
    pageSize: 20,
    order: 'desc',
    orderBy: 'update',
    page: 1,
    visiblePage: 1,
    selectedView: selectedView,
    selectedType: 'all'
  })

  const handleClickNew = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    history.push('/create-new')
  }, [])

  useEffect(() => {
    onChange?.(viewOptions)
  }, [viewOptions])

  useEffect(() => {
    if (selectedView !== viewOptions.selectedView)
      setViewOption('selectedView', () => selectedView)
  }, [selectedView])

  return (
    <LayoutCard
      title={title}
      headerExtra={
        allowNew ? (
          <>
            <Button
              onClick={handleClickNew}
              type='primary'
              icon={<AntIconMDI path={mdiFilePlus} />}
            >
              Create New
            </Button>
            {headerExtra}
          </>
        ) : (
          headerExtra
        )
      }
      headerContent={
        <HeaderRow
          viewOptions={viewOptions}
          totalAvailable={totalAvailable}
          setViewOption={setViewOption}
        />
      }
    >
      <NotebooksList
        data={data}
        viewOptions={viewOptions}
        setViewOption={setViewOption}
        totalAvailable={totalAvailable}
        loading={loading}
      />
    </LayoutCard>
  )
}
NotebookBrowser.propTypes = {
  allowNew: PropTypes.bool,
  title: PropTypes.string
}
NotebookBrowser.defaultProps = {
  allowNew: true
}
export default NotebookBrowser
