const scrapbookChannel = "C01504DCLVD";
const arcadeChannel = "C06SBHMQU8G";

import Airtable from "airtable";

export async function getSlackThread({
  threadTS,
  channel,
  token = null,
  page = 1,
}) {
  const slackToken = token || process.env.SLACK_TOKEN;
  if (!threadTS || !channel) {
    throw new Error("threadTS and channel are required");
  }
  if (!slackToken) {
    throw new Error("SLACK_TOKEN is required");
  }

  const response = await fetch(
    `https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTS}`,
    {
      headers: { Authorization: `Bearer ${slackToken}` },
    }
  ).then((r) => r.json());

  const { messages, has_more } = response;
  if (has_more) {
    const nextMessages = await getSlackThread({
      threadTS,
      channel,
      token: slackToken,
      page: page + 1,
    });
    messages.push(...nextMessages);
  }
  return messages;
}

export async function getScrapbookRecord({ recordID, token = null }) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN;
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const table = base("Scrapbook");
  const record = await table.find(recordID);
  return record;
}

export async function getArcadeRecord({ recordID, token = null }) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN;
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const table = base("Sessions");
  const record = await table.find(recordID);
  return record;
}

export async function getDataForReview({scrapbookRecordID, airtableToken, slackToken, includeSessions = true, includeMessages = true}) {
  const result = {}

  // get the main scrapbook record
  const scrapbookRecord = await getScrapbookRecord({
    recordID: scrapbookRecordID,
    token: airtableToken,
  });
  result.scrap = {
    id: scrapbookRecord.id,
    slackURL: scrapbookRecord.get("Scrapbook URL") || "",
    sessionIDs: scrapbookRecord.get("Sessions") || [],
    sessions: [], // will code this later
    messages: [],
    slackTS: scrapbookRecord.get("Scrapbook TS") || "",
    approved: scrapbookRecord.get("Approved") || false,
  };

  // fill in slack messages for scrapbook
  if (includeMessages) {
    const slackScrapbookThread = await getSlackThread({threadTS: result.scrap.slackTS, channel: scrapbookChannel, token: slackToken})
    result.scrap.messages = slackScrapbookThread
  }

  // fill in linked sessions
  if (includeSessions) {
    const sessionIDs = result.scrap.sessionIDs
    for (let i = 0; i < sessionIDs.length; i++) {
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
      if (includeMessages) {
        sessionFields.messages = await getSlackThread({threadTS: sessionFields.slackTS, channel: arcadeChannel, token: slackToken})
        result.scrap.sessions.push(sessionFields)
      }
    }
  }

  return result;
}

export async function getAllScrapbooks({ token = null } = {}) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN;
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const table = base("Scrapbook");
  const records = await table.select().all();
  return records.map((r) => r.id);
}

export async function getUnreviewedScrapbooks({ token = null } = {}) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN;
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const table = base("Scrapbook");
  const records = await table.select({
    filterByFormula: "NOT({Approved})",
  }).all();
  return records.map((r) => r.id);
}

export async function getNameByScrapId(id, { token = null } = {}) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN;
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const usersTable = base("Users");
  const scrapTable = base("Scrapbook");
  return (await usersTable.find((await scrapTable.find(id)).fields["User"])) // for some reason, tsc says this await isn't required. it is
    .fields["Name"];
}

export async function updateSession({recordID, status = null, percent = null, token = null}) {
  if (!recordID) { throw new Error('recordID is required') }
  if (!['Approved', 'Rejected', 'Unreviewed'].includes(status)) { throw new Error('status must be "Approved" or "Rejected" or "Unreviewed') }

  const airtableToken = token || process.env.AIRTABLE_TOKEN
  const Airtable = require('airtable')
  const baseID = "app4kCWulfB02bV8Q"
  const base = new Airtable({ apiKey: airtableToken }).base(baseID)
  const table = base('Sessions')

  const fieldsToUpdate = {}
  if (status) { fieldsToUpdate.Status = status }
  if (percent != null) { fieldsToUpdate.Percent = percent }

  const record = await table.update(recordID, fieldsToUpdate)
  return record
}

export async function attemptApproveScrapbook({scrapbookRecordID, airtableToken}) {
  // if all sessions are reviewed, mark as approved.
  // if some sessions are unreviewed, do nothing.
  if (!scrapbookRecordID) { throw new Error('scrapbookRecordID is required') }

  const airtableToken = token || process.env.AIRTABLE_TOKEN

  const Airtable = require('airtable')
  const baseID = "app4kCWulfB02bV8Q"
  const base = new Airtable({ apiKey: airtableToken }).base(baseID)
  const table = base('Scrapbook')
  const record = await table.find(scrapbookRecordID)
}

// async function test() {
//   const result = await getDataForReview({scrapbookRecordID: 'reccPeTHeCNymBT9Y'})
//   console.log({result})
// }

// test()
