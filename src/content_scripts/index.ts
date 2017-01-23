'use strict'

import * as ev from '../event'
import * as util from './util'

function main() {
  if (_DEBUG) {
    console.log('Start background scripts')
  }

  const appName = util.getAppName()
  if (appName === 'Emoji-Web') {
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
