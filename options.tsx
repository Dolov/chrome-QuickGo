import React from 'react'
import { useStorage } from "@plasmohq/storage/hook"
import { List, message, Input, Button, Switch, Tooltip, Modal, Form } from 'antd'
import { CopyFilled, DeleteFilled, SettingFilled } from '@ant-design/icons'
import { useOpenPage } from './utils'

import './options.less'

export interface optionsProps {

}

interface ItemProps {
  code: string;
  url: string;
  enable: boolean;
  senior?: Record<string, any>
}

const defaultValue = [
  {
    code: "ctrl+shift+b",
    url: "https://baidu.com",
    enable: true
  }
]

const options: React.FC<optionsProps> = props => {
  const { } = props
  useOpenPage()
  const [form] = Form.useForm();
  const [data, setData] = React.useState([])
  const [storage, setStorage] = useStorage('settings')
  const [aTarget, setaTarget] = useStorage('a-target-blank')
  const [currentItem, setCurrentItem] = React.useState(null)

  /** 初始化赋值 */
  React.useEffect(() => {
    if (Array.isArray(storage) && storage.length) {
      setData(storage)
      return
    }
    setData(defaultValue)
  }, [storage])

  /** 复制 */
  const handleCopy = (item: ItemProps) => {
    const index = data.indexOf(item)
    data.splice(index, 0, {
      ...item,
    })
    setData([...data])
  }

  /** 删除 */
  const handleDelete = (item: ItemProps) => {
    if (data.length === 1) return
    const newData = data.filter(a => a !== item)
    setData(newData)
  }

  /** 受控输入框 */
  const handleChange = (e, item, type) => {
    item[type] = e.target ? e.target.value: e
    setData([...data])
  }

  /** 保存 */
  const handleSave = () => {
    setStorage(data)
    message.success('保存成功')
  }

  /** 高级配置 */
  const handleSenior = (item: ItemProps) => {
    setCurrentItem(item)
    form.resetFields()
    form.setFieldsValue(item.senior)
  }

  /** 高级设置的保存 */
  const handleSeniorSave = () => {
    const values = form.getFieldsValue()
    currentItem.senior = values
    setStorage(data)
    setCurrentItem(null)
  }

  const open = !!currentItem

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
          renderItem={(item: ItemProps) => {
            const { enable, code, url } = item
            return (
              <List.Item
                actions={[
                  <Button title="复制" shape="circle" onClick={() => handleCopy(item)} icon={<CopyFilled />} />,
                  <Button title="高级" shape="circle" onClick={() => handleSenior(item)} icon={<SettingFilled />} />,
                  <Button title='删除' shape="circle" onClick={() => handleDelete(item)} icon={<DeleteFilled />} />,
                ]}
              >
                <Tooltip title="禁用">
                  <Switch onChange={e => handleChange(e, item, 'enable')} checked={enable} style={{ marginRight: 16 }} />
                </Tooltip>
                <Input
                  value={code}
                  style={{ width: 300, marginRight: 16 }}
                  placeholder='快捷键'
                  onChange={e => handleChange(e, item, 'code')}
                  disabled={!enable}
                />
                <Input
                  value={url}
                  placeholder='页面地址'
                  onChange={e => handleChange(e, item, 'url')}
                  disabled={!enable}
                />
              </List.Item>
            )
          }}
        />
      </main>
      <div>
        <span style={{ marginRight: 24 }}>超级链接始终打开新的标签页</span>
        <Switch checked={aTarget} onChange={setaTarget} />
      </div>
      <footer>
        <Button onClick={handleSave} type="primary">保存</Button>
      </footer>
      <Modal
        open={open}
        width={680}
        title="高级设置"
        onCancel={() => setCurrentItem(null)}
        cancelText="取消"
        okText="确定"
        onOk={handleSeniorSave}
      >
        <Form
          form={form}
          style={{ padding: "4px 0" }}
          layout="vertical"
        >
          <Form.Item
            name="trigger"
            label="生效页面"
            extra={`如果需要配置多个，请使用","进行分割`}
          >
            <Input placeholder="请输入指定的页面" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default options
