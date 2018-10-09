import 'mocha'
import * as assert from 'assert'
import {randomBytes} from 'crypto'

import * as ds from './../src/index-node'

const {Asset, PrivateKey, Client, HexBuffer} = ds

import {getTestnetAccounts, randomString, agent} from './common'

describe('operations', function() {
    this.slow(20 * 1000)
    this.timeout(60 * 1000)

    const client = Client.testnet({agent})

    let acc1, acc2: {username: string, posting: string, active: string}
    let acc1Key: ds.PrivateKey
    before(async function() {
        [acc1, acc2] = await getTestnetAccounts()
        acc1Key = PrivateKey.from(acc1.active)
    })

    it('should delegate vesting shares', async function() {
        const [user1] = await client.database.getAccounts([acc1.username])
        const currentDelegation = Asset.from(user1.received_vesting_shares)
        const newDelegation = Asset.from(
            currentDelegation.amount >= 1000 ? 0 : 1000 + Math.random() * 1000,
            'VESTS'
        )
        const result = await client.broadcast.delegateVestingShares({
            delegator: acc1.username,
            delegatee: acc2.username,
            vesting_shares: newDelegation
        }, acc1Key)
        const [user2] = await client.database.getAccounts([acc2.username])
        assert.equal(user2.received_vesting_shares, newDelegation.toString())
    })

    it('should send custom', async function() {
        const props = await client.database.getDynamicGlobalProperties()
        const op: ds.CustomOperation = ['custom', {
            required_auths: [acc1.username],
            id: ~~(Math.random() * 65535),
            data: randomBytes(512),
        }]
        const rv = await client.broadcast.sendOperations([op], acc1Key)
        const tx = await client.database.getTransaction(rv)
        const rop = tx.operations[0]
        assert.equal(rop[0], 'custom')
        assert.equal(rop[1].data, HexBuffer.from(op[1].data).toString())
    })

    it('should send custom json', async function() {
        const data = {test: 123, string: 'unicode🐳'}
        const rv = await client.broadcast.json({
            required_auths: [acc1.username],
            required_posting_auths: [],
            id: 'something',
            json: JSON.stringify(data),
        }, acc1Key)
        const tx = await client.database.getTransaction(rv)
        assert.deepEqual(JSON.parse(tx.operations[0][1].json), data)
    })

    it('should transfer steem', async function() {
        const [acc2bf] = await client.database.getAccounts([acc2.username])
        await client.broadcast.transfer({
            from: acc1.username,
            to: acc2.username,
            amount: '0.001 TESTS',
            memo: 'Hej på dig!',
        }, acc1Key)
        const [acc2af] = await client.database.getAccounts([acc2.username])
        const old_bal = Asset.from(acc2bf.balance);
        const new_bal = Asset.from(acc2af.balance);
        assert.equal(new_bal.subtract(old_bal).toString(), '0.001 TESTS')
    })

    /*
    // TODO: this returns a `Missing Posting Authority` error for `comment_options`
    //       only because `comment` fails on an RC error.
    it('should create account and post with options', async function() {
        // ensure not testing accounts on mainnet
        assert(client.chainId.toString('hex') !== '0000000000000000000000000000000000000000000000000000000000000000')

        const username = 'ds-' + randomString(12)
        const password = randomString(32)
        await client.broadcast.createTestAccount({
            username, password, creator: acc1.username, metadata: {date: new Date()}
        }, acc1Key)

        const [newAcc] = await client.database.getAccounts([username])
        assert.equal(newAcc.name, username)
        // not sure why but on the testnet the recovery account is always 'steem'
        // assert.equal(newAcc.recovery_account, acc1.username)
        const postingWif = PrivateKey.fromLogin(username, password, 'posting')
        const postingPub = postingWif.createPublic(client.addressPrefix).toString()
        const memoWif = PrivateKey.fromLogin(username, password, 'memo')
        const memoPub = memoWif.createPublic(client.addressPrefix).toString()
        assert.equal(newAcc.memo_key, memoPub)
        assert.equal(newAcc.posting.key_auths[0][0], postingPub)

        const permlink = 'hello-world'
        await client.broadcast.commentWithOptions({
            parent_author: '',
            parent_permlink: 'test',
            author: username,
            permlink,
            title: 'Hello world!',
            body: `My password is: ${ password }`,
            json_metadata: JSON.stringify({tags: ['test', 'hello']}),
        }, {
            permlink, author: username,
            allow_votes: false,
            allow_curation_rewards: false,
            percent_steem_dollars: 0,
            max_accepted_payout: Asset.from(10, 'TBD'),
            extensions: [
                [0, {beneficiaries: [
                    {weight: 10000, account: acc1.username}
                ]}]
            ],
        }, postingWif)

        const [post] = await client.call('condenser_api', 'get_content', [username, permlink])
        assert.deepEqual(post.beneficiaries, [{account: acc1.username, weight: 10000}])
        assert.equal(post.max_accepted_payout, '10.000 TBD')
        assert.equal(post.percent_steem_dollars, 0)
        assert.equal(post.allow_votes, false)
    })
    */

    it('should update account', async function() {
        const key = PrivateKey.from(acc1.active)
        const foo = Math.random()
        const rv = await client.broadcast.updateAccount({
            account: acc1.username,
            memo_key: PrivateKey.from(acc1.posting).createPublic(client.addressPrefix),
            json_metadata: JSON.stringify({foo}),
        }, key)
        const [acc] = await client.database.getAccounts([acc1.username])
        assert.deepEqual({foo}, JSON.parse(acc.json_metadata))
    })

    it('should create account custom auths', async function() {
        const key = PrivateKey.from(acc1.active)

        const username = 'ds-' + randomString(12)
        const password = randomString(32)
        const metadata = {my_password_is: password}

        const ownerKey = PrivateKey.fromLogin(username, password, 'owner').createPublic(client.addressPrefix)
        const activeKey = PrivateKey.fromLogin(username, password, 'active').createPublic(client.addressPrefix)
        const postingKey = PrivateKey.fromLogin(username, password, 'posting').createPublic(client.addressPrefix)
        const memoKey = PrivateKey.fromLogin(username, password, 'memo').createPublic(client.addressPrefix)
        await client.broadcast.createTestAccount({
            creator: acc1.username,
            username,
            auths: {
                owner: ownerKey,
                active: activeKey.toString(),
                posting: {weight_threshold: 1, account_auths: [], key_auths: [[postingKey, 1]]},
                memoKey,
            },
            metadata
        }, key)
        const [newAccount] = await client.database.getAccounts([username])
        assert.equal(newAccount.name, username)
        assert.equal(newAccount.memo_key, memoKey)
    })

    it('should create account and calculate fees', async function() {
        const password = randomString(32)
        const metadata = {my_password_is: password}
        const creator = acc1.username

        // ensure not testing accounts on mainnet
        assert(client.chainId.toString('hex') !== '0000000000000000000000000000000000000000000000000000000000000000')

        const chainProps = await client.database.getChainProperties()
        const creationFee = Asset.from(chainProps.account_creation_fee)

        // no delegation and no fee (uses RC instead)
        await client.broadcast.createTestAccount({
            password, metadata, creator, username: 'foo' + randomString(12),
            delegation: 0
        }, acc1Key)

        // fee (no RC used) and no delegation
        await client.broadcast.createTestAccount({
            password, metadata, creator, username: 'foo' + randomString(12),
            fee: creationFee
        }, acc1Key)

        // fee plus delegation
        await client.broadcast.createTestAccount({
            password, creator, username: 'foo' + randomString(12),
            fee: creationFee, delegation: Asset.from(1000, 'VESTS')
        }, acc1Key)

        // invalid (inexact) fee must fail
        try {
            await client.broadcast.createTestAccount({password, metadata, creator, username: 'foo', fee: '1.111 TESTS'}, acc1Key)
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.message, 'Fee must be exactly ' + creationFee.toString())
        }

        try {
            await client.broadcast.createTestAccount({metadata, creator, username: 'foo'}, acc1Key)
            assert(false, 'should not be reached')
        } catch (error) {
            assert.equal(error.message, 'Must specify either password or auths')
        }
    })

    it('should change recovery account', async function() {
        const op: ds.ChangeRecoveryAccountOperation = ['change_recovery_account', {
            account_to_recover: acc1.username,
            new_recovery_account: acc2.username,
            extensions: [],
        }]
        const key = ds.PrivateKey.from(acc1.active)
        await client.broadcast.sendOperations([op], key)
    })

    it('should report overproduction', async function() {
        const b1 = await client.database.getBlock(10)
        const b2 = await client.database.getBlock(11)
        b1.timestamp = b2.timestamp
        const op: ds.ReportOverProductionOperation = ['report_over_production', {
            reporter: acc1.username,
            first_block: b1,
            second_block: b2,
        }]
        try {
            await client.broadcast.sendOperations([op], acc1Key)
            assert(false)
        } catch (error) {
            assert.equal(error.message, 'first_block.signee() == second_block.signee(): ')
        }
    })

})
