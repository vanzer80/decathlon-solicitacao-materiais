import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { diagnoseWebhook } from "../services/webhookDiagnostic";

export const webhookRouter = router({
  diagnose: publicProcedure.query(async () => {
    const result = await diagnoseWebhook();
    return result;
  }),
});
