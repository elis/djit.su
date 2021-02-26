import React, { useEffect } from 'react'
import EditorJSAdapter from 'djitsu/adapters/editorjs'
import { StyledEditor } from './shared'

import CompileProvider, { useCompile } from 'djitsu/providers/compile'
import { useTheme } from 'djitsu/theme'

import JavascriptCompiler from 'djitsu/compilers/javascript'
import MarkdownCompiler from 'djitsu/compilers/markdown'

const EditorJSComponent = () => {
  const [, { getTheme }] = useTheme()

  const [
    { data },
    {
      onChange,

      addErrorListener,
      addCompiledListener,
      runCode,
      runModules
    }
  ] = useCompile()

  const toolProps = {
    getTheme,
    addErrorListener,
    addCompiledListener,
    runCode,
    runModules
  }

  return (
    <StyledEditor>
      <EditorJSAdapter onChange={onChange} data={data} toolProps={toolProps} />
    </StyledEditor>
  )
}

export const DynamicRenderer = (props) => {
  const { data, onChange, importHandler } = props

  useEffect(() => {
    console.log('⎔⚙︎ Dynamic Renderer Loaded', { data })
  }, [])

  const compilers = [JavascriptCompiler, MarkdownCompiler]

  return (
    <CompileProvider
      data={data}
      loader={importHandler}
      compilers={compilers}
      onChange={onChange}
    >
      <EditorJSComponent />
    </CompileProvider>
  )
}

export default DynamicRenderer
