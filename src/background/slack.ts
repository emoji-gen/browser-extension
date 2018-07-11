'use strict'

import * as cheerio from 'cheerio'
import * as v from 'voca'

export interface ITeam {
  name: string;
  teamdomain: string;
}

export async function searchJoinedTeams(): Promise<ITeam[]> {
  const res = await fetch('https://slack.com/customize/emoji', {
    credentials: 'include',
    mode: 'cors',
  })
  const body = await res.text()
  if (_DEBUG) {
    console.log(res)
  }

  const $ = cheerio.load(body)
  const teamAnchors = $('#header_team_nav li:not(#add_team_option) a').toArray()
  const teams: ITeam[] = teamAnchors
    .map(_anchor => {
      const anchor  = $(_anchor)
      const href    = anchor.attr('href')
      const matches = href.match(/\/\/([^\.]+)\.slack\.com/)

      if (matches) {
        return {
          name: v.trim(anchor.text()),
          teamdomain: matches[1],
        }
      }
    })
    .filter(team => !!team) as ITeam[]

  if (_DEBUG) {
    console.log('teams', teams)
  }
  return teams
}

export async function registerEmoji(
  url: string,
  text: string,
  teamdomain: string,
  ): Promise<string>
{
  if (!url) { throw 'Invalid Emoji URL' }

  // fetch emoji image data
  const image = await fetch(url, {
    credentials: 'include',
    mode: 'cors',
  })
  const imageData = await image.blob()
  if (_DEBUG) { console.log(image) }

  // fetch initial form data
  const actionUrl = `https://${teamdomain}.slack.com/customize/emoji`
  const customize = await fetch(actionUrl, {
    credentials: 'include',
    mode: 'cors',
  })
  if (_DEBUG) { console.log(customize) }

  let $ = cheerio.load(await customize.text())
  const form  = $('#addemoji')
  const pairs = form.serializeArray()
  if (_DEBUG) { console.log(pairs) }

  // create post form data
  const fd = new FormData()
  pairs.forEach(pair => {
    if (pair.name === 'name') {
      fd.append(pair.name, text)
    } else {
      fd.append(pair.name, pair.value)
    }
  })
  fd.append('img', imageData)

  // submit
  const result  = await fetch(actionUrl, {
    body: fd,
    credentials: 'include',
    method: 'POST',
    mode: 'cors',
  })
  if (_DEBUG) { console.log(result) }

  // parse result message
  $ = cheerio.load(await result.text())
  const alertElement = $('.alert:first-of-type')
  const messages     = alertElement.text()
    .split('\n')
    .map(message => v.trim(message))
    .filter(message => message.length > 0)
  if (_DEBUG) {
    console.log(messages)
  }

  if (alertElement.hasClass('alert_success') && messages.length > 0) {
    return messages[0]
  }

  throw messages[0] || 'Unknown Error'
}
