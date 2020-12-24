import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import firebase from 'firebase'

import { useUser } from 'djitsu/providers/user'
import { useNotebook } from 'djitsu/providers/notebook'
import { Col, Menu, Row, Affix } from 'antd'
import { FileOutlined, HomeOutlined } from '@ant-design/icons'
import { mdiPackage } from '@mdi/js'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import useStates from 'djitsu/utils/hooks/use-states'
import { NotebooksOrderBy } from 'djitsu/schema/notebook'

import NotebookBrowser from 'djitsu/components/notebooks/browser'

export const Notebooks = () => {
  const [user, userActions] = useUser()
  const [, notebookActions] = useNotebook()
  const [myNotebooks, setNotebooks] = useState([])
  const [selectedView, setSelectedView] = useState(false)
  const [isLoading, setLoading] = useState()
  const [isReloading, setReloading] = useState()

  const [viewOptions, setViewOption] = useStates()

  const userStats = useMemo(
    () => user.userProfiles[user.currentUsername]?.stats,
    [user.currentUsername, user.userProfiles[user.currentUsername]]
  )

  const searchResults = useMemo(() => {
    if (viewOptions.search) {
      const serre = new RegExp(viewOptions.search, 'i')
      const results = myNotebooks.filter(
        ({ notebookId, meta: { createdBy }, properties: { title, name } }) =>
          notebookId.match(serre) ||
          createdBy.match(serre) ||
          title?.match?.(serre) ||
          name?.match?.(serre)
      )

      return results
    }
  }, [myNotebooks, viewOptions.search])

  const loadMyNotebooks = useCallback(
    async (page = 1) => {
      const lastElmIndex = viewOptions.pageSize * (page - 1) - 1
      const startAfterElm = myNotebooks?.[lastElmIndex]
      setLoading(true)
      const query = {
        orderBy: NotebooksOrderBy.Updated,
        pageSize: viewOptions.pageSize,
        ...(startAfterElm?.meta?.updated
          ? {
              startAfter: firebase.firestore.Timestamp.fromMillis(
                startAfterElm?.meta?.updated
              )
            }
          : {}),

        ...(viewOptions.selectedType === 'published'
          ? {
              whereIs: [{ isPublished: true }]
            }
          : viewOptions.selectedType === 'shared'
          ? {
              whereIs: [{ isPublic: true }]
            }
          : {})
      }

      const result = await notebookActions.getUserNotebooks(
        user.currentUsername,
        query
      )

      if (result && result.length) {
        setNotebooks((v) => [...v, ...result])
        if (result.length < viewOptions.pageSize)
          setViewOption('maxReached', true)
      }
      setLoading(false)
    },
    [user.currentUsername, viewOptions, myNotebooks]
  )

  useEffect(() => {
    if (user.currentUsername && user.options) {
      const option = 'my-notebooks-selected-view'
      if (selectedView === false && user.options[option]) {
        setSelectedView(user.options[option])
      } else if (user.options?.[option] !== selectedView) {
        userActions.setOption(option, selectedView)
      }
    }
  }, [user.currentUsername, user.options, selectedView])

  useEffect(() => {
    setNotebooks([])
    setPrefetchedPages([])
    setViewOption({
      page: 1,
      maxReached: false
    })
    if (viewOptions.selectedType) setReloading(true)
  }, [viewOptions.selectedType])

  useEffect(() => {
    if (isReloading) {
      loadMyNotebooks()
      setReloading(false)
    }
  }, [isReloading])

  useEffect(() => {
    if (user.currentUsername) {
      const doer = async () => {
        await userActions.loadUserMetaStats(user.currentUsername)
        await loadMyNotebooks()
      }

      doer()
    }
  }, [user.currentUsername])

  const [prefetchedPages, setPrefetchedPages] = useState([])

  useEffect(() => {
    if (myNotebooks?.length) {
      const prefetchPages = 1
      const expectedLength =
        viewOptions.pageSize * (viewOptions.page + prefetchPages)

      if (expectedLength > myNotebooks.length) {
        const nextPage =
          Math.floor(myNotebooks.length / viewOptions.pageSize) + 1
        if (prefetchedPages.indexOf(nextPage) === -1) {
          loadMyNotebooks(nextPage)
          setPrefetchedPages((v) => [...v, nextPage])
        }
      }
    }
  }, [myNotebooks, viewOptions, prefetchedPages])

  const onViewOptionsChange = useCallback(
    (viewOptions) => {
      if (viewOptions.selectedView !== selectedView) {
        setSelectedView(viewOptions.selectedView)
      }
      setViewOption(viewOptions)
    },
    [viewOptions, selectedView]
  )

  return (
    <>
      <Row>
        <Col flex='auto' />
        <Col flex='1040px'>
          <Row gutter={{ sm: 16 }}>
            <Col xs={{ span: 0 }} sm={{ span: 6 }} md={{ span: 5 }}>
              <Affix offsetTop={56}>
                <Menu>
                  <Menu.Item icon={<HomeOutlined />}>Home</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item icon={<FileOutlined />}>Notebooks</Menu.Item>
                  <Menu.Item icon={<AntIconMDI path={mdiPackage} />}>
                    Packages
                  </Menu.Item>
                </Menu>
              </Affix>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 18 }} md={{ span: 19 }}>
              <NotebookBrowser
                selectedView={selectedView}
                data={viewOptions.search ? searchResults : myNotebooks}
                title='Your Notebooks'
                onChange={onViewOptionsChange}
                loading={isLoading}
                totalAvailable={
                  viewOptions.search
                    ? searchResults.length
                    : userStats?.notebooks || 0
                }
              />
            </Col>
          </Row>
        </Col>
        <Col flex='auto' />
      </Row>
    </>
  )
}

Notebooks.propTypes = {
  items: PropTypes.array
}

export default Notebooks
