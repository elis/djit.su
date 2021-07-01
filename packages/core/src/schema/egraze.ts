export type PluginBaseAPI = {
  [key: string]: unknown
}

export type PluginAPI<T> = PluginBaseAPI | T
