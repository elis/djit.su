1. Configuration

```ts
const config = {
    plugins: [
      // String
      'plugin-name' as EgrazePluginConfigString,

      // OR
      // String with options
      {
        plugin: 'plugin-name', // => require('./plugins/egraze-' + 'plugin-name')
        options: { ... }
      } as EgrazePluginConfigStringWithOptions,

      // OR
      // Direct Module
      require('./plugins/egraze-session') as EgrazePluginConfigModule,

      // OR
      // Module with options
      {
        plugin: require('./plugins/egraze-session'),
        options: { ... }
      } as EgrazePluginConfigModuleWithOptions,

      // OR
      // Function
      (): EgrazePluginConfigModuleWithOptions => {} as EgrazePluginConfigFunction

    ]
  } as EgrazeConfig

export type EgrazePluginConfig =
  | EgrazePluginConfigString
  | EgrazePluginConfigStringWithOptions
  | EgrazePluginConfigModule
  | EgrazePluginConfigModuleWithOptions
  | EgrazePluginConfigFunction
```

2. Get Plugins

Build plugins flow from `config.plugins`.

```ts

const plugins = getPlugins(config.plugins: EgrazePluginConfig[]) =>
  EgrazePlugin[]
  // fold(formatPlugins, [], pluginsList)
plugins = [
  ...pluckPlugin(plugin: )
]

```
