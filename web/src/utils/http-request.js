export const GET = 'GET'
export const POST = 'POST'
export const PUT = 'PUT'
export const DELETE = 'DELETE'


export function httpGet(uri, params, query) {
  return httpRequest(GET, uri, params, query)
}

export function httpPost(uri, params, query) {
  return httpRequest(POST, uri, params, query)
}

export function httpPut(uri, params, query) {
  return httpRequest(PUT, uri, params, query)
}

export function httpDelete(uri, params, query) {
  return httpRequest(DELETE, uri, params, query)
}


export default function httpRequest(method, uri, params, query) {
  if (DEBUG) {
    console.debug(`${method} ${uri}${ params ? ' ' + JSON.stringify(params, null, '  ') : '' }`)
  }
  if (method == GET && arguments.length == 3) {
    query = params
    params = undefined
  }
  let headers = new Headers({
    'Accept': 'application/json',
  })
  let body; if (params) {
    body = JSON.stringify(params)
    headers.set('Content-Type', 'application/json')
  }
  return fetch(uri + buildQuery(query), {
    method,
    body,
    headers,
  })
  .then(validateResponseStatus)
  .then(resp => resp.json())
}


function buildQuery(query) {
  if (!query) {
    return ''
  }
  return ('?' + Object.keys(query)
    .map(param => `${ encodeURIComponent(param) }=${ encodeURIComponent(query[ param ]) }`)
    .join('&')
  )
}


function validateResponseStatus(resp) {
  if (resp.headers.get('warning')) {
    console.warn(resp.headers.get('warning'))
  }

  if (resp.status >= 200 && resp.status < 300) {
    return resp
  }

  return resp.text().then(respText => {
    const err = new Error(
      `unexpected status ${ resp.status } ${ resp.statusText }, response text: "${respText}"`)
    err.status = resp.status
    err.statusText = resp.statusText
    err.responseText = respText
    return Promise.reject(err)
  })
}
