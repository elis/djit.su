import { useState } from 'react'

export const useToggle = (initial: boolean) => {
  const [val, setVal] = useState(initial)
  const toggle = () => setVal((v) => !v)
  return [val, toggle, setVal]
}

export default useToggle
