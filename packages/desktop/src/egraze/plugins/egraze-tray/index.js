import { plugin } from '../../egraze-plugins'

/** @type {import('../../egraze-plugins').MainPlugin} */
export const main = {
  init: () => {
    return {
      tray: null
    }
  },
  onReady: async (options, fields) => {
    const theme = plugin('theme')
    const path = require('path')
    const { Menu, Tray, nativeImage } = require('electron')

    const trayIcons = path.resolve(__dirname, '../../../../assets/icons/tray/')
    const icons = { dark: 'djot-light.png', light: 'djot-light.png' }
    const icon = icons[theme.isDarkMode() ? 'dark' : 'light']
    const tplIcon = 'djotTemplate.png'
    const icnsPath = path.join(trayIcons, tplIcon)

    const native = nativeImage.createFromPath(icnsPath)
    fields.tray = new Tray(native)

    fields.tray.on('right-click', () => {
      const contextMenu = Menu.buildFromTemplate([
        // { label: 'Item1', type: 'radio' },
        // { label: 'Item2', type: 'radio' },
        // { type: 'separator', checked: true },
        {
          label: 'About Djitsu Desktop',
          type: 'normal',
          role: 'about',
          icon: path.join(
            trayIcons,
            theme.isDarkMode() ? 'djitsu-dark.png' : 'djitsu-light.png'
          )
        }
      ])
      fields.tray.popUpContextMenu(contextMenu)
    })
    fields.tray.on('double-click', () => {})
    fields.tray.on('click', () => {})

    theme.onDarkModeChange(isDark => {
      const icon = icons[isDark ? 'dark' : 'light']
      fields.tray.setImage(path.join(trayIcons, icon))
    })
  }
}
