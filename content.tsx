import React from 'react'
import { useOpenPage, useRediect } from './utils'
import { useStorage } from "@plasmohq/storage/hook"
import type { PlasmoCSConfig } from "plasmo"

 
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_start"
}

export interface contentProps {
  
}

const content: React.FC<contentProps> = props => {

  useRediect()
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
