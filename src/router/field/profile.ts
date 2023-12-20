import { Router } from "express";
import { fieldAuthorization } from "../../middlewares/authorization";
import { FieldProfileController } from "../../../src/controllers/field/ProfileController";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", FieldProfileController.getCurrentProfile);
router.post("/", upload.array("photos"), FieldProfileController.createProfile);

export default router;
