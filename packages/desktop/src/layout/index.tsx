import { Breadcrumb, Dropdown, Layout, Menu } from 'antd'
import React, { useCallback, useMemo, useState } from 'react'

import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
  DownOutlined
} from '@ant-design/icons'
import DjitsuSymbol from '../components/djitsu-symbol';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme'
import Spinner from '../components/spinner';
import Header from './header';
import TitleBar from './title-bar';
import { useRecoilState } from 'recoil';
import { layoutState } from '../state/atoms/layout';



const { SubMenu } = Menu;
const { Content, Sider } = Layout;

export type DjitsuLayoutProps = {
  loading?: boolean
}

export const DjitsuLayout: React.FC<DjitsuLayoutProps> = (props) => {
  const { loading } = props
  const [layout, setLayout] = useRecoilState(layoutState)

  if (loading) return <StyledLoadingLayout>
    <TitleBar />
    <Content>
      <div className='brand'>
        <DjitsuSymbol />
      </div>
      <Spinner  />
      <div className='message'>
        Loading
      </div>
    </Content>
  </StyledLoadingLayout>

  return (
    <StyledLayout>
      <TitleBar />
      <Header />
      <Layout>
        {layout.sidebar && (

          <Sider width={200} className="site-layout-background">
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%', borderRight: 0 }}
            >
              <SubMenu key="sub1" icon={<UserOutlined />} title="subnav 1">
                <Menu.Item key="1">option1</Menu.Item>
                <Menu.Item key="2">option2</Menu.Item>
                <Menu.Item key="3">option3</Menu.Item>
                <Menu.Item key="4">option4</Menu.Item>
              </SubMenu>
              <SubMenu key="sub2" icon={<LaptopOutlined />} title="subnav 2">
                <Menu.Item key="5">option5</Menu.Item>
                <Menu.Item key="6">option6</Menu.Item>
                <Menu.Item key="7">option7</Menu.Item>
                <Menu.Item key="8">option8</Menu.Item>
              </SubMenu>
              <SubMenu key="sub3" icon={<NotificationOutlined />} title="subnav 3">
                <Menu.Item key="9">option9</Menu.Item>
                <Menu.Item key="10">option10</Menu.Item>
                <Menu.Item key="11">option11</Menu.Item>
                <Menu.Item key="12">option12</Menu.Item>
              </SubMenu>
            </Menu>
          </Sider>
        )}
        <Layout style={{ padding: layout.noPadding ? 0 : '0 24px 24px' }}>
          {layout.breadcrumbs && (
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>
          )}
          <Content
            className="site-layout-background"
            style={{
              padding: layout.noPadding ? 0 : 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {props.children}
          </Content>
        </Layout>
      </Layout>
    </StyledLayout>
  )
}

export const useLayoutState = () => {
  return useRecoilState(layoutState)
}

const StyledLayout = styled(Layout)`

  &.ant-layout {
    min-height: calc(100vh - 1px);
    > .ant-layout-content {
      /* border: 1px solid #FF00FF99; */
    }
  }
`

const StyledLoadingLayout = styled(StyledLayout)`
  &.ant-layout {
    > .ant-layout-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      > .brand {
        opacity: 0.1;
        transition: all 8000ms ease-in;
        font-family: var(--code-family);
        &:hover {
          opacity: 1;
        }
      }
      > [class^='impulse'] {
        margin: 24px;
      }
      > .message {
        font-size: 12px;
        opacity: 0.4;
        transition: all 800ms ease-in;
        font-family: var(--code-family);
        &:hover {
          opacity: 1;
        }
      }
    }
  }
`

export default DjitsuLayout
