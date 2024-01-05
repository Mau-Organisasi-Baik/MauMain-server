import { Router } from "express";

import exploreRoutes from "./player/fields";
import reservationRoutes from "./reservations";
import friendRoutes from "./player/friends";
import playerProfieRoutes from "./player/profile";
import inviteRoutes from "./player/invite";

import fieldReservationRoutes from "./field/reservations";
import fieldScheduleRoutes from "./field/schedules";
import fieldProfileRoutes from "./field/profile";

const router = Router();

router.use("/fields", exploreRoutes);
router.use("/reservations", reservationRoutes);
router.use("/friends", friendRoutes);
router.use("/profile", playerProfieRoutes);
router.use("/invite", inviteRoutes);

router.use("/admin/reservations", fieldReservationRoutes);
router.use("/admin/schedules", fieldScheduleRoutes);
router.use("/admin/profile", fieldProfileRoutes);

export default router;
