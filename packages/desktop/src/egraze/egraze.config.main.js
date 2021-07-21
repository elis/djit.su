export default {
  plugins: [
    {
      plugin: require('./plugins/egraze-develop')
    },
    {
      plugin: require('./plugins/egraze-filesystem')
    },
    {
      plugin: require('./plugins/egraze-user-settings')
    },
    {
      plugin: require('./plugins/egraze-theme')
    },
    {
      plugin: require('./plugins/egraze-session'),
      options: {
        main: require('../main-process')
      }
    },
    {
      plugin: require('./plugins/egraze-notebooks')
    }
  ]
}
