'use strict'

import {expect} from 'chai'
import * as sinon from 'sinon'

import * as ev from '../../src/event'
import * as util from '../../src/content_scripts/util'

describe('getAppName', () => {
  let element: HTMLMetaElement

  beforeEach(() => {
    element = document.createElement('meta')
    element.name    = 'app:name'
    element.content = 'XXX-App-Name'
    document.querySelector('head').appendChild(element)
  })

  afterEach(() => {
    element.parentElement.removeChild(element)
  })

  it('# can get app name', () => {
    expect(util.getAppName()).to.be.equal('XXX-App-Name')
  })
})

describe('attach', () => {
  let listener: sinon.SinonSpy

  beforeEach(() => {
    listener = sinon.spy()
    document.body.addEventListener(ev.CE_ATTACH, listener)
  })

  afterEach(() => {
    document.body.removeEventListener(ev.CE_ATTACH, listener)
  })

  it('# can dispatch event', () => {
    util.attach()
    expect(listener.calledOnce).to.be.true;
  })
})

describe('listenCustomEvent', () => {
  beforeEach(() => {
    (<any>window).chrome = {
      runtime: {
        sendMessage: function(detail: any, response: (detail: any) => void) {
          response(detail)
        },
      },
    }
  })

  afterEach(() => {
    (<any>window).chrome = undefined
  })

  it('# can listen custom event', () => {
    let callbackEvent: CustomEvent
    document.body.addEventListener(
      ev.CE_SEARCH_JOINED_TEAMS_DONE,
      (e: CustomEvent) => { callbackEvent = e }
    )

    util.listenCustomEvent(
      ev.CE_SEARCH_JOINED_TEAMS,
      ev.CE_SEARCH_JOINED_TEAMS_DONE
    )

    const ce = new CustomEvent(ev.CE_SEARCH_JOINED_TEAMS, { detail: 'foo' })
    document.body.dispatchEvent(ce)

    expect(callbackEvent.detail).to.deep.equal({
      type: ev.CE_SEARCH_JOINED_TEAMS,
      detail: 'foo',
    })
  })
})
