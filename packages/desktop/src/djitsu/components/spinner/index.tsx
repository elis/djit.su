import React from 'react'
import styled from 'styled-components'
import { ImpulseSpinner, RotateSpinner } from 'react-spinners-kit'
import { SystemSpinner } from '../../schema/system'

export type SpinnerProps = {
  type?: SystemSpinner
}

export const Spinner: React.FC<SpinnerProps> = (props) => {
  return (
    props.type === SystemSpinner.Rotate
      ? <RotateSpinner
          size={30}
          color='var(--primary-4)'
        />
      : <ImpulseSpinner
          size={30}
          backColor='var(--primary-2)'
          frontColor='var(--primary-7)'
        />
  )
}

const StyledSpinner = styled(ImpulseSpinner)`
`

export default Spinner
