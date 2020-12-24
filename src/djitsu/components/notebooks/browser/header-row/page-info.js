import React from 'react'

export const PageInfo = (props) => {
  const { total, pageSize, page, search } = props
  return (
    <>
      {total > 0 && (
        <>
          Showing{' '}
          <data>
            {pageSize * (page - 1) + 1} -{' '}
            {pageSize * page > total ? total : pageSize * page}
          </data>{' '}
          of around <data>{total}</data> {search ? <> found </> : ''}
          notebooks
        </>
      )}
    </>
  )
}

export default PageInfo
