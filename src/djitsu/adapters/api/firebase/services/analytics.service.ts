import { AnalyticsService } from 'djitsu/schema/api'

const voided = async (): Promise<void> => {
  console.log('voided')
}

export const analytics: AnalyticsService = {
  logEvent: voided,
  pageView: voided,
  setProperties: voided,
  setProperty: voided,
  setUser: voided
}
