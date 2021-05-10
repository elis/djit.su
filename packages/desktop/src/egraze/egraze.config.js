export default {
  plugins: [
    'user-settings',
    {
      plugin: require('./plugins/egraze-session'),
      options: {
        main: require('../main-process')
      }
    },
    'filesystem'
  ]
}
