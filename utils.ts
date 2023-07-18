import React from 'react'
import keyboardJS from 'keyboardjs'
import { useStorage } from "@plasmohq/storage/hook"


export const useOpenPage = () => {
  const [storage] = useStorage('settings')
  const eventsRef = React.useRef({})

  React.useEffect(() => {
    if (!Array.isArray(storage)) return
    const newStorage = storage.filter(item => item.url && item.code)
    newStorage.forEach((item, index) => {
      const { code, url } = item
      if (!url) return
      if (!code) return
      eventsRef.current[index] = () => {
        window.open(url)
      }
      keyboardJS.bind(code, eventsRef.current[index]);
    })
    return () => {
      newStorage.forEach((item, index) => {
        const { code } = item
        const handler = eventsRef.current[index]
        keyboardJS.unbind(code, handler);
      })
    }
  }, [storage])

}