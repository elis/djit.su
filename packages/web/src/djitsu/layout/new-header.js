import React from 'react'
import styled from 'styled-components'
import { Layout, Switch } from 'antd'
import { useTheme } from 'djitsu/theme'

export const Header = () => {
  const theme = useTheme()
  return (
    <StyledHeader>
      <a>Logo</a>
      <div>
        Theme Switcher
        <Switch
          onChange={() => theme[1].switchTheme()}
          checked={theme.theme === 'dark'}
        />
      </div>
    </StyledHeader>
  )
}

Header.propTypes = {}

const StyledHeader = styled(Layout.Header)``

export default Header
