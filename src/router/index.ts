import { Router } from "express";
import exploreRoutes from "./player/fields";

import reservationRoutes from "./reservations";
import friendRoutes from "./player/friends";
import fieldReservationRoutes from "./field/reservations";
import fieldScheduleRoutes from "./field/schedules";

const router = Router();

router.use("/fields", exploreRoutes);
router.use("/reservations", reservationRoutes);
router.use("/friends", friendRoutes);

router.use("/admin/reservations", fieldReservationRoutes);
router.use("/admin/schedules", fieldScheduleRoutes);

export default router;
