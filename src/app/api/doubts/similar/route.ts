import { NextResponse } from "next/server";
import { findSimilarDoubts } from "@/lib/similarity";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const subject = searchParams.get("subject") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 4;

    if (!query.trim() || query.trim().length < 3) {
      return NextResponse.json([]);
    }

    const similar = await findSimilarDoubts(query, {
      subject,
      limit: Math.min(limit, 10),
      threshold: 15,
    });

    return NextResponse.json(similar);
  } catch (error) {
    console.error("SIMILAR_DOUBTS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
