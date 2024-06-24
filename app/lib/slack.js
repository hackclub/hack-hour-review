async function getSlackThread({threadTS, channel, token = null}) {
const scrapbookChannel = 'C01504DCLVD'
const arcadeChannel = 'C06SBHMQU8G'

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

async function getArcadeRecord({recordID, token = null}) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN
  const Airtable = require('airtable')
  const baseID = "app4kCWulfB02bV8Q"
  const base = new Airtable({ apiKey: airtableToken }).base(baseID)
  const table = base('Sessions')
  const record = await table.find(recordID)
  return record
}

async function getDataForReview({scrapbookRecordID, airtableToken, slackToken}) {
  const result = {}

  // get the main scrapbook record
  const scrapbookRecord = await getScrapbookRecord({recordID: scrapbookRecordID, token: airtableToken})
  result.scrap = {
    id: scrapbookRecord.id,
    slackURL: scrapbookRecord.get('Scrapbook URL') || '',
    sessionIDs: scrapbookRecord.get('Sessions') || [],
    sessions: [], // will code this later
    messages: [],
    slackTS: scrapbookRecord.get('Scrapbook TS') || '',
    approved: scrapbookRecord.get('Approved') || false,
  }

  // fill in slack messages for scrapbook
  const slackScrapbookThread = await getSlackThread({threadTS: result.scrap.slackTS, channel: scrapbookChannel, token: slackToken})
  result.scrap.messages = slackScrapbookThread

  // fill in linked sessions
  const sessionIDs = result.scrap.sessionIDs
  for (i = 0; i < sessionIDs.length; i++) {
    const sessionID = sessionIDs[i]
    const record = await getArcadeRecord({recordID: sessionID, token: airtableToken})
    const sessionFields = {
      id: record.id,
      slackURL: record.get('Code URL') || '',
      minutes: record.get('Minutes') || 0,
      percent: record.get('Percent') || 0.0, // watch out for this field– it's between 0-1
      status: record.get('Status') || '',
      slackTS: record.get('Message TS') || '',
      messages: [], // will code this later
    }
    sessionFields.messages = await getSlackThread({threadTS: sessionFields.slackTS, channel: arcadeChannel, token: slackToken})
    result.scrap.sessions.push(sessionFields)
  }

  return result
}

async function test() {
  const result = await getDataForReview({scrapbookRecordID: 'reccPeTHeCNymBT9Y'})
  console.log({result})
}

test()