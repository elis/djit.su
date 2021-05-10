export const name = 'user-settings'

export const main = {
  init: (options, fields, app, config) => {
    console.log('⛵️ 🏰 User settings plugin loaded:', {
      options,
      fields,
      config
    })
  }
}
