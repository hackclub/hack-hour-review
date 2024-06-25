"use server"

import { updateSession } from "../../../../lib/slack"

// POST /api/session/[recordID]/reject
export async function POST(_req, {params}) {
  const { recordID } = params

  const result = await updateSession({recordID, status: "Rejected"})

  return Response.json( result )
}