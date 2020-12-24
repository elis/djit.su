import { initialize as initializeFirebase } from 'djitsu/services/firebase'
import { AnalyticsService } from 'djitsu/schema/api'
import { AuthService } from 'djitsu/schema/auth'
import { UserService } from 'djitsu/schema/user'
import { NotebookService } from 'djitsu/schema/notebook'

import { analytics } from './services/analytics.service'
import { auth } from './services/auth.service'
import { notebook } from './services/notebook.service'
import { user } from './services/user.service'

export const initialize = async (dv: string): Promise<Partial<Services>> => {
  const result = await initializeFirebase(dv)

  const available = {
    ...(result.auth ? { auth } : {}),
    ...(result.analytics ? { analytics } : {}),
    ...(result.firestore ? { notebook, user } : {})
  }

  return available
}

interface Services {
  auth: AuthService
  analytics: AnalyticsService
  notebook: NotebookService
  user: UserService
}

export { analytics, auth, notebook, user }
