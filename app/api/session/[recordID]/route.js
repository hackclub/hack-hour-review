import { getDataForReview } from "@/app/lib/slack"

export async function GET(_req, {params}) {
  const { recordID } = params

  const result = await getDataForReview({scrapbookRecordID: recordID})

  return Response.json({ ...result })
}