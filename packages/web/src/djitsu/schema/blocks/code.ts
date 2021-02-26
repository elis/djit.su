import { SupportedLanguages } from '../languages'
import { Timestamp } from '../generics'

export interface CodeBlock {
  input: string
  language: SupportedLanguages
  demos: CodeBlock[]
  tests: CodeBlock[]

  imports: CodeBlockImport[]
  exports: CodeBlockExports

  created: Timestamp
  updated: Timestamp
}

interface CodeBlockImport {
  source: ImportSource
  path: string | string[]
}

enum ImportSource {
  LocalNotebook = 'local-notebook', // the current document
  RemoteNotebook = 'remote-notebook',
  External = 'external',
  System = 'system'
}

interface CodeBlockExports {
  [exported: string]: CodeBlockExport
}

interface CodeBlockExport {
  type: CodeBlockExportType
  value: unknown
}

type CodeBlockExportType =
  | ExportTypeString
  | ExportTypeNumber
  | ExportTypeObject

type ExportTypeString = 'string'
type ExportTypeNumber = 'number'
type ExportTypeObject = 'number'
