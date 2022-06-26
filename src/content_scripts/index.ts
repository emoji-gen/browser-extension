'use strict'

import ev = require('../event')
import util = require('./util')

const APP_ID = 'j1g3xUDxVmwWCCKqibVQCZOHNpvnSMBY'

function main() {
  if (_DEBUG) {
    console.log('Start background scripts')
  }

  const appId = util.getAppId()
  if (appId === APP_ID) {
    chrome.runtime.sendMessage({ type: ev.CE_ATTACH }, response => {
      if (_DEBUG) {
        console.log('attach to Webpage', response)
      }
      util.listenCustomEvent(ev.CE_SEARCH_JOINED_TEAMS, ev.CE_SEARCH_JOINED_TEAMS_DONE)
      util.listenCustomEvent(ev.CE_REGISTER_EMOJI, ev.CE_REGISTER_EMOJI_DONE)
      util.attach()
    })
  }
}

main()
