import html2canvas from 'html2canvas'

const fileType = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  PDF: 'application/pdf'
}
/**
 * @param  {string} uri
 * @param  {string} filename
 */
export const saveAs = (uri, filename) => {
  const link = document.createElement('a')

  if (typeof link.download === 'string') {
    link.href = uri
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    window.open(uri)
  }
}

/**
 * @param  {React.RefObject} node
 */
export const exportComponent = (node, options) => {
  try {
    const element = node
    return html2canvas(element, {
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      useCORS: true,
      ...(options || {})
    }).then((canvas) => {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve([canvas.toDataURL(fileType.PNG, 1.0), blob])
        })
      })
    })
  } catch (error) {
    return []
  }
}
/**
 * @param  {React.RefObject} node
 * @param  {string} fileName='component.png'
 * @param  {string} backgroundColor=null
 * @param  {string} type=fileType.PNG
 */
const exportComponentAsPNG = (
  node,
  fileName = 'component.png',
  backgroundColor = null,
  type = fileType.PNG
) => {
  exportComponent(node, fileName, backgroundColor, type)
}
/**
 * @param  {React.RefObject} node
 * @param  {string} fileName='component.jpeg'
 * @param  {string} backgroundColor=null
 * @param  {string} type=fileType.JPEG
 */
const exportComponentAsJPEG = (
  node,
  fileName = 'component.jpeg',
  backgroundColor = null,
  type = fileType.JPEG
) => {
  exportComponent(node, fileName, backgroundColor, type)
}
/**
 * @param  {React.RefObject} node
 * @param  {string} fileName='component.pdf'
 * @param  {string} backgroundColor=null
 * @param  {string} type=fileType.PDF
 */
const exportComponentAsPDF = (
  node,
  fileName = 'component.pdf',
  backgroundColor = null,
  type = fileType.PDF
) => {
  exportComponent(node, fileName, backgroundColor, type)
}

export { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG }
