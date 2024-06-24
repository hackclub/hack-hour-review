import { getAllScrapbooks } from "../../../lib/slack";
export async function GET(_req) {
  const scrapbooks = await getAllScrapbooks();
  return Response.json({ scrapbooks });
}
