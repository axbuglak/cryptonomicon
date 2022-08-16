const tickersHandlers = new Map() // {}
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=3e6aa97e236e7ac4ec49a3ffb957e72ea388fecda806ed6161cba08a68b0a429`
)

const AGGREGATE_INDEX = '5'

socket.addEventListener('message', (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: message,
  } = JSON.parse(e.data)
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    if(message === 'INVALID_SUB') {
      const handler = JSON.parse(e.data).PARAMETER
      const coin = handler.split('~')[2]
      const tickers = tickersHandlers.get(coin) ?? []
      tickers.forEach(fn => fn(newPrice, message))
    }
    return
  }
  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach((fn) => fn(newPrice))
})

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage)
    },
    { once: true }
  )
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
  subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}



export const loadCoins = () =>
  fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true')
    .then((response) => response.json())
    .then((coinData) => {
      const coins = Object.keys(coinData.Data)
      return coins.map((coin) => coinData.Data[coin].Symbol)
    })
