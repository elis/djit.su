import React, { useCallback, useEffect, useRef, useState } from 'react'
import Editor, { loader, useMonaco } from '@monaco-editor/react'
import Monaco from 'monaco-editor'
import { merge } from 'lodash'
import { useTheme } from '../../theme'
import { useThrottle } from 'ahooks'

interface MonacoEditorProps extends React.FC {
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
`

export const MonacoEditor: React.FC<MonacoEditorProps> = (props) => {
  const [themeState] = useTheme()
  const [loaded, setLoaded] = useState(false)
  const defaultProps = {
    height: '600px',
    theme: themeState.theme,
    defaultLanguage: 'javascript',
    defaultValue: BASE_CODE,
    path: './src/main.jsx',
    options: {
      lineNumbersMinChars: 2,
      minimap: {
        enabled: false,
        side: 'left',
        renderCharacters: false
      }
    }
  }
  const userProps = merge(defaultProps, props)

  const editorRef = useRef()
  const [offset, setOffset] = useState({})
  const offsetValue = useThrottle(offset, { wait: 500 })

  const monaco = useMonaco()

  const onDidScroll = useCallback((scrollEvent) => {
    userProps.onScroll?.(scrollEvent)
  }, [])

  const onEditorMounted = useCallback((editor) => {
    editorRef.current = editor
    if (userProps.onMount) userProps.onMount(editor)
  }, [])

  // Subscribe to monaco editor scroll event
  useEffect(() => {
    if (monaco?.editor)
      monaco.editor.onDidCreateEditor((codeEditor) => {
        codeEditor.onDidScrollChange(onDidScroll)
      })
  }, [editorRef.current, monaco])

  useEffect(() => {
    loadTheme(userProps.theme).then(() => setLoaded(true))
  }, [userProps.theme])

  return loaded
    ? <Editor {...userProps} onMount={onEditorMounted} />
    : <div>Loading...</div>
}

const loadTheme = (() => {
  let jsxConfigured = true
  const loaded: Record<string, boolean> = {}
  const availableThemes = require('../../dist/themes/themes.json')

  return async (theme: string) => {
    if (!loaded[theme]) {
      configPaths()
      if (theme in availableThemes) {
        const themeJson = require('../../dist/themes/monaco/' + theme + '.json')

        loader.init().then(monaco => {
          if (!jsxConfigured) {
            configureJSX(monaco)
            jsxConfigured = true
          }
          monaco.editor.defineTheme(theme, themeJson)
          loaded[theme] = true
        });
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
    typeRoots: ["node_modules/@types"],
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'JSXAlone.createElement',
  })

}

const configPaths = () => loader.config({
  paths: {
    vs: uriFromPath(
      require('path').join(__dirname, 'dist/vs')
    )
  }
})

function ensureFirstBackSlash(str: string) {
  return str.length > 0 && str.charAt(0) !== '/'
    ? '/' + str
    : str;
}

function uriFromPath(_path: string) {
  const pathName = require('path').resolve(_path).replace(/\\/g, '/');
  return encodeURI('file://' + ensureFirstBackSlash(pathName));
}


export default MonacoEditor