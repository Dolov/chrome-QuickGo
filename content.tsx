import React from 'react'
import { useOpenPage } from './utils'
import { useStorage } from "@plasmohq/storage/hook"

export interface contentProps {
  
}

const content: React.FC<contentProps> = props => {

  useOpenPage()
  const [_blank] = useStorage('a-target-blank')
  const blankRef = React.useRef(false)
  blankRef.current = _blank

  React.useEffect(() => {
    document.addEventListener('mouseover', event => {
      if (!blankRef.current) return
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
