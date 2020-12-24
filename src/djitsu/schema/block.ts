import { Timestamp } from './generics'

export interface BlockBase {
  type: BlockType
  meta: BlockMeta
  data: BlockData | unknown // Data used by the tool
  properties: BlockProperties
}

export type Block = BlockBase & (HeadingBlock | LiveCodeBlock)

export enum BlockType {
  LiveCode = 'dcode',
  Paragraph = 'paragraph',
  Heading = 'header'
}

interface BlockMeta {
  created: Timestamp
  updated: Timestamp

  version: BlockVersion
}

type BlockVersion = string

interface BlockData {
  [name: string]: unknown
}

type HeadingBlock = {
  type: BlockType.Heading
  data: HeadingBlockData
}

type HeadingBlockData = {
  text: string
  level: number
}

type LiveCodeBlock = {
  type: BlockType.LiveCode
  data: LiveCodeBlockData
}

interface LiveCodeBlockData {
  data: LiveCodeBlockDataData
  tool?: {
    options: Record<string, unknown>
    viewOptions: Record<string, unknown>
  }
}

type LiveCodeBlockDataData = {
  code: {
    code: string
    options?: Record<string, unknown>
  }
  demo: string
  preview?: string
}

interface BlockProperties {
  title: string
  name: string

  visible: boolean
  deleted: boolean

  options: BlockOptions
}

interface BlockOptions {
  [option: string]: string
}
