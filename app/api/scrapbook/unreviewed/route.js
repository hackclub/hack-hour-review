import { getUnreviewedScrapbooks } from "../../../lib/slack";
export async function GET(_req) {
  const scrapbooks = await getUnreviewedScrapbooks();
  return Response.json({ scrapbooks });
}
