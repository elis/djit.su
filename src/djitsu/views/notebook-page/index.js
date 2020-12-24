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
        const notebook = await actions.getNotebookByName(
          props.notebookName,
          props.notebookUsername
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
    `noteboook-data-fetching-${props.notebookName}-${props.notebookUsername}-${exported}`
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
      <div className='container'>
        {!forceReHydrate ? (
          <CardWithHydrationOnDemand forceHydrate={!!compiledComp} />
        ) : (
          Comp && <Comp />
        )}
        {isLoading && <LoadingOutlined style={{ fontSize: 128 }} />}
      </div>
    </>
  )
}

export default NotebookPage
