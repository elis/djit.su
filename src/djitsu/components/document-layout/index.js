import React from 'react'
import styled from 'styled-components'

export const DocumentLayout = (props) => {
  return <StyledDocumentLayout>{props.children}</StyledDocumentLayout>
}

const StyledDocumentLayout = styled.article``

const Header = styled.header``
const Content = styled.main``

DocumentLayout.Header = Header
DocumentLayout.Content = Content

export default DocumentLayout
