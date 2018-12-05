'use strict'

import * as cheerio from 'cheerio'
import * as v from 'voca'

export interface ITeam {
  name: string;
  teamdomain: string;
}

export interface IResult {
  ok: boolean;
  error: string;
}

export async function searchJoinedTeams(): Promise<ITeam[]> {
  const res = await fetch('https://slack.com/customize/emoji', {
    credentials: 'include',
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
  ): Promise<void>
{
  if (!url) { throw 'Invalid Emoji URL' }

  // fetch emoji image data
  const image = await fetch(url, {
    credentials: 'include',
  })
  const imageData = await image.blob()
  if (_DEBUG) { console.log(image) }

  // fetch initial form data
  const initialUrl = `https://${teamdomain}.slack.com/customize/emoji`
  const initialResponse = await fetch(initialUrl, {
    credentials: 'include',
  })
  if (_DEBUG) { console.log(initialResponse) }

  // Find API token
  const initialText = await initialResponse.text()
  const tokenRegex = /api_token[\"\']?\s*\:\s*[\"\']([\w-]+)[\"\']/
  const tokenMatches = tokenRegex.exec(initialText)
  const token  = tokenMatches ? tokenMatches[1] : null
  if (!token) { throw 'API token not found' }
  if (_DEBUG) { console.log(token) }

  // create post form data
  const fd = new FormData()
  fd.append('mode', 'data')
  fd.append('name', text)
  fd.append('image', imageData, 'emoji.png')
  fd.append('token', token)

  // Add emoji
  const addUrl = `https://${teamdomain}.slack.com/api/emoji.add`
  const addResponse  = await fetch(addUrl, {
    body: fd,
    credentials: 'include',
    method: 'POST',
  })
  if (_DEBUG) { console.log(addResponse) }

  // Parse adding result
  const resultJson = await addResponse.text()
  let result: IResult
  try {
    result = JSON.parse(resultJson)
  } catch (e) {
    throw 'Invalid JSON syntax'
  }

  if (result.ok) { return }
  throw result.error || 'Unknown Error'
}
