import React from 'react'
import PropTypes from 'prop-types'

export const CollectionCard = (props) => {
  return (
    /*
    <NotebooksLayout>
      <CardedLayout>
        <Header>
          <PageHeader
            title='Notebooks'
            extra={
              <>
                <Button
                  onClick={handleClickNew}
                  size='small'
                  type='primary'
                  icon={<AntIconMDI path={mdiFilePlus} />}
                >
                  Create New
                </Button>
              </>
            }
          >
            <Row justify='space-between'>
              <Col>
                <TypeSelector
                  onChange={viewTypeChanged}
                  selected={selectedType}
                />
              </Col>
              <Col>
                <Row gutter={16}>
                  <Col>
                    <SearchNotebooks onChange={searchChanged} />
                  </Col>
                  <Col>
                    <ViewSelector
                      onChange={viewStyleChanged}
                      selected={selectedView}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Divider style={{ margin: '4px 0' }} />
            <Row justify='space-between'>
              <Col>
                {userStats && (
                  <>
                    Showing{' '}
                    <data>
                      {viewOptions.pageSize * (viewOptions.page - 1) +
                        1}{' '}
                      - {viewOptions.pageSize * viewOptions.page}
                    </data>{' '}
                    of around{' '}
                    <data>
                      {viewOptions.search
                        ? searchResults.length
                        : viewOptions.maxReached
                        ? myNotebooks.length
                        : userStats?.notebooks}
                    </data>{' '}
                    {viewOptions.search ? <> found </> : ''}
                    notebooks
                  </>
                )}
              </Col>
              <Col>
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
              </Col>
            </Row>
          </PageHeader>
        </Header>
        <Content>
          {selectedView === 'list' ? (
            <List
              itemLayout='horizontal'
              dataSource={
                viewOptions.search ? searchResults : myNotebooks
              }
              renderItem={ListViewItem({ handleItemClick })}
              loading={
                isLoading &&
                myNotebooks.length <
                  viewOptions.page * viewOptions.pageSize
              }
              pagination={{
                current: viewOptions.page,
                pageSize: viewOptions.pageSize,
                total: viewOptions.search
                  ? searchResults.length
                  : viewOptions.maxReached
                  ? myNotebooks.length
                  : userStats?.notebooks,
                onChange: (page, pageSize) => {
                  setViewOption({ page, pageSize })
                }
              }}
            />
          ) : (
            <StyledTiledList
              itemLayout='horizontal'
              dataSource={
                viewOptions.search ? searchResults : myNotebooks
              }
              renderItem={TiledViewItem({ handleItemClick })}
              grid={{
                gutter: [8, 48]
              }}
              loading={
                isLoading &&
                myNotebooks.length <
                  viewOptions.page * viewOptions.pageSize
              }
              pagination={{
                current: viewOptions.page,
                pageSize: viewOptions.pageSize,
                total: viewOptions.maxReached
                  ? myNotebooks.length
                  : userStats?.notebooks,
                onChange: (page, pageSize) => {
                  setViewOption({ page, pageSize })
                }
              }}
            />
          )}
        </Content>
        <Footer></Footer>
      </CardedLayout>
    </NotebooksLayout>
    */
    <>Collection Card</>
  )
}

export default CollectionCard
