import { useEffect, useState } from 'react'
import { useLayoutState } from '.'

export const useLayoutSettings = settings => {
  const [layout, setLayout] = useLayoutState()

  useEffect(() => {
    const preSettings = Object.entries(settings)
      .filter(([name, value]) => value !== layout[name])
      .reduce((acc, [name]) => ({ ...acc, [name]: layout[name] }), {})

    return () => {
      setLayout(preSettings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const newSettings = Object.entries(settings)
      .filter(([name, value]) => value !== layout[name])
      .reduce((acc, [name]) => ({ ...acc, [name]: layout[name] }), {})

    if (Object.keys(newSettings).length) {
      setLayout(settings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, layout])

  return 'Come on!'
}
