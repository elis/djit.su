import React, { useEffect, useMemo, useState } from 'react'
import graze from 'graze'
import { ssr } from 'djitsu/utils/ssr'
import { useNotebook } from 'djitsu/providers/notebook'
import { useCompile } from 'djitsu/providers/compile'
import { loaderMaker } from 'djitsu/compilers/javascript'
import withHydrationOnDemand from 'react-hydration-on-demand'
import { LoadingOutlined } from '@ant-design/icons'

export const NotebookPage = (props) => {
  const { importHandler, exported = 'Main' } = props
  const [, actions] = useNotebook()
  const [isLoading, setLoading] = useState(!ssr)
  const [compiledComp, setCompiledComp] = useState()
  const [forceReHydrate, setForceReHydrate] = useState()
  const [, { executeCode }] = useCompile()

  const loader = loaderMaker(importHandler)
  const [cancel, ssrNotebook] = graze.exposed.usePreload(
    async () => {
      try {
        console.log('Hostname:', props.hostname)
        const notebook = await actions.getNotebookByHostname(
          props.hostname + '.djit.me'
        )

        try {
          const exec = await notebookCompiler(notebook)

          return { notebook, exec }
        } catch (error) {
          console.log('exec error:', error)
          return { notebook, error }
        }
      } catch (error) {
        setLoading(false)
        console.log('no such notebook :(', error)
      }
    },
    6000,
    `noteboook-data-fetching-${props.hostname}`
  )

  useEffect(() => {
    return cancel
  }, [])

  const notebookCompiler = async (notebook) => {
    const exec = await executeCode(notebook.compiled.code, {
      imports: notebook.compiled.imports,
      loader
    })
    return exec
  }
  useEffect(() => {
    if (ssrNotebook?.notebook) {
      setCompiledComp()
      notebookCompiler(ssrNotebook.notebook)
        .then((exec) => {
          setCompiledComp(exec)
          setForceReHydrate(true)
          setLoading(false)
        })
        .catch((error) => {
          console.log('NOTEBOOK COMPILE ERROR', error)
        })
    }
  }, [ssrNotebook])

  const Comp = ssr ? ssrNotebook?.exec?.[exported] : compiledComp?.[exported]
  const Rekt = () => <>{Comp && <Comp />}</>

  const CardWithHydrationOnDemand = useMemo(
    () => withHydrationOnDemand()(Rekt),
    []
  )

  return (
    <>
      {/* Notebook Page: @{props.notebookUsername}/{props.notebookName}/
      {props.exported}
      <h2>SSR Notebook</h2>
      <pre>{JSON.stringify(ssrNotebook?.notebook, 1, 1)}</pre>
      <h2>Executed</h2>
      <pre>{JSON.stringify(ssrNotebook?.exec, 1, 1)}</pre>
      <h2>compiledComp</h2>
      <pre>{JSON.stringify({ compiledComp, forceReHydrate }, 1, 1)}</pre> */}
      {/* {ssr && Comp && <Comp />} */}
      {/* {!ssr && Comp} */}
      <div className='container'>
        {isLoading && <LoadingOutlined style={{ fontSize: 128 }} />}
        {!forceReHydrate ? (
          <CardWithHydrationOnDemand forceHydrate={!!compiledComp} />
        ) : (
          Comp && <Comp />
        )}
      </div>
    </>
  )
}

export default NotebookPage
