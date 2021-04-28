export default {
  plugins: [
    {
      plugin: require('./plugins/egraze-session'),
      options: {
        main: require('../main-process')
      }
    },
    'filesystem'
  ]
}
