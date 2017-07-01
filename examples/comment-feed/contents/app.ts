require('core-js/es6/promise')

import main from './scripts/main'

window.addEventListener('DOMContentLoaded', () => {
    main().then(() => {
        document.documentElement.classList.remove('loading')
    }).catch((error: Error) => {
        console.error('Unable to start application', error)
        document.documentElement.classList.add('error')
        const loading = document.getElementById('loading')
        loading.dataset['error'] = error.message || String(error)
    })
})
