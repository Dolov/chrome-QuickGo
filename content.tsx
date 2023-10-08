import React from 'react'
import { useOpenPage } from './utils'

export interface contentProps {
  
}

const content: React.FC<contentProps> = props => {

  useOpenPage()

  React.useEffect(() => {
    document.addEventListener('mouseover', event => {
      // @ts-ignore
      const tagName = (event.target.tagName as string).toLowerCase()
      if (tagName !== 'a') return
      // @ts-ignore
      const target = event.target.getAttribute("target")
      if (target === "_blank") return
      // @ts-ignore
      event.target.setAttribute("target", "_blank")
    })
  }, [])

  return null
}

export default content
