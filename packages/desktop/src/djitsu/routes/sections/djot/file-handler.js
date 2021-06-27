import { useMutation, useQuery, useQueryClient } from 'react-query'
import { plugin } from '../../../../egraze'

export const useFileHandler = ({ filePath }) => {
  const reader = useFileReader(filePath)
  const writer = useFileWriter(filePath)

  const setFileContents = fileData => {
    return writer.mutate(fileData)
  }

  const reload = () => {
    reader.refetch()
  }
  return {
    status: reader.status,
    data: reader.data,
    error: reader.error,
    isFetching: reader.isFetching,

    setFileContents,
    reload
  }
}

const useFileReader = filePath => {
  const fsp = plugin('filesystem')

  return useQuery(['file', filePath], () => fsp.readFile(filePath), {
    enabled: !!filePath,
    staleTime: Infinity
  })
}

const useFileWriter = filePath => {
  const queryClient = useQueryClient()

  const fileMutation = useMutation(
    newData => {
      const fsp = plugin('filesystem')
      return fsp.writeFile(filePath, newData)
    },
    {
      onSuccess: newData => {
        queryClient.setQueryData(['file', filePath], newData)
      }
    }
  )
  return fileMutation
}
