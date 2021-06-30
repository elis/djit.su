import React from 'react'
import styled from 'styled-components'
import { MyEditor } from '@djitsu/editor'
import { useLayoutSettings } from '../../layout/hooks'

export const DjitsuEditor: React.FC = () => {
  useLayoutSettings({
    sidebar: false,
    breadcrumbs: false,
    noPadding: false
  })

  return (
    <Container>
      <MyEditor />
    </Container>
  )
}

const Container = styled.div``

export default DjitsuEditor
