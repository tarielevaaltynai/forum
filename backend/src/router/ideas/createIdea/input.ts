import { z } from "zod";
import {
  zNickRequired,
  zStringMin,
  zStringRequired,
} from "@forum_project/shared/src/zod";
export const zCreateIdeaTrpcInput = z.object({
  name: zStringRequired,
  nick: zNickRequired,
  description: zStringRequired,
  text: zStringMin(10),
});
