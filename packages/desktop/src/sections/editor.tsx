import React from 'react'
import styled from 'styled-components'
import { MyEditor } from '@djitsu/editor'

export const DjitsuEditor: React.FC = () => {
  return (<Container>
    <MyEditor />
  </Container>)
}

const Container = styled.div`
  /* width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap; */
`

export default DjitsuEditor
