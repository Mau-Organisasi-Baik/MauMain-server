import { Router } from "express";
import reservationRoutes from "./reservations";

const router = Router();

router.use("/reservations", reservationRoutes);

export default router;
