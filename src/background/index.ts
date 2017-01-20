'use strict'

import * as ev from '../event'
import * as slack from './slack'

namespace eg.background {
  function attached(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
    )
  {
    if (_DEBUG) {
      console.log('attached by Content Scripts', request)
    }
    sendResponse({ contents: null })
  }

  function searchJoinedTeams(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) : boolean {
    slack.searchJoinedTeams()
      .then(
        teams => sendResponse({ contents: teams }),
        err   => sendResponse({ err })
      )
    return true
  }

  export function main() {
    if (_DEBUG) {
      console.log('Start background scripts')
    }

    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        switch (request.type) {
          case ev.CE_ATTACH:
            return attached(request, sender, sendResponse)
          case ev.CE_SEARCH_JOINED_TEAMS:
            return searchJoinedTeams(request, sender, sendResponse)
        }
      }
    )
  }
}

eg.background.main()
