// Browser version of html5 fetch, polyfilled if needed.

// Microsoft is keeping to their long-held tradition of shipping broken
// standards implementations, this forces Edge to use the polyfill insted.
if (navigator && /Edge/.test(navigator.userAgent)) {
  delete window.fetch
}

require('whatwg-fetch')
module.exports = self.fetch.bind(self)
