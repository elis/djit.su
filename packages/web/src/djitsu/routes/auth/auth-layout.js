import React, { createContext, useContext, useState } from 'react'
import styled from 'styled-components'
import { Card } from 'antd'
import { Link } from 'react-router-dom'
import LoadingState from './auth-layout.loading'
import AuthStatus from './auth-layout.status'
import AuthResult from './auth-layout.result'
import useStates from 'djitsu/utils/hooks/use-states'

const AuthLayoutContext = createContext({})
export const useAuthLayoutContext = () => useContext(AuthLayoutContext)

export const AuthLayout = (props) => {
  const [loaderOptions, setLoaderOptions] = useStates({})
  const [error, setError] = useState()

  const { loading, form, noFooter } = props
  const ctx = [
    {
      loading,
      loaderOptions,
      error,
      form
    },
    {
      setLoaderOptions,
      setError
    }
  ]

  return (
    <AuthLayoutContext.Provider value={ctx}>
      <LoginContent>
        <Card
          hoverable
          className={`${props.loading ? 'rs-loading' : ''}`}
          cover={
            <TitleStyled>
              <h1>
                <span className='s'>⟑</span>
                <span className='w'>djitsu</span>
              </h1>
            </TitleStyled>
          }
        >
          <Card.Grid style={{ width: '100%' }} hoverable={false}>
            {props.children}
          </Card.Grid>
          {!noFooter &&
            (props.footer || (
              <Card.Grid style={{ width: '100%' }} hoverable={false}>
                <Link to='/'>Back home</Link>
              </Card.Grid>
            ))}
          {props.loading ? (
            <div className='loading-overlay'>{props.loading}</div>
          ) : null}
        </Card>
      </LoginContent>
    </AuthLayoutContext.Provider>
  )
}

const LoginContent = styled.section`
  --card-border-radius: 6px;
  --max-content-width: 360px;
  --max-card-width: 420px;
  --field-icon-opacity: 0.8;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  > .ant-card {
    border-radius: var(--card-border-radius);
    max-width: var(--max-card-width);
    &,
    > *,
    > * > * {
      transition: all 220ms ease-in-out;
    }
    @media screen and (max-width: 370px) {
      max-width: calc(100% - (var(--padding-sm) * 2));
    }
    width: 100%;
    &.ant-card-hoverable {
      cursor: default;
    }
    .ant-space.ant-space-vertical {
      width: 100%;
    }
    .ant-card-body {
      position: relative;
      .ant-card-grid {
        position: relative;
        z-index: 5;
        --pad: calc(var(--max-card-width) - var(--max-content-width));
        padding-left: var(--pad);
        padding-right: var(--pad);
        transition: all 120ms ease-in-out;
        @media screen and (max-width: 370px) {
          padding-left: var(--padding-sm);
          padding-right: var(--padding-sm);
        }
        h4 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
      }
    }
    &.rs-loading {
      .ant-card-body {
        > :not(.loading-overlay) {
          pointer-events: none;
          opacity: 0;
          transform: scale(0.01);
          height: 0;
          overflow: hidden;
        }
      }
    }

    .ant-divider {
      .anticon {
        color: var(--divider-color);
      }
    }

    .social {
      .ant-btn {
        text-align: left;
        font-weight: bold;
        .anticon {
          top: 1px;
          position: relative;
          svg {
            width: 18px;
            height: 18px;
          }
        }
      }
    }
  }
`

const TitleStyled = styled.div`
  position: relative;
  padding-left: 16px;
  /* // margin-bottom: 60px; */
  padding: 24px 0;
  background: var(--primary-color);
  border-radius: var(--card-border-radius) var(--card-border-radius) 0 0;
  /* // background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23ccdcf6' fill-opacity='0.59' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E"); */
  border-bottom: 7px solid var(--primary-color);

  /* // background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d5e0f2' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E"); */
  background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d5e0f2' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
  > h1 {
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    margin: 0;
    text-shadow: 0 0 6px rgba(233, 233, 233, 1), 0 0 12px rgba(66, 133, 244, 1),
      0 0 24px rgba(233, 233, 233, 1);
    > .s {
      font-size: 60px;
      font-family: serif;
      line-height: 44px;
      font-weight: normal;
    }
    > .w {
      font-family: monospace;
      font-weight: normal;
      font-size: 13px;
    }
  }
  x &::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--black);
    opacity: 0.6;
  }
`

AuthLayout.Loading = LoadingState
AuthLayout.Status = AuthStatus
AuthLayout.Result = AuthResult

export default AuthLayout
