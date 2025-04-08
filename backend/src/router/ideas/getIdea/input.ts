import { zStringRequired } from "@forum_project/shared/src/zod";
import { z } from "zod";

export const zGetIdeaTrpcInput = z.object({
  someNick: zStringRequired,
});
