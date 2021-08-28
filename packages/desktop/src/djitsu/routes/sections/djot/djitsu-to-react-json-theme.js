import { useTheme } from '../../../theme/index'

export default function ReactJsonTheme() {
  const [themeInfo, themeActions] = useTheme()

  const themeJson = require(`../../../../dist/themes/${
    themeInfo.availableThemes.find(
      ({ name }) => name === themeActions.getTheme()
    ).monaco
  }`)

  const foreground = themeJson.colors['editor.foreground']

  const theme = {
    base00: 'transparent', // bg
    base01: 'transparent', // otherBg
    base02: 'pink', // Not sure, might come in debugging
    base03: 'red', // Not sure, might come in debugging
    base04: foreground, // # of items in array
    base05: 'yellow', // Not sure, might come in debugging
    base06: 'green', // Not sure, might come in debugging
    base07: foreground, // root: [
    base08: 'red', // Not sure, might come in debugging
    base09: foreground, // type and value in an object
    base0A: 'maroon', // Not sure, might come in debugging
    base0B: 'purple', // Not sure, might come in debugging
    base0C: foreground, // index in an array
    base0D: 'orange', // Not sure, might come in debugging
    base0E: 'white', // Not sure, might come in debugging
    base0F: foreground // type and value in an array
  }

  return theme
}
