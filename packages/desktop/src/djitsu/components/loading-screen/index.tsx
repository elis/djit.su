import React from 'react'

import DjitsuSymbol from '../djitsu-symbol';
import styled from 'styled-components';
import Spinner from '../spinner';
import { SystemSpinner } from '../../schema/system';

export type LoadingScreenProps = {
  message?: string
  Message?: (props: any) => React.ReactElement
  spinner?: SystemSpinner
}

export const LoadingScreen: React.FC<LoadingScreenProps> = (props) => {
  const { Message, message, spinner } = props
  return (
    <StyledLoadingLayout>
      <div className='brand'>
        <DjitsuSymbol />
      </div>
      <div className='spinner'>
        <Spinner type={spinner} />
      </div>
      <div className='message'>
        {!Message && (message || 'Loading')}
        {!!Message && <Message />}
      </div>
    </StyledLoadingLayout>
  )
}

const StyledLoadingLayout = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > .brand {
    opacity: 0.1;
    transition: all 8000ms ease-in;
    font-family: var(--code-family);
    &:hover {
      opacity: 1;
    }
  }
  > .spinner {
    margin: 32px;
  }
  > .message {
    font-size: 12px;
    opacity: 0.4;
    transition: all 800ms ease-in;
    font-family: var(--code-family);
    &:hover {
      opacity: 1;
    }
  }
`

export default LoadingScreen
