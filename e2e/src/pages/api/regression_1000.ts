import { NextApiResponse } from "next";
import { withAxiom, AxiomAPIRequest } from "next-axiom";

// customer doesn't receive logs starting from 0.16.0
const handler = async (req: AxiomAPIRequest, res: NextApiResponse) => {
    const log = req.log;
    if (req.method === "GET") {
      log.info("🚀 Strava webhook Received");
      log.info("🚀 Event handler Processed");
      await log.flush();
    }
    return res.status(200).json({ status: "Process" });
  };

export default withAxiom(handler);
