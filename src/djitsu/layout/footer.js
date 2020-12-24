import React from 'react'
import { Layout, Divider, Space, Popover, List } from 'antd'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { ssr } from 'djitsu/utils/ssr'
import AntIcon, { HeartTwoTone } from '@ant-design/icons'

import Icon from '@mdi/react'
import {
  mdiLanguageJavascript,
  mdiLanguageHtml5,
  mdiFirebase,
  mdiGithub,
  mdiNpm,
  mdiReact,
  mdiUnicode
} from '@mdi/js'
import CodeshipIcon from './components/codeship'

export const Footer = () => {
  const {
    RAZZLE_VERSION: appVersion,
    RAZZLE_HASH: commitHash,
    RAZZLE_SHORT_HASH: shortHash,
    RAZZLE_BUILD_URL: buildUrl,
    RAZZLE_BUILD_NUMBER: buildNumber,
    RAZZLE_CI: ciName,
    npm_package_ciBuildNumber,
    npm_package_ciBuildUrl,
    npm_package_ciName
  } = ssr ? process.env : window.env

  return (
    <StyledFooter>
      <div className='vb'>
        <div className='brand'>
          <Link
            to='/'
            className='symbol'
            title={`And with Dot — Djitsu's symbol / icon`}
          >
            ⟑
          </Link>
          <Link
            to='/'
            className='wordmark'
            title={`Djitsu — as in "I Know Djitsu!" 🥋`}
          >
            djitsu
          </Link>
        </div>
        <Divider orientation='center' className='h'>
          <HeartTwoTone style={{ fontSize: 10 }} twoToneColor='#FF4D00' />
        </Divider>

        <div className='version'>
          <Space>
            <Popover
              title='Build Details'
              getPopupContainer={() =>
                document.getElementsByClassName('djs-theme')[0]
              }
              content={
                <>
                  <List size='small'>
                    <List.Item key='version-v' extra='Version'>
                      {appVersion}
                    </List.Item>
                    <List.Item key='version-b' extra='Build URL'>
                      {buildUrl}
                    </List.Item>
                    <List.Item key='version-n' extra='Build Number'>
                      {buildNumber}
                    </List.Item>
                  </List>
                </>
              }
            >
              <a
                href={`https://github.com/elis/djitsu/releases/tag/v${appVersion}`}
                className='v'
              >
                v{appVersion}
              </a>
            </Popover>
            <Icon
              title='Javascript'
              path={mdiLanguageJavascript}
              size={0.5}
              color={'#CCC'}
            />
            <Icon
              title='HTML5'
              path={mdiLanguageHtml5}
              size={0.5}
              color={'#CCC'}
            />
            <Icon title='Unicode' path={mdiUnicode} size={0.5} color={'#CCC'} />
            <Icon
              title='Firebase'
              path={mdiFirebase}
              size={0.5}
              color={'#CCC'}
            />
            <Icon
              title='React'
              path={mdiReact}
              size={0.5}
              color={'#CCC'}
              spin={3.14 * 3.14}
            />
            <Icon title='Github' path={mdiGithub} size={0.5} color={'#CCC'} />
            <Icon title='NPM' path={mdiNpm} size={0.5} color={'#CCC'} />
            {(ciName || npm_package_ciName) && (
              <a
                href={buildUrl || npm_package_ciBuildUrl}
                className='icn'
                title={`Build #${buildNumber || npm_package_ciBuildNumber}`}
              >
                <AntIcon
                  component={CodeshipIcon}
                  style={{ color: '#CCC', height: '0.75rem' }}
                />
              </a>
            )}
            <a
              href={`https://github.com/elis/djitsu/commit/${commitHash}`}
              className='h'
            >
              #{shortHash}
            </a>
          </Space>
        </div>
      </div>
    </StyledFooter>
  )
}

const StyledFooter = styled(Layout.Footer)`
  &.ant-layout-footer {
    background: var(--background-color);
    padding: 32px 12px;
    display: flex;
    justify-content: center;
    opacity: 0.4;
    transition: opacity 120ms ease-in-out;
    a {
      color: var(--chart-neutral);
      transition: opacity 120ms ease-in-out;
      &:not(.icn) {
        opacity: 0.4;
      }
      &.icn {
        display: inline-flex;
        cursor: default;
      }
      &:hover {
        color: var(--primary-color);
        opacity: 1;
      }
    }
    > .vb {
      display: flex;
      flex-direction: column;
      justify-content: center;
      > .brand {
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        > .symbol {
          font-size: 40px;
          // opacity: 0.3;
          line-height: 32px;
        }
        > .wordmark {
          font-size: 12px;
          font-family: monospace;
        }
      }
      > .version {
        font-size: 11px;
        font-family: monospace;
        .ant-space-item {
          display: flex;
          align-items: center;
        }
      }
    }

    .ant-divider.ant-divider-horizontal {
      margin: 10px 0;
      &::before,
      &::after {
        top: 0;
      }
      &.h {
        .anticon {
          color: var(--background-color);
          path[fill='#fff1e6'] {
            transition: all 1s ease-out;
            fill: var(--background-color);
          }
        }
      }
    }
    &:hover {
      opacity: 1;
      .ant-divider.ant-divider-horizontal {
        &.h {
          .anticon {
            path[fill='#fff1e6'] {
              fill: #ff4d00cc;
              animation: heartbeat 1s infinite;
            }
          }
        }
      }
    }
  }

  @keyframes heartbeat {
    0% {
      opacity: 0.75;
    }
    20% {
      opacity: 1;
    }
    40% {
      opacity: 0.75;
    }
    60% {
      opacity: 1;
    }
    80% {
      opacity: 0.75;
    }
    100% {
      opacity: 0.75;
    }
  }
`

export default Footer
