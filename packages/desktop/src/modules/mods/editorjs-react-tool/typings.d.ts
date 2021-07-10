export type ToolContext = [ToolState, ToolActions]

export interface ToolState {
  views: ToolView[]
  options: ToolOptions
  viewOptions: ToolViewOptions
}

export type ToolView = {
  name: string
  details: Record<string, any>
  hidden: boolean
}

export type ToolOptions = Record<string, unknown>
export type ToolViewOptions = Record<string, unknown>

export interface ToolActions {
  setView: (name: string, details: Record<string, any>) => () => void
  toggleView: (name: string, show?: boolean) => void
  setBlockName: (newName: string) => void
}

export type ToolProviderProps = {
  value: ToolOptionsValue
  onChange: (options: ToolOptionsValue) => void
}

export type ToolOptionsValue = {
  options: ToolOptions
  viewOptions: ToolViewOptions
}

export type ToolViews = ToolView[]
