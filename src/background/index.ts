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

  function registerEmoji(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) {
    slack.registerEmoji(
      request.detail.url,
      request.detail.text,
      request.detail.teamdomain
    )
      .then(
        message => sendResponse({ contents: message }),
        err     => sendResponse({ err })
      )
      return true
  }

  // --------------------------------------------------------------------------

  export function main() {
    if (_DEBUG) {
      console.log('Start background scripts')
    }

    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        if (_DEBUG) {
          console.log(request)
        }
        switch (request.type) {
          case ev.CE_ATTACH:
            return attached(request, sender, sendResponse)
          case ev.CE_SEARCH_JOINED_TEAMS:
            return searchJoinedTeams(request, sender, sendResponse)
          case ev.CE_REGISTER_EMOJI:
            return registerEmoji(request, sender, sendResponse)
        }
      }
    )
  }
}

eg.background.main()
