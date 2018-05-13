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

const priceFetcher = fetch('https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=0050')
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
        text: `${getGreet()}，${cool()}\
          \n大盤K值: ${K}\
          \n0050 收盤價: ${price.c}\
          \n0050 最高價: ${price.h}\
          \n0050 最低價: ${price.l}\
          \n0050 開盤價: ${price.o}\
          \n0050 成交量: ${price.v}\
          \n最新時間: ${price.t}\
        `,
      },
    })
  }))
  .then(res => res.text())
  .then(console.log)