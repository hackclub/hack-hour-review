import { updateSession } from "@/app/lib/slack"

// POST /api/session/[recordID]/approve
export async function POST(_req, {params}) {
  const { recordID } = params

  const result = await updateSession({recordID, status: "Rejected"})

  return Response.json( result )
}