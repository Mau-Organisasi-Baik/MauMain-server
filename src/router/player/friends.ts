import { Router } from "express";
import { playerAuthorization } from "../../middlewares/authorization";
import PlayerReservationController from "../../controllers/player/ReservationController";
import { FriendController } from "../../controllers/FriendController";

const router = Router();

router.get("/", playerAuthorization, FriendController.getFriends)
router.post("/", playerAuthorization, FriendController.sendFriendRequest);
router.get("/pending", playerAuthorization, FriendController.getFriendRequests);
router.put("/:friendId/accept", playerAuthorization, FriendController.acceptFriendRequest);
router.delete("/:friendId/reject", playerAuthorization, FriendController.rejectFriendRequest);

export default router;
