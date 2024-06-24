import { getAllScrapbooks } from "@/app/lib/slack"

export async function GET(_req) {
  const scrapbooks = await getAllScrapbooks()
  return Response.json({ scrapbooks })
}