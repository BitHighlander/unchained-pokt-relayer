/*
        Relayer
 */

require('dotenv').config()
require('dotenv').config({path:"../../../.env"})
require('dotenv').config({path:"./../../.env"})
require('dotenv').config({path:"../../../../.env"})

const pocketJS = require('@pokt-network/pocket-js')

const { Pocket, Configuration, HttpRpcProvider, PocketAAT } = pocketJS;


// The dispatcher provides information about your Pocket session so that your
// application can then connect to the decentralized network of nodes.
// You can use one of our dispatchers or any node connected to the Pocket blockchain.
const dispatchURL = new URL("https://node1.mainnet.pokt.network:443")
const rpcProvider = new HttpRpcProvider(dispatchURL)
const configuration = new Configuration(5, 1000, 0, 40000)
const pocketInstance = new Pocket([dispatchURL], rpcProvider, configuration)

// See https://docs.pokt.network/home/resources/references/supported-blockchains for blockchain choices
const blockchain = "0021" // Ethereum mainnet


const accountPrivateKey = process.env['POKT_PRIV_KEY']
const accountPublicKey = process.env['POKT_PUB_KEY']
const accountPassphrase = process.env['POKT_PASSWORD']
if(!accountPrivateKey) throw Error("Missing POKT_PRIV_KEY")
if(!accountPublicKey) throw Error("Missing POKT_PUB_KEY")
if(!accountPassphrase) throw Error("Missing POKT_PASSWORD")

// This is only called once to setup the Pocket Instance and AAT
async function unlockAccount(accountPrivateKey: string, accountPublicKey: string, accountPassphrase: string) {
    try {
        const account = await pocketInstance.keybase.importAccount(
            Buffer.from(accountPrivateKey, 'hex'),
            accountPassphrase
        )
        await pocketInstance.keybase.unlockAccount(account.addressHex, accountPassphrase, 0)
        return await PocketAAT.from(
            "0.0.1",
            accountPublicKey,
            accountPublicKey,
            accountPrivateKey
        )
    } catch(e) {
        console.log(e)
    }
}

// Call this every time you want to fetch RPC data
async function sendRelay(rpcQuery: string, blockchain: string, pocketAAT: any) {
    try {
        return await pocketInstance.sendRelay(rpcQuery, blockchain, pocketAAT)
    } catch (e) {
        console.log(e)
    }
}

unlockAccount(accountPrivateKey, accountPublicKey, accountPassphrase).then(pocketAAT => {
    let rpcQuery = '{"jsonrpc":"2.0","id":1,"method":"net_version","params":[]}'
    sendRelay(rpcQuery, blockchain, pocketAAT).then(result => {
        console.log(result.payload);
    })
})