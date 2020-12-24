import React from 'react'
import Icon from '@mdi/react'
import AntIcon from '@ant-design/icons'

/**
 * @param {{ path: string }} props
 */
export const AntIconMDI = (props) => {
  const { path, ...rest } = props
  return (
    <AntIcon
      {...rest}
      component={() => <Icon path={path} color={'currentColor'} size={'1em'} />}
    />
  )
}

export default AntIconMDI
