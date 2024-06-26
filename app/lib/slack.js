"use server";
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

export async function getUserRecord({ recordID, token = null }) {
  const airtableToken = token || process.env.AIRTABLE_TOKEN;
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const table = base("Users");
  const record = await table.find(recordID);
  return record;
}

export async function getUserProfile({ slackID, token = null }) {
  const slackToken = token || process.env.SLACK_TOKEN;
  if (!slackID || !slackToken) {
    throw new Error("slackID and slackToken is required");
  }

  const response = await fetch(
    `https://slack.com/api/users.profile.get?user=${slackID}`,
    {
      headers: { Authorization: `Bearer ${slackToken}` },
    }
  ).then((r) => r.json());

  return {
    username: response?.profile?.display_name,
    avatar: response?.profile?.image_192,
  }
}

export async function getDataForReview({
  scrapbookRecordID,
  airtableToken,
  slackToken,
  includeSessions = true,
  includeMessages = true,
}) {
  const result = {};

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

  // create a set of jobs to do in parallel
  const jobs = [];

  // fill in user data
  const userID = scrapbookRecord.get("User")[0];
  jobs.push(
    getUserRecord({ recordID: userID, token: airtableToken }).then(
      (userRecord) => {
        result.user = {
          id: userRecord.id,
          name: userRecord.get("Name") || "",
          slackID: userRecord.get("Slack ID") || "",
          earnedTickets:
            Math.floor(userRecord.get("Minutes (Banked)") / 60) || 0,
        };
      }
    )
  );

  if (includeMessages) {
    // fill in slack messages for scrapbook
    jobs.push(
      getSlackThread({
        threadTS: result.scrap.slackTS,
        channel: scrapbookChannel,
        token: slackToken,
      }).then((messages) => {
        result.scrap.messages = messages;
      })
    );
  }

  // fill in linked sessions
  if (includeSessions) {
    const sessionIDs = result.scrap.sessionIDs;
    for (let i = 0; i < sessionIDs.length; i++) {
      const sessionID = sessionIDs[i];
      jobs.push(
        getArcadeRecord({ recordID: sessionID, token: airtableToken }).then(
          async (record) => {
            const sessionFields = {
              id: record.id,
              slackURL: record.get("Code URL") || "",
              minutes: record.get("Minutes") || 0,
              percent: record.get("Percent") || 0.0, // watch out for this field– it's between 0-1
              status: record.get("Status") || "",
              slackTS: record.get("Message TS") || "",
              messages: [], // will code this later
            };
            if (includeMessages) {
              await getSlackThread({
                threadTS: sessionFields.slackTS,
                channel: arcadeChannel,
                token: slackToken,
              }).then((messages) => {
                sessionFields.messages = messages;
              });
            }
            result.scrap.sessions.push(sessionFields);
          }
        )
      );
    }
  }

  // how have we strayed so far from his light?
  await Promise.all(jobs);

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
  const records = await table
    .select({
      filterByFormula: "NOT({Approved})",
    })
    .all();
  return records.map((r) => r.id);
}

// export async function getNameByScrapId(id, { token = null } = {}) {
//   const airtableToken = token || process.env.AIRTABLE_TOKEN;
//   const baseID = "app4kCWulfB02bV8Q";
//   const base = new Airtable({ apiKey: airtableToken }).base(baseID);
//   const usersTable = base("Users");
//   const scrapTable = base("Scrapbook");
//   return (await usersTable.find((await scrapTable.find(id)).fields["User"])) // for some reason, tsc says this await isn't required. it is
//     .fields["Name"];
// }

export async function updateSession({
  recordID,
  status = null,
  percent = null,
  token = null,
}) {
  if (!recordID) {
    throw new Error("recordID is required");
  }
  if (!["Approved", "Rejected", "Unreviewed"].includes(status)) {
    throw new Error('status must be "Approved" or "Rejected" or "Unreviewed');
  }

  const airtableToken = token || process.env.AIRTABLE_TOKEN;
  const Airtable = require("airtable");
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const table = base("Sessions");

  const fieldsToUpdate = {};
  if (status) {
    fieldsToUpdate.Status = status;
  }
  if (percent != null) {
    fieldsToUpdate.Percent = percent;
  }

  const record = await table.update(recordID, fieldsToUpdate);
  return record;
}

export async function approveScrapbook({ scrapbookRecordID, token = null }) {
  if (!scrapbookRecordID) {
    throw new Error("scrapbookRecordID is required");
  }

  const airtableToken = token || process.env.AIRTABLE_TOKEN;

  const Airtable = require("airtable");
  const baseID = "app4kCWulfB02bV8Q";
  const base = new Airtable({ apiKey: airtableToken }).base(baseID);
  const table = base("Scrapbook");

  const record = table.update(scrapbookRecordID, { Approved: true });
  return record;
}

// async function test() {
//   const result = await getDataForReview({scrapbookRecordID: 'reccPeTHeCNymBT9Y'})
//   console.log({result})
// }

// test()
