import { useEffect } from 'react'
import { useLayoutState } from '.'

export const useLayoutSettings = (settings) => {
  const [layout, setLayout] = useLayoutState()
  useEffect(() => {
    const preSettings = Object.entries(settings)
      .filter(([name, value]) => value !== layout[name])
      .reduce((acc, [name]) => ({ ...acc, [name]: layout[name]}), {})

    setLayout(settings)

    return () => {
      setLayout(preSettings)
    }
  }, [])
}
