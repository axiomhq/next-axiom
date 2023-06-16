import { NextResponse } from "next/server";
import { withAxiom } from "next-axiom";

// customer doesn't receive logs starting from next-axiom@0.16.0
export const GET = withAxiom(async (req) => {
    const log = req.log;
    if (req.method === "GET") {
      log.info("🚀 webhook Received");
      log.info("🚀 Event handler Processed");
      await log.flush();
    }
    return NextResponse.json({ test: 'regression_1000' });
  });
