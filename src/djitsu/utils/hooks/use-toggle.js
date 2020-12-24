import { useState } from 'react'

export const useToggle = (initial) => {
  const [val, setVal] = useState(initial)
  const toggle = () => setVal((v) => !v)
  return [val, toggle, setVal]
}

export default useToggle
