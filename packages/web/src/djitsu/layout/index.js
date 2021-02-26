import React from 'react'
import PropTypes from 'prop-types'
import { Layout } from 'antd'
import styled from 'styled-components'
import Header from './header'
import Footer from './footer'
import LayoutWrapper, { useLayout } from './layout.context'

const { Content } = Layout

export const DjitsuLayoutWrapper = (props) => {
  return (
    <LayoutWrapper>
      <DjitsuLayoutInner {...props} />
    </LayoutWrapper>
  )
}

export const DjitsuLayoutInner = (props) => {
  const [state, actions] = useLayout()

  const { full, noHeader, center, className } = props

  return (
    <StyledLayout
      className={
        (className || '') + ' ' + (center ? 'center' : '') + (actions ? '' : '')
      }
    >
      {!state.options.full && !noHeader && !full && <Header />}
      <Content
        style={{
          // padding: '0 ' + screens.md ? '16px' : '8px',
          alignItems: center ? 'center' : 'flex-start'
        }}
      >
        {props.children}
      </Content>
      <Footer />
    </StyledLayout>
  )
}

DjitsuLayoutInner.propTypes = {
  full: PropTypes.bool,
  noHeader: PropTypes.bool
}
DjitsuLayoutWrapper.defaultProps = {
  full: false,
  noHeader: false
}

const StyledLayout = styled(Layout)`
  &.ant-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }
  > .ant-layout-header,
  > .ant-layout-footer {
    z-index: 20;
  }
  > .ant-layout-content {
    /* display: flex; */
    flex: 1 1 auto;
    box-sizing: content-box;
    z-index: 10;
    position: relative;
    /* flex-direction: column; */
    padding: var(--padding-md);
    max-width: calc(100vw - (var(--padding-md) * 2));
    @media screen and (max-width: 650px) {
      max-width: calc(100vw - (var(--padding-sm)));
      padding: var(--padding-sm) calc(var(--padding-sm) / 2);
      /* padding-right: var(--padding-sm) !important; */
    }
  }
  &.center {
    > .ant-layout-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
`
export default DjitsuLayoutWrapper
