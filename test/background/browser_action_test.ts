'use strict'

import {assert} from 'chai'
import * as sinon from 'sinon'

import * as browserAction from '../../src/background/browser_action'

describe('addListener', () => {
  let sandbox: sinon.SinonSandbox
  let addListener: sinon.SinonSpy
  let create: sinon.SinonSpy

  beforeEach(() => {
    sandbox     = sinon.sandbox.create()
    addListener = sinon.spy()
    create      = sinon.spy()

    ;(window as any).chrome = undefined
    sandbox.stub(window, 'chrome', {
      browserAction: {
        onClicked: { addListener },
      },
      tabs: { create },
    })
  })

  afterEach(() => {
    addListener.reset()
    create.reset()
    sandbox.restore()
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
