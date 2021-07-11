import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Badge, Grid } from 'antd'
import MDIcon from '@mdi/react'
import { mdiAlpha } from '@mdi/js'
import styled from 'styled-components'
import AntIcon from '@ant-design/icons'

const { useBreakpoint } = Grid

export const BrandButton = (props) => {
  const screens = useBreakpoint()
  return (
    <StyledButton
      key='brand'
      type='heads'
      size='small'
      className='logo'
      title='じつ'
      {...props}
    >
      <Link to='/'>
        <Badge
          status='processing'
          count={
            <AntIcon component={() => <MDIcon path={mdiAlpha} size={0.6} />} />
          }
        >
          <AntIcon component={() => '⟑'} />
        </Badge>
        {screens.sm && <em>djit.su - Modded by Rick</em>}
      </Link>
    </StyledButton>
  )
}

BrandButton.propTypes = {}

const StyledButton = styled(Button)`
  &.logo {
    line-height: 38px;
    display: flex;
    align-items: stretch;
    height: 100%;
    &,
    > a {
      color: ${({ themed }) =>
        themed === 'dark'
          ? 'rgba(243, 243, 243, 0.97)'
          : 'rgba(9, 9, 9, 0.97)'};
    }
    > a {
      height: 100%;
      display: flex;
      align-items: center;
      .ant-badge {
        .anticon.ant-scroll-number-custom-component {
          top: 12px;
        }
      }
    }
    > a > span {
      font-size: 30px;
      display: inline-block;
      margin-top: 1px;
      @media (min-width: 576px) {
        margin-top: -7px;
      }

      @media screen and (min-device-width: 1200px) and (max-device-width: 1600px) and (-webkit-min-device-pixel-ratio: 2) and (min-resolution: 192dpi) {
        margin-top: -7px;
      }
      @media screen and (-webkit-device-pixel-ratio: 4) and (orientation: landscape) {
        margin-top: 1px;
      }
    }
    > a > em {
      display: inline-block;
      font-style: normal;
      font-size: 14px;
      font-weight: 300;
      position: relative;
      margin-left: 0.5em;
    }
  }
`

export default BrandButton
