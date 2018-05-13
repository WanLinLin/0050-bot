import fetch from 'node-fetch'
import kdj from 'kdj'

const {PAGE_TOKEN, PHONE_NUMBER} = process.env

const kFetcher = fetch('https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=%23001&callback=jQuery1113046182472349859216_1524904568790&_=1524904568792')
  .then(res => res.text())
  .then(text => JSON.parse(/.*\((.*)\)/.exec(text)[1]).ta)
  .then(tas => tas.reduce((acc, ta) => {
    acc.close.push(ta.c)
    acc.low.push(ta.l)
    acc.high.push(ta.h)
    return acc
  }, {close: [], low: [], high: []}))
  .then(data => kdj(data.close, data.low, data.high).K)
  .then(Ks => Ks[Ks.length - 1])

const priceFetcher = fetch('https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=0050&callback=jQuery111306968563702019166_1526120801969&_=1526120801971')
  .then(res => res.text())
  .then(text => JSON.parse(/.*\((.*)\)/.exec(text)[1]).ta)
  .then(tas => tas[tas.length - 1])

Promise.all([
  kFetcher,
  priceFetcher,
])
  .then(([K, price]) => fetch(`https://graph.facebook.com/v3.0/me/messages?access_token=${PAGE_TOKEN}`, {
    method: 'post',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      recipient: {'phone_number': PHONE_NUMBER},
      message: {
        text: `安安，今天大盤K值是「${K}」\
          \n0050 close: ${price.c}\
          \n0050 high: ${price.h}\
          \n0050 low: ${price.l}\
          \n0050 open: ${price.o}\
          \n0050 volume: ${price.v}\
        `,
      },
    })
  }))
  .then(res => res.text())
  .then(console.log)