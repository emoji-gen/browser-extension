import axios from 'axios'
import * as cheerio from 'cheerio'
import * as v from 'voca'

export interface Team {
  name: string;
  teamdomain: string;
}

export async function searchJoinedTeams() : Promise<Team[]> {
  const res = await axios.get('https://slack.com/customize/emoji')
  if (_DEBUG) {
    console.log(res)
  }

  const $ = cheerio.load(res.data)
  const teamAnchors = $('#header_team_nav li:not(#add_team_option) a').toArray()
  const teams: Team[] = teamAnchors
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
    .filter(team => !!team)

  if (_DEBUG) {
    console.log('teams', teams)
  }
  return teams
}
