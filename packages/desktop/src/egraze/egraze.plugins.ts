/* eslint-disable @typescript-eslint/no-use-before-define */
import chalk from 'chalk';
import {
  EgrazeFormattedPlugin,
  PluckedPluginPart,
  EgrazePluginConfig,
  EgrazePluginConfigOptions,
  EgrazePluginObject,
  EgrazePluginPart,
  PluckedPlugin,
} from './types';

const S = chalk`{bgBlack {yellow ⌬} }`;

export default function initEgrazePlugins(list: EgrazePluginConfig[]) {
  console.log(S, ' sup plugins', list);
  const plugins = getPlugins(list);
  // const plugins: any[] = []
  console.log(S, ' Plugins result:', plugins);

  const onReady = async (
    event: Electron.Event,
    info: Record<string, any>,
    app: Electron.App
  ) => {
    console.log(S, ' Ready go set!', { event, info });

    // const results = 'testing'
    const results = activatePlugins(plugins, 'main', 'onReady', [
      event,
      info,
      app,
    ]);
    console.log(S, ' Result of activating plugin', results, app);
  };

  return {
    onReady,
  };
}

// Array folding
// https://dev.to/mebble/learn-to-fold-your-js-arrays-2o8p
const fold = <T, Q>(
  reducer: (acc: T, iterable: Q) => T,
  init: T,
  xs: Q[]
): T => {
  let acc = init;
  for (const x of xs) {
    acc = reducer(acc, x);
  }
  return acc;
};

const getPlugins = (plugins: EgrazePluginConfig[]): PluckedPlugin[] =>
  fold(formatPlugins, [], plugins);

const formatPlugins = (acc: any, plugin: EgrazePluginConfig) => [
  ...acc,
  pluckPlugin(plugin),
];

const pluckPlugin = (plugin: EgrazePluginConfig): PluckedPlugin => {
  if (typeof plugin === 'string') {
    return [require(`./plugins/egraze-${plugin}`).default, {}];
  }
  if (typeof plugin === 'function') {
    const result = plugin();
    return result;
  }
  if (typeof plugin.plugin === 'string') {
    return [
      require(`./plugins/egraze-${plugin.plugin}`).default,
      plugin?.options ?? {},
    ];
  }

  return [plugin.plugin, plugin.options ?? {}];
};

// Fold plugins activation
const activatePlugins = (
  plugins: PluckedPlugin[],
  part: keyof EgrazePluginObject,
  what: keyof EgrazePluginPart,
  args: any[]
) => fold(onPlugin(what, args), [], getPlugin(plugins, part, what, args));

// Plugin activation reducer
const onPlugin = (what: keyof EgrazePluginPart, args: any[] = []) => (
  acc: EgrazeFormattedPlugin[],
  Plugin: EgrazeFormattedPlugin
) => [
  ...acc,
  {
    ...Plugin,
    fields: Plugin[what](Plugin.options, ...args),
  },
];

// Select plugins
const getPlugin = (
  plugins: PluckedPlugin[],
  part: keyof EgrazePluginObject,
  what: keyof EgrazePluginPart,
  args: any[]
) => fold(formatPlugin(part, what, args), [], getPluginPart(plugins, part));

// Plugin selector reducer
const formatPlugin = (
  part: keyof EgrazePluginObject,
  what: keyof EgrazePluginPart,
  args: any[]
) => (acc: any[], [value, options, root]: PluckedPluginPart) =>
  value && value[what]
    ? [
        ...acc,
        {
          [what]: value[what],
          [part]: value,
          options,
          root,
          args,
        },
      ]
    : acc;

// Fold plugins parts
const getPluginPart = (
  plugins: PluckedPlugin[],
  part: keyof EgrazePluginObject
) => fold(formatPluginsParts(part), [], plugins);

// Plugin parts reducer
const formatPluginsParts = (...parts: (keyof EgrazePluginObject)[]) => (
  acc: PluckedPluginPart[],
  [plugin, options]: PluckedPlugin
) => [
  ...fold(
    formatPluginPart(
      typeof plugin === 'function' ? plugin(options) : plugin,
      options
    ),
    acc,
    parts
  ),
];

// Plugin part plucker reducer
const formatPluginPart = (
  plugin: EgrazePluginObject,
  options: EgrazePluginConfigOptions
) => (
  acc: PluckedPluginPart[],
  part: keyof EgrazePluginObject
): PluckedPluginPart[] =>
  plugin && plugin[part]
    ? [...acc, [plugin[part], options, plugin] as PluckedPluginPart]
    : // ? [...acc, [plugin[part], options, plugin]]
      acc;
