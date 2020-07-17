const fetch = require('node-fetch')
const { t: typy } = require('typy')
const { mapApiItems, requestHeaders } = require('./shared/helpers')
const { successResponse } = require('./shared/response')
const { sentryWrapper } = require('./shared/sentryWrapper')

module.exports.handler = sentryWrapper(async (event, context, callback) => {
  const netid = typy(event, 'requestContext.authorizer.netid').safeString
  const filter = encodeURIComponent("(TransactionStatus ne 'Cancelled by ILL Staff')")
  const url = `${process.env.ILLIAD_URL}/${netid}?$filter=${filter}`
  console.log('requesting url', url)

  const response = await fetch(url, { headers: requestHeaders })
    .then(res => ({
      statusCode: res.status,
      data: res.ok ? res.json() : null,
    }))

  if (response.statusCode < 200 || response.statusCode >= 300) {
    // Technically use success because we handled the http error
    return successResponse(callback, null, response.statusCode)
  }

  const results = mapApiItems(response.data)
  return successResponse(callback, results)
})
