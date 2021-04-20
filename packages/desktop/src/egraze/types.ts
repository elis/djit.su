// export type EgrazePluginConfigEntry = {
//   plugin: EgrazePlugin | string,
//   options?: EgrazePluginOptions
// }

// export type EgrazePluginOptions = Record<string, any>

// export type EgrazePluginsList = (EgrazePluginConfigEntry | string)[]

// export type EgrazePlugin = {
//   main: EgrazePluginMain
// }

// export type EgrazePluginMain = {
//   onReady: (options: Record<string, any>) => void
// }

// export type EgrazePluginSection = EgrazePluginMain

// export type EgrazeConfig = {
//   plugins: EgrazePluginsList
// }

// export type FormattedPlugin = {
//   options: Record<string, any>
// }

// export type FormattedPluginPart = EgrazePlugin & {
//   fields: Record<string, any>
// }

/// /////////////
// New Types
/// /////////////

/// /////////////
// Config
/// /////////////

export interface EgrazeConfig {
  plugins: EgrazeConfigPluginsList;
}

export type EgrazeConfigPluginsList = EgrazePluginConfig[];

export type EgrazeModuleMainOnReady = (
  options: EgrazePluginConfigOptions
) => Promise<void> | void;

export type EgrazePluginModule = {
  main: EgrazePluginMain;
  renderer: EgrazePluginRenderer;
};

export type EgrazePluginConfigOptions = Record<string, any>;

export type EgrazePluginConfigString = string;
export type EgrazePluginConfigStringWithOptions = {
  plugin: EgrazePluginConfigString;
  options: EgrazePluginConfigOptions;
};
export type EgrazePluginConfigModule = {
  plugin: EgrazePlugin;
  options?: EgrazePluginConfigOptions;
};
export type EgrazePluginConfigFunction = (
  options?: EgrazePluginConfigOptions
) => PluckedPlugin;

export type EgrazePluginConfig =
  | EgrazePluginConfigString
  | EgrazePluginConfigStringWithOptions
  | EgrazePluginConfigModule
  | EgrazePluginConfigFunction;

/// ///////////
// Plugins
/// ///////////

export interface EgrazePluginObject {
  main?: EgrazePluginMain;
  renderer?: EgrazePluginRenderer;
}

export type EgrazePluginFunction = (
  options?: EgrazePluginConfigOptions
) => EgrazePluginObject;

export type EgrazePlugin = EgrazePluginObject | EgrazePluginFunction;

export interface EgrazePluginPartBase {
  partName?: keyof EgrazePluginModule;
}

export type EgrazePluginPart =
  | keyof EgrazePluginRenderer
  | keyof EgrazePluginMain;

export type FormattedPluginPart = [
  EgrazePluginPart,
  EgrazePluginConfigOptions,
  EgrazePluginObject
];

export type PluginPartKey = Partial<EgrazePluginPart>;
export type PlPlPl = keyof PluginPartKey;

/// ///////////
// Plugins / Main
/// ///////////

export interface EgrazePluginMain extends EgrazePluginPartBase {
  onReady: (options: Record<string, unknown>) => void;
}

/// ///////////
// Plugins / Renderer
/// ///////////

export interface EgrazePluginRenderer extends EgrazePluginPartBase {
  onOpen: (options: Record<string, any>) => void;
}

/// ///////////
// Plugins / Renderer
/// ///////////

export interface EgrazeFormattedPlugin {
  fields?: Record<string, any>;
  options?: Record<string, any>;
  root?: unknown;
  args?: any[];
  [extra: string]: any;
}

export type PluckedPlugin = [EgrazePlugin, EgrazePluginConfigOptions];
export type PluckedPluginPart = [
  EgrazePluginMain | EgrazePluginRenderer,
  EgrazePluginConfigOptions,
  EgrazePlugin
];
