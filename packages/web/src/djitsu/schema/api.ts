import { NotebookService } from './notebook'
import { AuthService } from './auth'
import { UserService } from './user'

export interface DjitsuAPI extends Partial<DjitsuServices> {
  initialize: (
    dv: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any,
    services: Partial<SupportedFeatures>
  ) => Promise<Partial<DjitsuServices>>
}

export type DjitsuOptions = SupportedFeatures

export interface SupportedFeatures {
  auth: boolean
  analytics: boolean
  user: boolean
  notebook: boolean
}

export interface DjitsuServices {
  auth: AuthService
  user: UserService
  Analytics: AnalyticsService
  notebook: NotebookService
}
export interface AnalyticsService {
  logEvent: (eventName: string, eventData: unknown) => Promise<void>
  pageView: (pathname: string, pageTitle: string) => Promise<void>
  setProperty: (property: string, value: unknown) => Promise<void>
  setProperties: (properties: Record<string, unknown>) => Promise<void>
  setUser: (properties: Record<string, unknown>) => Promise<void>
}
