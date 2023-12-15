import { Router } from "express";
import { fieldAuthorization } from "../../../src/middlewares/authorization";
import { FieldReservationController } from "../../controllers/field/ReservationController";

const router = Router();

router.get("/", fieldAuthorization, FieldReservationController.getReservations);
router.get("/:reservationId", fieldAuthorization, FieldReservationController.getReservationById);
router.put("/:reservationId/kick", fieldAuthorization, FieldReservationController.kickPlayerFromReservation);
router.put("/:reservationId/score", fieldAuthorization, FieldReservationController.scoreReservation);
router.delete("/:reservationId", fieldAuthorization, FieldReservationController.cancelReservation);

export default router;
