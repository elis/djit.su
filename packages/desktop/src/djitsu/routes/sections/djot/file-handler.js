import { useMutation, useQuery, useQueryClient } from 'react-query'
import { plugin } from '../../../../egraze'

export const useFileHandler = ({ filePath }) => {
  const reader = useFileReader(filePath)
  const writer = useFileWriter(filePath)

  const saveFileAs = fileData => writer.saveAs(fileData)

  const setFileContents = fileData => {
    return writer.mutate({ fileData })
  }

  const reload = () => {
    reader.refetch()
  }
  return {
    filePath,
    status: reader.status,
    data: reader.data,
    error: reader.error,
    isFetching: reader.isFetching,

    setFileContents,
    saveFileAs,
    reload
  }
}

const useFileReader = filePath => {
  const fsp = plugin('filesystem')

  return useQuery(
    ['file', filePath],
    () => (filePath !== 'untitiled' ? fsp.readFile(filePath) : ''),
    {
      enabled: !!filePath,
      staleTime: Infinity
    }
  )
}

const useFileWriter = filePath => {
  const fsp = plugin('filesystem')
  const queryClient = useQueryClient()

  const fileMutation = useMutation(
    ({ fileData, filePath: newPath }) => {
      return fsp.writeFile(newPath || filePath, fileData)
    },
    {
      onSuccess: newData => {
        queryClient.setQueryData(['file', filePath], newData)
      }
    }
  )

  const saveAs = async newData => {
    const newPath = await fsp.selectFileLocation(
      filePath !== 'untitled' && filePath
    )
    if (newPath.filePath && !newPath?.canceled) {
      await fsp.writeFile(newPath.filePath, newData)
      queryClient.setQueryData(['file', newPath.filePath], newData)
      if (filePath === 'untitled') {
        queryClient.setQueryData(['file', filePath], '')
      }
      return newPath.filePath
    }
  }

  return {
    ...fileMutation,
    saveAs
  }
}
