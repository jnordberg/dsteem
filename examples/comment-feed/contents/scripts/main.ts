
import {Client, BlockchainMode} from 'dsteem'

import * as removeMarkdown from 'remove-markdown'

const client = new Client('wss://gtg.steem.house:8090')

function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms)
    })
}

function shortBody(body: string) {
    let rv: string = removeMarkdown(body).replace(/<[^>]*>/g, '')
    if (rv.length > 140) {
        return rv.slice(0, 139) + '…'
    }
    return rv
}

function buildComment(comment: any): HTMLDivElement {
    const rv = document.createElement('div')
    rv.className = 'comment'

    const {author, body, parent_author, parent_permlink} = comment
    const parent = `@${ parent_author }/${ parent_permlink }`

    rv.innerHTML += `
        <span class="author">
            <a href="https://steemit.com/@${ author }" target="_blank">@${ author }</a>
        </span>
        <span class="body">${ shortBody(body) }</span>
    `

    return rv
}

async function *getComments() {
    for await (const operation of client.blockchain.getOperations({mode: BlockchainMode.Latest})) {
        if (operation.op[0] === 'comment') {
            const comment = operation.op[1]
            if (comment.body.slice(0, 2) == '@@') {
                continue // skip edits
            }
            yield comment
        }
    }
}

export default async function main() {
    const commentsEl = document.getElementById('comments')
    const backlog = []

    let renderTimer: NodeJS.Timer | undefined

    document.querySelector('a[href="#pause"]').addEventListener('click', function(event) {
        event.preventDefault()
        if (renderTimer) {
            this.textContent = 'Resume'
            clearTimeout(renderTimer)
            renderTimer = undefined
        } else {
            this.textContent = 'Pause'
            render()
        }
    })

    function render() {
        const comment = backlog.shift()
        if (comment) {
            commentsEl.appendChild(buildComment(comment))
            while (commentsEl.children.length > 100) {
                commentsEl.removeChild(commentsEl.children[0])
            }
            window.scrollTo(undefined, document.body.scrollHeight)
        }
        const next = 3000 / (backlog.length + 1)
        renderTimer = setTimeout(render, next)
    }

    async function *update() {
        for await (const comment of getComments()) {
            backlog.push(comment)
            yield
        }
    }

    let iter = update()

    const run = async () => {
        try {
            while (true) { await iter.next() }
        } catch (error) {
            console.error('Problem fetching comments', error)
            setTimeout(() => {
                iter = update()
                run()
            }, 3000)
        }
    }

    await iter.next() // wait for the first update
    run() // run rest of the generator non-blocking
    render() // start render loop
}
