import React from 'react'
import { useOpenPage } from './utils'
import { useStorage } from "@plasmohq/storage/hook"
import type { PlasmoCSConfig } from "plasmo"

 
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_start"
}

export interface contentProps {
  
}

const hosts = [
  "link.juejin.cn",
  "link.zhihu.com"
]

const content: React.FC<contentProps> = props => {

  useOpenPage()
  const [google] = useStorage('auto-google')
  const [_blank] = useStorage('a-target-blank')
  const blankRef = React.useRef(false)
  blankRef.current = _blank

  /** 处理指定站点的安全跳转 */
  React.useEffect(() => {
    const { host, href } = location
    const url = new URL(href)
    const target = url.searchParams.get('target')
    if (!hosts.includes(host)) return
    if (!target) return
    location.href = target
  }, [])

  /** 是否在新的标签也打开页面 */
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
      // @ts-ignore
      event.target.setAttribute("QuickGo", "true")
    })
  }, [])

  /** 是否在自动替换百度为 google */
  React.useEffect(() => {
    if (!google) return
    const { href } = location
    if (href !== "https://www.baidu.com/") return
    location.href = "https://www.google.com/"
  }, [google])

  return null
}

export default content
