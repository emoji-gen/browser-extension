'use strict'

import {Ptero} from 'ptero'
import cloneInto = require('clone-into')
import * as ev from '../event'

const ptero = new Ptero(document.body)

export function getAppId() {
  const element = document.querySelector('body')
  if (element) {
    return element.dataset.appId
  }
}

export function getAppName() {
  const element = document.querySelector('meta[name="app:name"]')
  if (element) {
    return element.getAttribute('content')
  }
}

export function attach() {
  ptero.emit(ev.CE_ATTACH, { contents: null })
}

export function listenCustomEvent(req: string, res: string) {
  ptero.on(req, (e: CustomEvent) => {
    chrome.runtime.sendMessage({ type: req, detail: e.detail }, response => {
      ptero.emit(res, cloneInto(response, document.defaultView))
    })
  })
}
