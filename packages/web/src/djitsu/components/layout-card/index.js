import React from 'react'
import styled from 'styled-components'
import { Layout, PageHeader } from 'antd'

export const LayoutCard = (props) => {
  const { header, title, headerContent, headerExtra } = props
  return (
    <CardedLayout>
      {!header && (
        <Layout.Header>
          <PageHeader title={title} extra={headerExtra}>
            <>{headerContent}</>
          </PageHeader>
        </Layout.Header>
      )}
      {!!header && header}
      <Layout.Content>{props.children}</Layout.Content>
    </CardedLayout>
  )
}

const CardedLayout = styled(Layout)`
  &.ant-layout {
    > .ant-layout-header {
      padding: 0;
      height: auto;
      line-height: inherit;
      > .ant-page-header {
        padding: 0;
        .ant-page-header-heading-extra {
          display: flex;
          align-items: center;
        }
      }
    }
  }
  .djs-theme[class~='djs-theme'] &.ant-layout {
    background: #f0f;
    background: var(--tool-background-color);
    border-radius: 12px;
    box-shadow: var(--shadow-e3);
    padding: 8px 12px;
    @media screen and (max-width: 570px) {
      padding: 8px 8px;
    }
    > .ant-layout-header,
    > .ant-layout-footer {
      background: transparent;
    }
  }
`
export default LayoutCard
