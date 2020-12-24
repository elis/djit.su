import React, { useEffect } from 'react'
import { useAuthLayoutContext } from './auth-layout'

import { Result } from 'antd'

export const LoadingState = (props) => {
  const optionProps = {
    icon: props.icon,
    title: props.title,
    subTitle: props.subTitle,
    extra: props.extra,
    children: props.children
  }

  return (
    <Result
      className={
        'progress-report' + (props.className ? ' ' + props.className : '')
      }
      {...optionProps}
    />
  )
}

const LoaderOption = (option) => (props) => {
  const [, actions] = useAuthLayoutContext()

  useEffect(() => {
    actions.setLoaderOptions(option, props.children)
  }, [props.children])

  return null
}

LoadingState.Title = LoaderOption('title')
LoadingState.SubTitle = LoaderOption('subTitle')
LoadingState.Icon = LoaderOption('icon')
LoadingState.Extra = LoaderOption('extra')

export default LoadingState
