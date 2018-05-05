'use strict'

const WEB_URL = 'https://emoji-gen.ninja'

export function addListener() {
  chrome.browserAction.onClicked.addListener(
    (tab: chrome.tabs.Tab) => {
      chrome.tabs.create({ url: WEB_URL })
    },
  )
}
