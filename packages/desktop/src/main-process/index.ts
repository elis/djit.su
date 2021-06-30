import { app } from 'electron';
import appEvents from './app-events'

export default function initMainProcess () {
  const events = Object.keys(appEvents)
  events.forEach((event: string) => appEvents[event](app))
}
