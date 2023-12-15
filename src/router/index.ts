import { Router } from "express";
import reservationRoutes from "./reservations";
import fieldReservationRoutes from './field/reservations'

const router = Router();

router.use("/reservations", reservationRoutes);




router.use("/admin/reservations", fieldReservationRoutes)

export default router;
