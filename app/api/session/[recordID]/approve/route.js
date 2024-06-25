"use server"

import { updateSession } from "../../../../lib/slack"

// POST /api/session/[recordID]/approve
export async function POST(_req, {params}) {
  const { recordID } = params

  const result = await updateSession({recordID, status: "Approved"})

  return Response.json( result )
}