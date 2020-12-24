import React from 'react'
import { Alert } from 'antd'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log('Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Alert
          message='Error'
          description={`${this.state.error}`}
          type='error'
          showIcon
        />
      )
      // return <div className='error'></div><h1>Something went wrong.</h1>;
    }

    return this.props.children
  }
}

export default ErrorBoundary
