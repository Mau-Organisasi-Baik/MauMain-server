import { Router } from "express";
import { fieldAuthorization } from "../../../src/middlewares/authorization";
import ScheduleController from "../../../src/controllers/field/ScheduleController";

const router = Router();

router.get("/", fieldAuthorization, ScheduleController.getSchedules);
router.post("/", fieldAuthorization, ScheduleController.createSchedule);
router.delete("/:scheduleId", fieldAuthorization, ScheduleController.deleteSchedule);

export default router;
