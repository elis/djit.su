export default {
  plugins: [
    {
      plugin: require('./plugins/egraze-develop'),
    },
    {
      plugin: require('./plugins/egraze-theme'),
      options: {
        example: 'usage of options'
      }
    },
    {
      plugin: require('./plugins/egraze-user-settings'),
    },
    {
      plugin: require('./plugins/egraze-session/renderer'),
      options: {}
    },
    {
      plugin: require('./plugins/egraze-filesystem')
    }
  ]
}
