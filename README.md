# eulerbeats-cli

[![npm package](https://img.shields.io/npm/v/@eulerbeats/eulerbeats-cli.svg?type=shield&style=flat-square&color=ffdf6d)](https://www.npmjs.com/package/@eulerbeats/eulerbeats-cli)

EulerBeats CLI is a command-line tool to query the Eulerbeats smart contract system.

This tool uses the Ethereum mainnet as its data source. We try to include at least one public json rpc url as part of the cli, so everything might *just work* for you, but if it doesn't...

We recommend getting a free account from [Infura](https://infura.io) or [Alchemy](https://alchemyapi.io) to get a reliable provider if you don't already have one.  See the [Ethereum Nodes](https://ethereumnodes.com/) site for an up-to-date list of nodes that are available.

Some commands allow you to get the state of the blockchain at a certain point in time (for example, all print holders at a specific block number).  These may require what is called an _archive node_, so you'll need to ensure the node you are using has this capability.  Alchemy includes this in their free plan.

Join the #dev channel on our [Discord server](https://discord.gg/zmkpBsE4Me) for updates, tips & tricks and more.

## Installation

To install the `eb` tool, we currently recommend using the latest version in this repo, as we are actively working on it.  Once we have a stable version published to npm, we'll update accordingly!

    $ git clone https://github.com/EulerBeats/eulerbeats-cli
    $ cd eulerbeats-cli
    $ yarn


Once it's installed, just run this command and follow its instructions:

    $ yarn eb

## JSON RPC Configuration

Internally the program does one of the following:

1. Look for a URL passed via `--rpc`.
2. Look at the environment variable `PROVIDER_URL` (you can use a `.env` file in the root of this project, which is git-ignored).
3. Fallback to a hardcoded, unreliable, public provider url.

## Development

We would love to have your helping hand on eulerbeats-cli! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on what we're looking for and how to get started.
