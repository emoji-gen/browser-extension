'use strict'

import {assert} from 'chai'
import * as sinon from 'sinon'

import * as browserAction from '../../src/background/browser_action'

describe('addListener', () => {
  let addListener = sinon.spy()
  let create      = sinon.spy()

  before(() => {
    assert.notOk((window as any).chrome)

    ;(window as any).chrome = {
      browserAction: {
        onClicked: { addListener },
      },
      tabs: { create },
    }
  })

  after(() => {
    ;(window as any).chrome = undefined
  })

  afterEach(() => {
    addListener.reset()
    create.reset()
  })

  it('should register listener function', () => {
    browserAction.addListener()

    assert.ok(addListener.called)
    assert.isFunction(addListener.args[0][0])
  })

  it('should open new tab', () => {
    browserAction.addListener()
    addListener.args[0][0]()

    assert.ok(create.called)
    assert.deepEqual(create.args[0][0], {
      url: 'https://emoji.pine.moe',
    })
  })
})
