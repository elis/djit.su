import React from 'react'
import styled from 'styled-components'
import { ImpulseSpinner } from 'react-spinners-kit'


export const Spinner: React.FC = (props) => {
  return (
    <ImpulseSpinner
      size={30}
      backColor='var(--primary-2)'
      frontColor='var(--primary-7)'
    />
  )
}

const StyledSpinner = styled(ImpulseSpinner)`
`

export default Spinner
