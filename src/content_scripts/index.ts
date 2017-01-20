'use strict'

import * as ev from '../event'

namespace eg.content_scripts {
  function getAppName() {
    const element = document.querySelector('meta[name="app:name"]')
    return element.getAttribute('content')
  }

  function attach() {
    const ce = new CustomEvent(ev.CE_ATTACH, {})
    document.body.dispatchEvent(ce)
  }

  function listenCustomEvents() {
    document.body.addEventListener(ev.CE_SEARCH_JOINED_TEAMS, e => {
      chrome.runtime.sendMessage({ type: ev.CE_SEARCH_JOINED_TEAMS }, response => {
        const ce = new CustomEvent(ev.CE_SEARCH_JOINED_TEAMS_END, response)
        document.body.dispatchEvent(ce)
      })
    })
  }

  export function main() {
    if (_DEBUG) {
      console.log('Start background scripts')
    }

    const appName = getAppName()
    if (appName === 'Emoji-Web') {
      chrome.runtime.sendMessage({ type: ev.CE_ATTACH }, response => {
        if (_DEBUG) {
          console.log('attach to Webpage', response)
        }
        listenCustomEvents()
        attach()
      })
    }
  }
}

eg.content_scripts.main()
