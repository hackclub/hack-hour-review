async function getSlackThread({threadTS, channel, token = null}) {
const scrapbookChannel = 'C01504DCLVD'

async function getSlackThread({threadTS, channel, token = null, page = 1}) {
  const slackToken = token || process.env.SLACK_TOKEN
  if (!threadTS || !channel) { throw new Error('threadTS and channel are required') }
  if (!slackToken) { throw new Error('SLACK_TOKEN is required') }
  
  const response = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTS}`, {
    headers: { 'Authorization': `Bearer ${slackToken}` }
  }).then(r => r.json())

  const { messages, has_more } = response
  if (has_more) {
    const nextMessages = await getSlackThread({threadTS, channel, token: slackToken, page: page + 1})
    messages.push(...nextMessages)
  }
  return messages
}

async function getScrapbookRecord({recordID, token = null}) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN
  const Airtable = require('airtable')
  const baseID = "app4kCWulfB02bV8Q"
  const base = new Airtable({ apiKey: airtableToken }).base(baseID)
  const table = base('Scrapbook')
  const record = await table.find(recordID)
  return record
}

async function getDataForReview({scrapbookRecordID, airtableToken, slackToken}) {
  const result = {}
  const scrapbookRecord = await getScrapbookRecord({recordID: scrapbookRecordID, token: airtableToken})
  result.scrap = {
    id: scrapbookRecord.id,
    slackURL: scrapbookRecord.get('Scrapbook URL') || '',
    sessionIDs: scrapbookRecord.get('Session IDs') || [],
    sessions: [], // will code this later
    messages: [],
    slackTS: scrapbookRecord.get('Scrapbook TS') || '',
    approved: scrapbookRecord.get('Approved') || false,
  }
  const slackScrapbookThread = await getSlackThread({threadTS: result.scrap.slackTS, channel: scrapbookChannel, token: slackToken})
  result.scrap.messages = slackScrapbookThread
  return result
}

async function test() {
  const result = await getDataForReview({scrapbookRecordID: 'reccPeTHeCNymBT9Y'})
  console.log({result})
}

test()