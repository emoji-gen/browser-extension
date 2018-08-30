'use strict'

import * as ev from '../event'
import * as browserAction from './browser_action'
import * as slack from './slack'

function attached(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
  )
{
  sendResponse({ contents: null })
}

function searchJoinedTeams(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
): boolean {
  slack.searchJoinedTeams()
    .then(
      teams => sendResponse({ contents: teams }),
      err   => sendResponse({ err }),
    )
  return true
}

function registerEmoji(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
): boolean {
  slack.registerEmoji(
    request.detail.url,
    request.detail.text,
    request.detail.teamdomain,
  )
    .then(
      _ => sendResponse({ contents: 'ok' }),
      err => sendResponse({ err }),
    )
  return true
}

// --------------------------------------------------------------------------

function main() {
  if (_DEBUG) {
    console.log('Start background scripts')
  }

  browserAction.addListener()
  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
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
    },
  )
}

main()
