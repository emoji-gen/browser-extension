'use strict'

import * as ev from '../event'

namespace eg.content_scripts {
  function getAppName() {
    const element = document.querySelector('meta[name="app:name"]')
    return element.getAttribute('content')
  }

  function attach() {
    const ce = new CustomEvent(ev.CE_ATTACH, { detail: { contents: null } })
    document.body.dispatchEvent(ce)
  }

  function listenCustomEvent(req: string, res: string) {
    document.body.addEventListener(req, (e: CustomEvent) => {
      chrome.runtime.sendMessage({ type: req, detail: e.detail }, response => {
        const ce = new CustomEvent(res, { detail: response })
        document.body.dispatchEvent(ce)
      })
    })
  }

  // --------------------------------------------------------------------------

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
        listenCustomEvent(ev.CE_SEARCH_JOINED_TEAMS, ev.CE_SEARCH_JOINED_TEAMS_DONE)
        listenCustomEvent(ev.CE_REGISTER_EMOJI, ev.CE_REGISTER_EMOJI_DONE)
        attach()
      })
    }
  }
}

eg.content_scripts.main()
