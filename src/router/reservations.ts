import { Router } from "express";
import { playerAuthorization } from "../../src/middlewares/authorization";
import ReservationController from "../../src/controllers/ReservationController";

const router = Router();

router.post("/", playerAuthorization, ReservationController.postReservation);
router.get("/:reservationId", playerAuthorization, ReservationController.getReservationById);
router.put("/:reservationId/join", playerAuthorization, ReservationController.joinReservation);
router.put("/:reservationId/leave", playerAuthorization, ReservationController.leaveReservation);

export default router;
