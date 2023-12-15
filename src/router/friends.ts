import { Router } from "express";
import { playerAuthorization } from "../../src/middlewares/authorization";
import PlayerReservationController from "../controllers/player/ReservationController";
import { FriendController } from "../../src/controllers/FriendController";

const router = Router();

router.get("/", playerAuthorization, FriendController.getFriends)
router.post("/", playerAuthorization, FriendController.sendFriendRequest);
router.get("/pending", playerAuthorization, FriendController.getFriendRequests);
router.put("/:friendId/accept", playerAuthorization, FriendController.acceptFriendRequest);
router.delete("/:friendId/delete", playerAuthorization, FriendController.rejectFriendRequest);

export default router;
