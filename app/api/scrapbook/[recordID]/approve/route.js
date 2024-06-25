import { approveScrapbook } from '../../../../lib/slack'

// POST /api/scrapbook/[recordID]/approve
export async function POST(_req, {params}) {
  const { recordID } = params

  const result = await approveScrapbook({recordID})

  return Response.json( result )
}