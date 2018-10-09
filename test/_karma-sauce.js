module.exports = function(config) {

// https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
const customLaunchers = {}
const addLauncher = (fn) => {
    const c = {}
    const caps = fn(c) || c
    const name = Object.keys(caps)
        .map((k)=>caps[k]).filter((v)=>typeof v==='string')
        .join('_').toLowerCase().replace(/\W+/g, '')
    customLaunchers[name] = caps
    customLaunchers[name].base = 'SauceLabs'
}

const shuffle = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

addLauncher((caps) => {
    caps['browserName'] = 'Safari';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'iPhone Simulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '10.3';
    caps['platformName'] = 'iOS';
})

addLauncher((caps) => {
    caps['browserName'] = 'Safari';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'iPhone Simulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '9.3';
    caps['platformName'] = 'iOS';
})

addLauncher((caps) => {
    caps['browserName'] = 'Browser';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'Samsung Galaxy S4 GoogleAPI Emulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '4.4';
    caps['platformName'] = 'Android';
})

addLauncher((caps) => {
    caps['browserName'] = 'Android';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'Android GoogleAPI Emulator';
    caps['deviceOrientation'] = 'portrait';
    caps['browserName'] = 'Chrome';
    caps['platformVersion'] = '7.1';
    caps['platformName'] = 'Android';
})


addLauncher((caps) => {
    caps['browserName'] = 'Android';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'Android Emulator';
    caps['deviceOrientation'] = 'portrait';
    caps['browserName'] = 'Chrome';
    caps['platformVersion'] = '6.0';
    caps['platformName'] = 'Android';
})

addLauncher((caps) => {
    caps['browserName'] = 'Browser';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'Android Emulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '5.1';
    caps['platformName'] = 'Android';
})

addLauncher((caps) => {
    caps = {browserName: 'chrome'};
    caps['platform'] = 'Linux';
    caps['version'] = '48.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'chrome'};
    caps['platform'] = 'Windows 7';
    caps['version'] = '48.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'firefox'};
    caps['platform'] = 'Windows 10';
    caps['version'] = '55.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'chrome'};
    caps['platform'] = 'Windows 10';
    caps['version'] = '59.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'chrome'};
    caps['platform'] = 'macOS 10.12';
    caps['version'] = '48.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'safari'};
    caps['platform'] = 'macOS 10.12';
    caps['version'] = '10.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'safari'};
    caps['platform'] = 'OS X 10.11';
    caps['version'] = '9.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'safari'};
    caps['platform'] = 'OS X 10.10';
    caps['version'] = '8.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'firefox'};
    caps['platform'] = 'macOS 10.12';
    caps['version'] = '54.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'firefox'};
    caps['platform'] = 'Linux';
    caps['version'] = '45.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'internet explorer'};
    caps['platform'] = 'Windows 10';
    caps['version'] = '11.103';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'MicrosoftEdge'};
    caps['platform'] = 'Windows 10';
    caps['version'] = '15.15063';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'MicrosoftEdge'};
    caps['platform'] = 'Windows 10';
    caps['version'] = '14.14393';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'firefox'};
    caps['platform'] = 'Windows 7';
    caps['version'] = '54.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'chrome'};
    caps['platform'] = 'Windows 8.1';
    caps['version'] = '32.0';
    return caps
})

addLauncher((caps) => {
    caps = {browserName: 'firefox'};
    caps['platform'] = 'Windows 8.1';
    caps['version'] = '35.0';
    return caps
})

addLauncher((caps) => {
    caps['browserName'] = 'Safari';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'iPhone 7 Simulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '10.3';
    caps['platformName'] = 'iOS';
})

addLauncher((caps) => {
    caps['browserName'] = 'Safari';
    caps['appiumVersion'] = '1.6.4';
    caps['deviceName'] = 'iPhone 5 Simulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '8.4';
    caps['platformName'] = 'iOS';
})

addLauncher((caps) => {
    caps = {browserName: 'chrome'};
    caps['platform'] = 'Windows 8.1';
    caps['version'] = '60.0';
    return caps
})

addLauncher((caps) => {
    caps['browserName'] = 'Safari';
    caps['appiumVersion'] = '1.8.1';
    caps['deviceName'] = 'iPhone X Simulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '11.3';
    caps['platformName'] = 'iOS';
})

addLauncher((caps) => {
    caps['browserName'] = 'internet explorer';
    caps['platform'] = 'Windows 7';
    caps['version'] = '10.0';
})

addLauncher((caps) => {
    caps['browserName'] = 'MicrosoftEdge';
    caps['platform'] = 'Windows 10';
    caps['version'] = '16.16299';
})

addLauncher((caps) => {
    caps['browserName'] = 'chrome';
    caps['platform'] = 'Windows 10';
    caps['version'] = '67.0';
})

addLauncher((caps) => {
    caps['browserName'] = 'safari';
    caps['platform'] = 'macOS 10.13';
    caps['version'] = '11.1';
})

addLauncher((caps) => {
    caps['browserName'] = 'safari';
    caps['platform'] = 'macOS 10.12';
    caps['version'] = '10.1';
})

addLauncher((caps) => {
    caps['browserName'] = 'firefox';
    caps['platform'] = 'macOS 10.13';
    caps['version'] = '60.0';
})

config.set({
    frameworks: ['browserify', 'mocha'],
    files: ['_browser.js'],
    preprocessors: {'_browser.js': ['browserify' ]},
    browserify: {
      debug: true,
      plugin: [['tsify', {project: 'test/tsconfig.json'}]]
    },
    colors: true,
    logLevel: config.LOG_INFO,
    captureTimeout: 0,
    browserNoActivityTimeout: 1000 * 60 * 5,
    sauceLabs: {
        testName: 'jnordberg/dsteem',
        connectOptions: {tunnelDomains: 'localhost,127.0.0.1'}
    },
    concurrency: 5,
    customLaunchers: customLaunchers,
    browsers: shuffle(Object.keys(customLaunchers)),
    reporters: ['mocha', 'saucelabs'],
    singleRun: true
  })
}
