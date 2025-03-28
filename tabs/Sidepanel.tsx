import classnames from "classnames"
import empty from "data-base64:~assets/empty.svg"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { useThemeChange } from "~components/hooks"
import { MaterialSymbolsSettings, StreamlineEmojisBug } from "~components/Icons"
import Img from "~components/Img"
import Modal from "~components/Modal"
import { domainFaviconMap } from "~utils/favicons"
import { getDomain } from "~utils/index"
import {
  ga,
  GaEvents,
  getMergedData,
  StorageKeys,
  type DataSourceItem
} from "~utils/pure"

import "~tailwind.less"

export interface SidepanelProps {}

const Sidepanel: React.FC<SidepanelProps> = (props) => {
  const {} = props

  useThemeChange()
  const editRef = React.useRef<DataSourceItem>()
  const [createVisible, setCreateVisible] = React.useState(false)
  const [data, setDataSource] = useStorage<DataSourceItem[]>(
    StorageKeys.DATA_SOURCE,
    []
  )

  const dataSource = React.useMemo(() => {
    return getMergedData(data)
  }, [data])

  React.useEffect(() => {
    if (createVisible) return
    editRef.current = null
  }, [createVisible])

  const handleCreate = () => {
    ga(GaEvents.CREATE)
    editRef.current = null
    setCreateVisible(true)
  }

  const handleEdit = (item: DataSourceItem) => {
    if (item.isDefault) return
    ga(GaEvents.ITEM_EDIT)
    editRef.current = item
    setCreateVisible(true)
  }

  const handleClickUrl = (e, item: DataSourceItem) => {
    e.stopPropagation()
    chrome.tabs.create({
      url: `https://${item.matchUrl}`
    })
  }

  const handleDelete = (item: DataSourceItem) => {
    ga(GaEvents.ITEM_DELETE)
    const newDataSource = dataSource.filter((i) => i.id !== item.id)
    setDataSource(newDataSource)
  }

  const handleDisable = (item: DataSourceItem) => {
    ga(GaEvents.ITEM_DISABLE)
    item.disable = !item.disable
    setDataSource([...dataSource])
  }

  const handleCreateSave = (item: DataSourceItem) => {
    ga(GaEvents.CREATE_SAVE)
    if (editRef.current) {
      const index = dataSource.findIndex((i) => i.id === editRef.current.id)
      const newDataSource = [...dataSource]
      newDataSource[index] = item
      setDataSource(newDataSource)
    } else {
      setDataSource([...dataSource, item])
    }
    setCreateVisible(false)
  }

  const noData = !dataSource.length

  return (
    <div className="h-full flex flex-col">
      {noData && <img src={empty} alt="" />}
      <div className="flex-1 overflow-auto">
        {dataSource.map((item) => {
          const { id } = item
          return (
            <Card
              key={id}
              item={item}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleDisable={handleDisable}
              handleClickUrl={handleClickUrl}
            />
          )
        })}
      </div>
      <Actions handleCreate={handleCreate} />
      <Create
        onOk={handleCreateSave}
        visible={createVisible}
        editData={editRef.current}
        dataSource={dataSource}
        onClose={() => setCreateVisible(false)}
      />
    </div>
  )
}

export default Sidepanel

const Card = (props) => {
  const { item, handleClickUrl, handleDisable, handleDelete, handleEdit } =
    props

  const { matchUrl, disable, isDefault, count, hostIcon } =
    item as DataSourceItem
  const domain = getDomain(matchUrl, hostIcon)
  const favicon = domainFaviconMap[domain]
  const iconUrl =
    favicon || `https://www.faviconextractor.com/favicon/${domain}`

  return (
    <div
      role="alert"
      onClick={() => handleEdit(item)}
      className={classnames(
        "alert flex mb-2 justify-between overflow-hidden py-3 group",
        {
          "bg-base-300": disable,
          "hover:shadow-xl": !disable
        }
      )}>
      <div className="flex items-center flex-1 overflow-auto">
        <div className="w-6 h-6 min-w-6 min-h-6">
          <Img
            className={classnames("w-full h-full rounded-md object--contain", {
              "filter grayscale": disable
            })}
            src={iconUrl}
          />
        </div>
        <a
          target="_blank"
          className={classnames("link font-bold ml-3 text-sm ellipsis", {
            "line-through": disable
          })}
          onClick={(e) => handleClickUrl(e, item)}>
          {matchUrl}
        </a>
      </div>
      <div
        className="flex flex-nowrap items-center"
        onClick={(e) => e.stopPropagation()}>
        <Count count={count} className="group-hover:hidden" />
        <EnableButton
          item={item}
          handleDisable={handleDisable}
          className="hidden group-hover:block"
        />
        {!isDefault && (
          <button
            onClick={() => handleDelete(item)}
            className="btn btn-xs btn-error ml-2">
            {chrome.i18n.getMessage("delete")}
          </button>
        )}
      </div>
    </div>
  )
}

