import React from 'react'

type SymbolProps = {
  width?: number
  height?: number
  color?: string
  className?: string
  size?: number
}

export const DjitsuSymbol: React.FC<SymbolProps> = (props) => {
  const { size, width = size || 32, height, color = 'currentColor', className } = props
  return (<svg {...{width, height, className}} viewBox="0 0 1000 1001" fill="none">
    <path d="M585.822 182.787L197.251 1000.97H25.8906L499.534 0.525391L585.822 182.787Z" fill={color}/>
    <path d="M607.664 755.594C607.664 810.686 563.003 855.347 507.911 855.347C452.818 855.347 408.157 810.686 408.157 755.594C408.157 700.501 452.818 655.84 507.911 655.84C563.003 655.84 607.664 700.501 607.664 755.594Z" fill={color}/>
    <path d="M802.655 1001L524.741 415.817L611.029 233.556L974.361 1001H802.655Z" fill={color}/>
  </svg>
  )
}

export default DjitsuSymbol
