import { EgrazeConfig } from "./types";

export default {
  plugins: [
    {
      plugin: require('./plugins/egraze-session').default,
      options: {
        main: require('../main-process').default
      }
    },
    'filesystem'
  ]
} as EgrazeConfig
