'use strict'

function getAppName() {
  const element = document.querySelector('meta[name="app:name"]')
  return element.getAttribute('content')
}

function attach() {
  const ev = new CustomEvent('chrome_extension:attach', {})
  document.body.dispatchEvent(ev)
}

function main() {
  const appName = getAppName()
  if (appName === 'Emoji-Web') {
    attach()
  }
}

// ----------------------------------------------------------------------------

main()
