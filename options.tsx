import React from 'react'
import { useStorage } from "@plasmohq/storage/hook"
import { List, message, Input, Button } from 'antd'
import { CopyFilled, DeleteFilled } from '@ant-design/icons'
import { useOpenPage } from './utils'

import './options.less'

export interface optionsProps {
  
}

interface ItemProps {
  code: string;
  url: string;
}

const defaultValue = [
  {
    code: "ctrl+shift+b",
    url: "https://baidu.com"
  }
]

const options: React.FC<optionsProps> = props => {
  const {  } = props
  useOpenPage()
  const [data, setData] = React.useState([])
  const [storage, setStorage] = useStorage('settings')

  React.useEffect(() => {
    if (Array.isArray(storage) && storage.length) {
      setData(storage)
      return
    }
    setData(defaultValue)
  }, [storage])

  const handleCopy = (item) => {
    const index = data.indexOf(item)
    data.splice(index, 0, {
      ...item,
    })
    setData([...data])
  }

  const handleDelete = (item) => {
    if (data.length === 1) return
    const newData = data.filter(a => a !== item)
    setData(newData)
  }

  const handleChange = (e, item, type) => {
    item[type] = e.target.value
    setData([...data])
  }

  const handleSave = () => {
    setStorage(data)
    message.success('保存成功')
  }

  return (
    <div className='options-container'>
      <header>
        <div className='title'>自定义打开页面的快捷键</div>
        <div className='desc'>快捷键请使用小写，组合键请使用 + 进行分割</div>
      </header>
      <main>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item: ItemProps) => (
            <List.Item
              actions={[
                <CopyFilled title="复制" onClick={() => handleCopy(item)} />,
                <DeleteFilled title="删除" onClick={() => handleDelete(item)} />
              ]}
            >
              <Input
                value={item.code}
                style={{ width: 300, marginRight: 16 }}
                placeholder='快捷键'
                onChange={e => handleChange(e, item, 'code')}
              />
              <Input
                value={item.url}
                placeholder='页面地址'
                onChange={e => handleChange(e, item, 'url')}
              />
            </List.Item>
          )}
        />
      </main>
      <footer>
        <Button onClick={handleSave} type="primary">保存</Button>
      </footer>
    </div>
  )
}

export default options
