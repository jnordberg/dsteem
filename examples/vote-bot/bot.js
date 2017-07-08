const dsteem = require('dsteem')

// bot is configured with enviroment variables

// the username of the bot
const BOT_USER = process.env['BOT_USER'] || die('BOT_USER missing')
// the posting key of the bot
const POSTING_KEY = process.env['POSTING_KEY'] || die('POSTING_KEY missing')
// the user we want to vote the same as
const FOLLOW_USER = process.env['FOLLOW_USER'] || die('FOLLOW_USER missing')
// and the vote weight to use, 10000 = 100%
const VOTE_WEIGHT = process.env['VOTE_WEIGHT'] ? parseInt(process.env['VOTE_WEIGHT']) : 10000

// setup the dsteem client, you can use other nodes, for example gtg's public node at wss://gtg.steem.house:8090
const client = new dsteem.Client('wss://steemd.steemit.com')

// deserialize the posting key (in wif format, same format as you find on the steemit.com interface)
const key = dsteem.PrivateKey.fromString(POSTING_KEY)

// create a new readable stream with all operations, we use the 'latest' mode since
// we don't care about reversed block that much for a simple vote bot
// and this will make it react faster to the votes of it's master
const stream = client.blockchain.getOperationsStream({mode: dsteem.BlockchainMode.Latest})

console.log(`Following ${ FOLLOW_USER } with ${ VOTE_WEIGHT / 100 }% vote weight`)

// the stream will emit one data event for every operatio that happens on the steemit blockchain
stream.on('data', (operation) => {

    // we only care about vote operations made by the user we follow
    if (operation.op[0] == 'vote') {
        let vote = operation.op[1]
        if (vote.voter === FOLLOW_USER) {
            console.log(`${ vote.voter } voted, following...`)

            // change the voter to the bot user and set the weight
            vote.voter = BOT_USER
            if (vote.weight > 0) {
                vote.weight = VOTE_WEIGHT
            } else {
                vote.weight = -VOTE_WEIGHT // follow flags as well
            }

            // finally broadcast the vote to the network
            client.broadcast.vote(vote, key).then(() => {
                console.log(`Voted for https://steemit.com/@${ vote.author }/${ vote.permlink }`)
            }).catch((error) => {
                console.warn('Vote failed', error)
            })
        }
    }
})

function die(msg) { process.stderr.write(msg+'\n'); process.exit(1) }
