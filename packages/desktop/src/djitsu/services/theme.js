import React from 'react'
import { useRecoilState } from 'recoil'
import { themeState } from '../state/atoms/theme'

export const ThemeService = ({ children }) => {
  const [state, setState] = useRecoilState(themeState)

  return <></>
}

export const useTheme = () => useRecoilState(themeState)
