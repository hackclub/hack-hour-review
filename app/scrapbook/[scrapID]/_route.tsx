import { NextResponse } from "next/server";
import { getScrapbookRecord } from "app/lib/slack";

type Params = {
  scrapID: string;
};

export async function GET(req: Request, ctx: { params: Params }) {
  const rec = await getScrapbookRecord({ recordID: ctx.params.scrapID });
  return NextResponse.redirect(
    `${req.url}/session/${rec.fields["Sessions"][0]}`
  );
}
