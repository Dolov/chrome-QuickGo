import React from 'react'
import keyboardJS from 'keyboardjs'
import { useStorage } from "@plasmohq/storage/hook"

const formatCode = (code: string) => code.toLowerCase().replace(/\s/g, '')


export const useOpenPage = () => {
  const [storage] = useStorage('settings')
  const eventsRef = React.useRef({})

  React.useEffect(() => {
    if (!Array.isArray(storage)) return
    const { protocol, hostname } = location
    const newStorage = storage.filter(item => {
      const { url, code, enable, senior } = item
      const required = url && code && enable
      if (!required) return false
      const trigger = formatCode(senior?.trigger || "").split(",")
      if (!trigger) return true
      /** 认为是在当前的配置页面中 */
      if (protocol === "chrome-extension:") return true
      /** 简单认为符合条件 */
      return trigger.some(item => hostname.includes(item))
    })

    newStorage.forEach((item, index) => {
      const { code, url } = item
      if (!url) return
      if (!code) return
      eventsRef.current[index] = () => {
        window.open(url)
      }
      keyboardJS.bind(formatCode(code), eventsRef.current[index]);
    })
    return () => {
      newStorage.forEach((item, index) => {
        const { code } = item
        const handler = eventsRef.current[index]
        keyboardJS.unbind(formatCode(code), handler);
      })
      eventsRef.current = {}
    }
  }, [storage])

}
