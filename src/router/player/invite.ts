import { Router } from "express";
import { playerAuthorization } from "../../../src/middlewares/authorization";
import { InviteController } from "../../../src/controllers/InviteController";

const router = Router();

router.get("/", playerAuthorization, InviteController.getInvitation);
router.post("/", playerAuthorization, InviteController.postInvitation);

export default router;
