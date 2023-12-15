import { Router } from "express";
import exploreRoutes from "./player/fields";

import reservationRoutes from "./reservations";
import fieldReservationRoutes from "./field/reservations";

const router = Router();

router.use("/fields", exploreRoutes);
router.use("/reservations", reservationRoutes);

router.use("/admin/reservations", fieldReservationRoutes);

export default router;
