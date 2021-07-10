import React, { useCallback, useEffect, useRef, useState } from 'react'
import Editor, { loader, useMonaco } from '@monaco-editor/react'
import Monaco from 'monaco-editor'
import { merge } from 'lodash'
import { useThrottle } from 'ahooks'
import { useTheme } from '../../theme'

interface MonacoEditorProps extends React.FC {
  code?: string
  onSave?: (newContents: string) => void
  onSaveAs?: (newContents: string) => void
  onMount?: (editor: Monaco.editor.IEditor) => void
  onScroll?: (scrollEvent: Monaco.IScrollEvent) => void
  options: Monaco.editor.IStandaloneEditorConstructionOptions
}

const BASE_CODE = `// Welcome to Djitsu
import React from 'react'

export const Main = (props) => {
  return (
    <div>
      <h3>THIS</h3>
      <h2>IS</h2>
      <h1>AWESOME</h1>
    </div>
  )
}

<Main />;
3 + 2;
123 + 321;


`

export const MonacoEditor: React.FC<MonacoEditorProps> = props => {
  // const tt = useTheme()
  // console.log('🕋', 'My Props:', props)
  // console.log('🕋', 'useTheme:', tt)
  // return (<>😒</>)

  const [themeState] = useTheme()
  const [loaded, setLoaded] = useState(false)
  const defaultProps = {
    height: 'var(--editor-height)',
    theme: themeState.theme,
    defaultLanguage: 'javascript',
    defaultValue: props.code,
    path: './src/main.jsx',
    options: {
      lineNumbersMinChars: 2,
      minimap: {
        enabled: false,
        side: 'left',
        renderCharacters: false
      }

      // Tried wordwrapping - its breaking the result output
      // wordWrap: 'on',
      // wordWrapMinified: true,
      // wrappingIndent: 'indent'
    }
  }
  const userProps = merge(defaultProps, props)

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>()
  const [offset, setOffset] = useState({})
  const offsetValue = useThrottle(offset, { wait: 500 })

  const monaco = useMonaco()

  const onDidScroll = useCallback(scrollEvent => {
    userProps.onScroll?.(scrollEvent)
  }, [])

  const onEditorMounted = useCallback(editor => {
    editorRef.current = editor
    if (userProps.onMount) userProps.onMount(editor)
  }, [])

  // Subscribe to monaco editor scroll event
  useEffect(() => {
    if (monaco?.editor)
      monaco.editor.onDidCreateEditor(codeEditor => {
        codeEditor.onDidScrollChange(onDidScroll)
      })
  }, [editorRef.current, monaco])

  const [keybound, setKyebound] = useState(false)

  useEffect(() => {
    const editor = editorRef.current
    if (!keybound && monaco?.editor && editor) {
      editor.addAction({
        // An unique identifier of the contributed action.
        id: 'save',

        // A label of the action that will be presented to the user.
        label: 'Save File',

        // An optional array of keybindings for the action.
        keybindings: [
          // eslint-disable-next-line no-bitwise
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
          // chord
          // monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_M)
        ],

        // A precondition for this action.
        precondition: undefined,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: undefined,

        contextMenuGroupId: 'navigation',

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convinience
        run: async ed => {
          console.log(`save me => ${ed.getPosition()}`, ed)
          const model = ed.getModel()
          const value = model?.getValue()
          props.onSave?.(value || '')
        }
      })
      editor.addAction({
        // An unique identifier of the contributed action.
        id: 'save-as',

        // A label of the action that will be presented to the user.
        label: 'Save File As',

        // An optional array of keybindings for the action.
        keybindings: [
          // eslint-disable-next-line no-bitwise
          monaco.KeyMod.Shift | monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
          // chord
          // monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_M)
        ],

        // A precondition for this action.
        precondition: undefined,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: undefined,

        contextMenuGroupId: 'navigation',

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convinience
        run: async ed => {
          console.log(`save me as => ${ed.getPosition()}`, ed)
          const model = ed.getModel()
          const value = model?.getValue()
          props.onSaveAs?.(value || '')
        }
      })

      editor.addAction({
        // An unique identifier of the contributed action.
        id: 'run',

        // A label of the action that will be presented to the user.
        label: 'Run Code',

        // An optional array of keybindings for the action.
        keybindings: [
          // eslint-disable-next-line no-bitwise
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
          // chord
          // monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_M)
        ],

        // A precondition for this action.
        precondition: undefined,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: undefined,

        contextMenuGroupId: 'navigation',

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convinience
        run: async ed => {
          console.log(`Run Code! => ${ed.getPosition()}`)
        }
      })
      editor.addAction({
        // An unique identifier of the contributed action.
        id: 'run-line',

        // A label of the action that will be presented to the user.
        label: 'Run Line',

        // An optional array of keybindings for the action.
        keybindings: [
          // eslint-disable-next-line no-bitwise
          monaco.KeyMod.Alt | monaco.KeyCode.Enter
          // chord
          // monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_M)
        ],

        // A precondition for this action.
        precondition: undefined,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: undefined,

        contextMenuGroupId: 'navigation',

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convinience
        run: async ed => {
          console.log(`Run Line! => ${ed.getPosition()}`)
        }
      })

      console.log('Bound')
      setKyebound(true)
    }
  }, [monaco, editorRef.current, keybound])

  useEffect(() => {
    loadTheme(userProps.theme)
      .then(() => setLoaded(true))
      .catch(() => {})
  }, [userProps.theme])

  return loaded ? (
    <Editor {...userProps} onMount={onEditorMounted} />
  ) : (
    <div>Loading...</div>
  )
}

const loadTheme = (() => {
  let jsxConfigured = true
  const loaded: Record<string, boolean> = {}
  const availableThemes = require('../../../dist/themes/themes.json')

  return async (theme: string) => {
    if (!loaded[theme]) {
      configPaths()
      if (theme in availableThemes) {
        const themeJson = require(`../../../dist/themes/monaco/${theme}.json`)

        await loader.init().then(monaco => {
          if (!jsxConfigured) {
            configureJSX(monaco)
            jsxConfigured = true
          }
          monaco.editor.defineTheme(theme, themeJson)
          loaded[theme] = true
        })
      }
    }
  }
})()

const configureJSX = (monaco: typeof Monaco) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ['node_modules/@types'],
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'JSXAlone.createElement'
  })
}

const configPaths = () =>
  loader.config({
    paths: {
      vs: uriFromPath(require('path').join(__dirname, 'dist/vs'))
    }
  })

function ensureFirstBackSlash(str: string) {
  return str.length > 0 && str.charAt(0) !== '/' ? `/${str}` : str
}

function uriFromPath(_path: string) {
  const pathName = require('path').resolve(_path).replace(/\\/g, '/')
  return encodeURI(`file://${ensureFirstBackSlash(pathName)}`)
}

export default MonacoEditor
