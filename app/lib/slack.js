async function getSlackThread({threadTS, channel, token = null}) {
  const slackToken = token || process.env.SLACK_TOKEN
  if (!threadTS || !channel) { throw new Error('threadTS and channel are required') }
  if (!slackToken) { throw new Error('SLACK_TOKEN is required') }
  
  const response = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTS}`, {
    headers: { 'Authorization': `Bearer ${slackToken}` }
  })

  return response.json()
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
    messages: [], // will code this later
    ts: scrapbookRecord.get('Scrapbook TS') || '',
    approved: scrapbookRecord.get('Approved') || false,

    // URL: "https://arcade-session-url.com",
    //     mins: 60,
    //     percent: 100,
    //     status: "Unreviewed",
    //     ts: 1719041321.954869,
    //     id: "reccPeTHeCNymBT9Y",
    //     messages: [
    //       { type: "image", URL: "https://some-image-url.com" },
    //       { type: "link", URL: "https://github.com/hackclub/OnBoard" },
    //       { type: "text", contents: "I made my OnBoard PR!" },
    //     ],
  }
  return result
}

async function test() {
  const result = await getDataForReview({scrapbookRecordID: 'reccPeTHeCNymBT9Y'})
  console.log({result})
}

test()