const EnableButton = (props) => {
  const { item, handleDisable, className } = props
  const { disable } = item as DataSourceItem

  const text = disable
    ? chrome.i18n.getMessage("enable")
    : chrome.i18n.getMessage("disable")

  return (
    <button
      onClick={() => handleDisable(item)}
      className={classnames("btn btn-xs", className, {
        "btn-accent": !disable
      })}>
      {text}
    </button>
  )
}

const Count = (props) => {
  const { count, className } = props

  if (!count) return null

  return (
    <div
      className={classnames(
        "badge badge-sm badge-ghost mr-2 bg-base-300 font-bold italic",
        className
      )}>
      {count.toLocaleString()}
    </div>
  )
}

const Create = (props) => {
  const { visible, onClose, onOk, editData, dataSource } = props
  const [matchUrl, setMatchUrl] = React.useState("")
  const [redirectKey, setRedirectKey] = React.useState("")
  const [existed, setExisted] = React.useState(false)
  const create = !editData
  const redirectKeyInputRef = React.useRef<HTMLInputElement>()

  React.useEffect(() => {
    if (!create) return
    const existed = dataSource.find((i) => i.matchUrl === matchUrl)
    setExisted(!!existed)
  }, [create, matchUrl])

  React.useEffect(() => {
    if (visible) {
      redirectKeyInputRef.current.focus()
      return
    }
    setExisted(false)
  }, [visible])

  /** 编辑 */
  React.useEffect(() => {
    if (!editData) return
    const { matchUrl, redirectKey } = editData
    setMatchUrl(matchUrl)
    setRedirectKey(redirectKey)
  }, [editData])

  /** 新建 */
  React.useEffect(() => {
    if (!visible) return
    if (editData) return
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      const activeTabUrl = activeTab.url
      if (["chrome://extensions/", "chrome://newtab/"].includes(activeTabUrl)) {
        return
      }
      if (!activeTabUrl) return
      const { hostname, pathname, searchParams } = new URL(activeTabUrl)
      const url = pathname ? `${hostname}${pathname}` : hostname
      setMatchUrl(url)
      if (searchParams.get("target")) {
        setRedirectKey("target")
        return
      }
      if (searchParams.get("url")) {
        setRedirectKey("url")
      }
    })
  }, [visible])

  const handleOk = () => {
    if (!matchUrl || !redirectKey) return
    const id = editData?.id || `${Date.now()}`
    if (onOk) onOk({ matchUrl, redirectKey, id })
    setMatchUrl("")
    setRedirectKey("")
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      onOk={handleOk}
      okButtonProps={{ disabled: existed }}>
      <div className="flex flex-col justify-center items-center">
        <div className="mb-4 w-full flex flex-col justify-center items-center">
          <input
            type="text"
            placeholder={chrome.i18n.getMessage("placeholder_url")}
            className={classnames(
              "input input-bordered input-neutral w-[97%] max-w-xs",
              {
                "input-error": existed
              }
            )}
            value={matchUrl}
            onChange={(e) => setMatchUrl(e.target.value)}
          />
          {existed && (
            <div className="text-xs text-error mt-2 w-[97%]">
              {chrome.i18n.getMessage("existed")}
            </div>
          )}
        </div>
        <input
          ref={redirectKeyInputRef}
          type="text"
          placeholder={chrome.i18n.getMessage("placeholder_parameter")}
          className="input input-bordered input-neutral w-[97%] max-w-xs"
          value={redirectKey}
          onChange={(e) => setRedirectKey(e.target.value)}
        />
      </div>
    </Modal>
  )
}

const Actions = (props) => {
  const { handleCreate } = props

  const handleIssue = () => {
    ga(GaEvents.ACTIONS_ISSUE)

    chrome.tabs.create({
      url: "https://github.com/Dolov/chrome-QuickGo/issues"
    })
  }

  const handleSetting = () => {
    ga(GaEvents.ACTIONS_SETTING)
    chrome.tabs.create({
      url: "tabs/Settings.html"
    })
  }

  return (
    <div className="flex items-center pt-4">
      <button
        onClick={handleCreate}
        className="btn btn-sm btn-neutral btn-block flex-1">
        {chrome.i18n.getMessage("create")}
      </button>
      <div className="flex">
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_issues")}>
          <button onClick={handleIssue} className="btn btn-sm btn-circle mx-2">
            <StreamlineEmojisBug className="text-xl" />
          </button>
        </div>
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_setting")}>
          <button
            onClick={handleSetting}
            className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsSettings className="text-xl group-hover:text-primary" />
          </button>
        </div>
      </div>
    </div>
  )
}
