"use server"

import { getUserProfile } from "../../../lib/slack"

// GET /api/user/[slackID]
export async function GET(_req, {params}) {
    const { slackID } = params
  
    const result = await getUserProfile({slackID})
  
    return Response.json( result )
  }