export enum StorageKeys {
  DATA_SOURCE = "DATA_SOURCE"
}

export interface DataSourceItem {
  id: number
  hostname: string
  redirectKey: string
  disable: boolean
}

export function formatDateTime() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

async function getOrCreateClientId() {
  const result = await chrome.storage.local.get("clientId")
  let clientId = result.clientId
  if (!clientId) {
    // Generate a unique client ID, the actual value is not relevant
    clientId = self.crypto.randomUUID()
    await chrome.storage.local.set({ clientId })
  }
  return clientId
}

export const ga = async (name, params?: Record<string, any>) => {
  const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect"
  const MEASUREMENT_ID = process.env.PLASMO_PUBLIC_MEASUREMENT_ID
  const API_SECRET = process.env.PLASMO_PUBLIC_API_SECRET

  fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: await getOrCreateClientId(),
        events: [
          {
            name,
            params: {
              time: formatDateTime(),
              ...params
            }
          }
        ]
      })
    }
  )
}