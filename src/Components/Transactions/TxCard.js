import React, { Component } from 'react'
import { hashHistory } from 'react-router'
import abiDecoder from 'abi-decoder'
import connect from '../Helpers/connect'
import * as Transactions from '../../Actions/Transactions'
import SettingsService from '../../Services/Settings'

import Moment from 'react-moment'

import { Link } from 'react-router'

import DestinationAddress from './DestinationAddress'
import TransactionTypeBadge from './TransactionTypeBadge'
import FormattedEtherValue from '../../Elements/FormattedEtherValue'

class TxCard extends Component {
  constructor(props) {
    super(props)
    const Settings = new SettingsService()
    this.abi_decode = JSON.parse(Settings.get("abi.decode_abi"))
  }

  componentDidMount () {
    this.props.dispatch(Transactions.showTransaction(this.props.transactionHash))
  }

  render () {
    const tx = this.props.transactions.currentTransaction
    const receipt = this.props.transactions.currentTransactionReceipt

    if (!tx || !receipt) {
      return <div />
    }

    let decodedTxInput = <div />
    if (this.abi_decode && this.abi_decode !== '') {
      abiDecoder.addABI(this.abi_decode)
      try {
        const decodedJson = abiDecoder.decodeMethod(tx.input)
        decodedTxInput = (
          <main>
            <div>
              <div className="Label">Decoded TX DATA</div>
              <div className="Value">
                <pre>
                  {JSON.stringify(decodedJson, null, 2)}
                </pre>
              </div>
            </div>
          </main>
        )
      } catch (error) {
        console.log('ABI decoder failed with: ' + error)
      }
    }

    return (
      <section className="TxCard">
        <header>
          <button className="Button" onClick={hashHistory.goBack}>
            &larr; Back
          </button>

          <div className="Title">
            <h1>
              TX {tx.hash}
            </h1>
          </div>
        </header>

        <section className="Parties">
          <div className="From">
            <div className="Label">SENDER ADDRESS</div>
            <div className="Value">
              {tx.from}
            </div>
          </div>
          <DestinationAddress tx={tx} receipt={receipt} />
          <div>
            <div className="Value">
              <div className="Type">
                <TransactionTypeBadge tx={tx} receipt={receipt} />
              </div>
            </div>
          </div>

        </section>

        <section className="Gas">
          <div>
            <div className="Label">VALUE</div>
            <div className="Value">
              <FormattedEtherValue
                value={tx.value.toString()}
              />
            </div>
          </div>
          <div>
            <div className="Label">GAS USED</div>
            <div className="Value">
              {receipt.gasUsed}
            </div>
          </div>

          <div>
            <div className="Label">GAS PRICE</div>
            <div className="Value">
              {tx.gasPrice.toString()}
            </div>
          </div>

          <div>
            <div className="Label">GAS LIMIT</div>
            <div className="Value">
              {tx.gas}
            </div>
          </div>

          {/* <div>
            <div className="Label">MINED ON</div>
            <div className="Value">
              <Moment unix format="YYYY-MM-DD HH:mm:ss">
                {EtherUtil.bufferToInt(tx.block.header.timestamp)}
              </Moment>
            </div>
          </div> */}

          <div>
            <div className="Label">MINED IN BLOCK</div>
            <div className="Value">
              {receipt.blockNumber}
            </div>
          </div>
        </section>
        <main>
          <div>
            <div className="Label">TX DATA</div>
            <div className="Value">
              {tx.input}
            </div>
          </div>
        </main>
        { decodedTxInput }
      </section>
    )
  }
}

export default connect(TxCard, "transactions")
