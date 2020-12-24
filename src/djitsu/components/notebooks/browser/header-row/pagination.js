import React, { useCallback, useMemo } from 'react'
import { Button } from 'antd'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

export const Pagination = (props) => {
  const { total = 0, page, onChange, pageSize } = props

  const [canPrevPage, canNextPage] = useMemo(
    () => [page > 1, pageSize * page < total],
    [page, pageSize, total]
  )
  const onPrevPage = useCallback(() => onChange(page - 1), [page])
  const onNextPage = useCallback(() => onChange(page + 1), [page])

  return (
    <>
      <Button
        onClick={onPrevPage}
        disabled={!canPrevPage}
        size='small'
        type='link'
      >
        <AntIconMDI path={mdiChevronLeft} /> Prev
      </Button>
      <span>/</span>
      <Button
        onClick={onNextPage}
        disabled={!canNextPage}
        size='small'
        type='link'
      >
        Next <AntIconMDI path={mdiChevronRight} />
      </Button>
    </>
  )
}

export default Pagination
