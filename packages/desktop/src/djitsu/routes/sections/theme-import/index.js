import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useMonaco } from '@monaco-editor/react'
import MonacoEditor from '../../../components/monaco-editor'
import Dropzone from 'react-dropzone'
import { Button, Divider } from 'antd'
import { useTheme } from '../../../../djitsu/theme'
import { ConsoleSqlOutlined } from '@ant-design/icons'

const Wrap = styled.div`
  transition: all 0.25s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 99%;
  align-items: center;
  justify-content: space-between;
  .dropzone {
    height: 15vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: ${props =>
      props.isDark ? '3px dashed white' : '3px dashed black'};
    color: white;
    padding: 100px 10px;
    width: 100%;

    div {
      display: flex;
      align-items: center;
      flex-direction: column;
    }
  }

  textarea {
    resize: none;
    height: 20vh;
    width: 20vw;
  }
`

export default function ThemeImporter() {
  const editorRef = useRef()
  const monaco = useMonaco()
  const dropzoneRef = useRef()
  const theme = useTheme()
  const [isDark, setIsDark] = useState(true)

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }

  function updateTheme() {
    if (monaco && editorRef.current) {
      try {
        monaco.editor.defineTheme(
          'my-theme',
          JSON.parse(editorJsonRef.current.value)
        )
        setError(null)
      } catch (error) {
        console.log(error)
        setError(error)
      }

      monaco.editor.setTheme('my-theme')
    }
  }

  useEffect(() => {
    const themeNow = theme[0].theme
    const themes = theme[0].availableThemes
    let isDark
    themes.forEach(item => {
      const name = item.name
      if (name === themeNow) {
        isDark = item.isDark
      }
    })
    setIsDark(isDark)
  }, [theme])

  function acceptFile(file) {
    console.log(file)
    dropzoneRef.current.style.opacity = '1'
    file.forEach(file => {
      var fr = new FileReader()
      let read
      fr.onload = function (e) {
        // console.log(e.target.result);
        read = e.target.result
        console.log({ read })
      }
      fr.readAsText(file)
    })
  }

  const myValue = `// comments \n text \n const x = 55 \n const re = \`/^(([^<>()[\\]\\.,;:\\s@"]+(\\\` let You = \`Hello \$\{world\}\` \n import React from 'react'\n const Main=()=>{\n  return <>\n     <h1>Hello World</h1>\n </>\n}`

  return (
    <Wrap id="Import-Theme-Wrap" isDark={isDark}>
      <h3>Import New Theme</h3>
      <Divider plain>Import Theme Via JSON</Divider>
      <Dropzone
        onDragEnter={() => (dropzoneRef.current.style.opacity = '0.2')}
        onDragLeave={() => (dropzoneRef.current.style.opacity = '1')}
        onDrop={acceptedFiles => acceptFile(acceptedFiles)}
      >
        {({ getRootProps, getInputProps }) => (
          <div className="dropzone" {...getRootProps()}>
            <section ref={dropzoneRef}>
              <div>
                <input {...getInputProps()} />
                <h3>Drag and drop your theme's json file here ... or</h3>
                <Button type="primary">Import Json File</Button>
              </div>
            </section>
          </div>
        )}
      </Dropzone>
      <Divider plain>Preview</Divider>
      <MonacoEditor
        onMount={handleEditorDidMount}
        height="25vh"
        width="100%"
        defaultLanguage="javascript"
        defaultValue={myValue}
      />
    </Wrap>
  )
}
