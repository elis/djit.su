import plugins from 'graze/graze-plugins'

const DEBUG = false

const telemetryPlugins = Object.entries(plugins.exposed)
  .map(([name, plugin]) => [name, plugin, name.match(/^telemetry-(.*)$/)?.[1]])
  .filter(([, , tn]) => tn)
  .map(
    ([name, plugin, telemetryName]) =>
      ({
        name,
        telemetryName,
        plugin
      } as TelemetryPlugin)
  )

export interface TelemetryPlugin {
  name: keyof TelemetryAPI
  telemetryName: string
  plugin: TelemetryAPI
}

export interface TelemetryAPI {
  logEvent: typeof logEvent
  pageView: typeof pageView
  setProperty: typeof setProperty
  setProperties: typeof setProperties
  setUser: typeof setUser
}

const activateTelemtryPlugin = (name: string, argz: unknown[]) =>
  telemetryPlugins
    .filter(({ plugin }) => typeof plugin?.[name] === 'function')
    .map(({ plugin }) => plugin[name])
    .map((fn) => fn(...argz))

export const logEvent = async (
  eventName: string,
  eventData: EventData = {}
): Promise<void> => {
  DEBUG && console.log('📡 Sending telemetry event:', eventName, eventData)
  activateTelemtryPlugin('logEvent', [eventName, eventData])
}

export const pageView = async (
  pathname: string,
  pageTitle: string
): Promise<void> => {
  DEBUG && console.log('📡 Sending telemetry pageview:', pathname, pageTitle)
  activateTelemtryPlugin('pageView', [pathname, pageTitle])
}

export const setProperty = async (
  prop: string,
  value?: string | number | boolean | typeof Array
): Promise<void> => {
  DEBUG && console.log('📡 Set telemetry property:', prop, '=', value)
  activateTelemtryPlugin('setProperty', [prop, value])
}

export const setProperties = async (
  properties: Record<string, unknown>
): Promise<void> => {
  DEBUG && console.log('📡 Set telemetry properties:', properties)
  activateTelemtryPlugin('setProperties', [properties])
}

export const setUser = async (props: UserProperties): Promise<void> => {
  DEBUG && console.log('📡 Set telemetry user:', props)
  activateTelemtryPlugin('setUser', [props])
}

// * Types
//
// // // // // // // // // // // // // // // // // // // //
//
export interface UserProperties {
  id?: string
  username?: string
  email?: string
  ip_address?: string
}

export type TelemetryMethod = keyof TelemetryAPI

interface EventData {
  [name: string]: unknown
}
