import { Router } from "express";
import { playerAuthorization } from "../../src/middlewares/authorization";
import PlayerReservationController from "../controllers/player/ReservationController";

const router = Router();

router.post("/", playerAuthorization, PlayerReservationController.postReservation);
router.get("/:reservationId", playerAuthorization, PlayerReservationController.getReservationById);
router.put("/:reservationId/join", playerAuthorization, PlayerReservationController.joinReservation);
router.put("/:reservationId/leave", playerAuthorization, PlayerReservationController.leaveReservation);

export default router;
