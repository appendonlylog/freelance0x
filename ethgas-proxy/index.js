const Koa = require('koa')
const Router = require('koa-router')
const cache = require('koa-cache-lite')
const request = require('request-promise-native')
const compress = require('koa-compress')
const cors = require('koa2-cors')

const app = new Koa()
const router = new Router()


const ALLOWED_ORIGIN = /https?:[/][/]([^./]*[.])?(localhost|fl0x[.]io|freelance0x[.](com|io))(:\d+)?/

app.use(cors({
  origin: (ctx) => ALLOWED_ORIGIN.test(ctx.header.origin) ? ctx.header.origin : false
}))


const CACHE_FOR_MS = 1000 * 60 * 10 // 10 minutes

const requestTable = cacheFn(CACHE_FOR_MS, () => {
  console.log('Requesting from ethgasstation, now:', new Date())
  return request({
    method: 'GET',
    uri: 'https://ethgasstation.info/json/predictTable.json',
    headers: {
      'Host': 'ethgasstation.info',
      'Origin': 'https://ethgasstation.info',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Referer': 'https://ethgasstation.info/',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    json: true,
    gzip: true,
  })
})


router.get('/predictTable', async (ctx, next) => {
  ctx.compress = true
  ctx.body = await requestTable()
})


cache.configure({'/predictTable': CACHE_FOR_MS}, {
  debug: true,
  ignoreNoCache: true,
  vary: ['Accept-Encoding', 'Origin'],
})


app.use(cache.middleware())
app.use(compress())

app.use(router.routes())
app.listen(8080)


function cacheFn(timeoutMs, fn) {
  let lastCalledAt = 0
  let lastResult = null
  return () => {
    const now = Date.now()
    if (now - lastCalledAt > timeoutMs) {
      lastResult = fn()
      lastCalledAt = now
    }
    return lastResult
  }
}
