import { Router } from "express";
import { playerAuthorization } from "../../../src/middlewares/authorization";
import ExploreController from "../../../src/controllers/player/ExploreController";
import ReservationController from "../../../src/controllers/player/ReservationController";

const router = Router();

router.get("/explore", playerAuthorization, ExploreController.getLocation);
router.get("/:fieldId", playerAuthorization, ExploreController.getFieldById);
router.get("/:fieldId/reservations", playerAuthorization, ReservationController.getFieldReservations);

export default router;
