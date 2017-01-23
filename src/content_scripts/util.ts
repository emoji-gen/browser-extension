'use strict'

import * as ev from '../event'

export function getAppName() {
  const element = document.querySelector('meta[name="app:name"]')
  return element.getAttribute('content')
}

export function attach() {
  const ce = new CustomEvent(ev.CE_ATTACH, { detail: { contents: null } })
  document.body.dispatchEvent(ce)
}

export function listenCustomEvent(req: string, res: string) {
  document.body.addEventListener(req, (e: CustomEvent) => {
    chrome.runtime.sendMessage({ type: req, detail: e.detail }, response => {
      const ce = new CustomEvent(res, { detail: response })
      document.body.dispatchEvent(ce)
    })
  })
}

