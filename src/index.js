import fetch from 'node-fetch'
import kdj from 'kdj'
import cool from 'cool-ascii-faces'

const {PAGE_TOKEN, PHONE_NUMBER} = process.env

const GREETS = ['安安', '嗨嗨', '尼好']

const getGreet = () => GREETS[Math.floor(Math.random() * GREETS.length)]

const kFetcher = fetch('https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=%23001')
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

const priceFetcher0050 = fetch('https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=0050')
  .then(res => res.text())
  .then(text => JSON.parse(/.*\((.*)\)/.exec(text)[1]).ta)
  .then(tas => tas.reduce((acc, ta) => {
    acc.close.push(ta.c)
    acc.low.push(ta.l)
    acc.high.push(ta.h)
    return acc
  }, {close: [], low: [], high: [], tas}))
  .then(data => ({Ks: kdj(data.close, data.low, data.high).K, tas: data.tas}))
  .then(({Ks, tas}) => ({K: Ks[Ks.length - 1], t: tas[tas.length - 1]}))

const priceFetcher0056 = fetch('https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=0056')
  .then(res => res.text())
  .then(text => JSON.parse(/.*\((.*)\)/.exec(text)[1]).ta)
  .then(tas => tas.reduce((acc, ta) => {
    acc.close.push(ta.c)
    acc.low.push(ta.l)
    acc.high.push(ta.h)
    return acc
  }, {close: [], low: [], high: [], tas}))
  .then(data => ({Ks: kdj(data.close, data.low, data.high).K, tas: data.tas}))
  .then(({Ks, tas}) => ({K: Ks[Ks.length - 1], t: tas[tas.length - 1]}))

Promise.all([
  kFetcher,
  priceFetcher0050,
  priceFetcher0056,
])
  .then(([K, price0050, price0056]) => fetch(`https://graph.facebook.com/v3.0/me/messages?access_token=${PAGE_TOKEN}`, {
    method: 'post',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      recipient: {'phone_number': PHONE_NUMBER},
      message: {
        text: `${getGreet()}，${cool()}\
          \n大盤K值: ${new Number(K).toFixed(1)}\
          \n==================\
          \n0050 K值: ${new Number(price0050.K).toFixed(1)}\
          \n0050 收盤價: ${price0050.t.c}\
          \n0050 最高價: ${price0050.t.h}\
          \n0050 最低價: ${price0050.t.l}\
          \n0050 開盤價: ${price0050.t.o}\
          \n==================\
          \n0056 K值: ${new Number(price0056.K).toFixed(1)}\
          \n0056 收盤價: ${price0056.t.c}\
          \n0056 最高價: ${price0056.t.h}\
          \n0056 最低價: ${price0056.t.l}\
          \n0056 開盤價: ${price0056.t.o}\
          \n==================\
          \n資料時間: ${price0050.t.t}\
        `,
      },
    })
  }))
  .then(res => res.text())
  .then(console.log)