const fetch = require('node-fetch')
const { t: typy } = require('typy')
const { mapApiItems, requestHeaders, isAuthorized } = require('./shared/helpers')
const { successResponse, errorResponse } = require('./shared/response')
const { sentryWrapper } = require('./shared/sentryWrapper')

module.exports.handler = sentryWrapper(async (event, context, callback) => {
  let netid = typy(event, 'requestContext.authorizer.netid').safeString
  const params = typy(event, 'queryStringParameters').safeObjectOrEmpty
  const filter = encodeURIComponent("(TransactionStatus ne 'Cancelled by ILL Staff')")
  const url = `${process.env.ILLIAD_URL}/${netid}?$filter=${filter}`

  if (!netid) {
    if (isAuthorized(event, callback)) {
      netid = params.netid
    } else {
      return
    }
  }

  console.log('requesting url', url)

  const response = await fetch(url, { headers: requestHeaders })
    .then(res => ({
      statusCode: res.status,
      data: res.ok ? res.json() : null,
    }))

  if (response.statusCode < 200 || response.statusCode >= 300) {
    return errorResponse(callback, null, response.statusCode)
  }

  const results = mapApiItems(response.data)
  return successResponse(callback, results)
})
