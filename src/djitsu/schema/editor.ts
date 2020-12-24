import { BlockType } from './block'
import { Timestamp, Semver } from './generics'

export interface EditorDocument {
  blocks: EditorBlock[]
  version: Semver
}

export interface EditorBlock {
  type: BlockType
  data: EditorBlockData
  time: Timestamp
}

export interface EditorBlockData {
  [name: string]: unknown
}
