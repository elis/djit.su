import React from 'react'
import { StoreWrapper } from 'djitsu/store'
import Djitsu from 'djitsu'

export const DjitsuApp = () => {
  return (
    <StoreWrapper>
      <Djitsu />
    </StoreWrapper>
  )
}

export default DjitsuApp
