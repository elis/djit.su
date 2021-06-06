export enum DjotType {
  File = 'file'
}

export type DjotEditorState = {
  type?: DjotType
  path?: string
  status?: DjotStatus
}

export enum DjotStatus {
  Error = 'error',
  Loading = 'loading',
  Ready = 'ready',
  Saving = 'saving',
  Unavailable = 'unavailable'
}
