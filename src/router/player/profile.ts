import { Router } from "express";
import { playerAuthorization } from "../../middlewares/authorization";
import { PlayerProfileController } from "../../../src/controllers/player/ProfileController";

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get("/", playerAuthorization, PlayerProfileController.getCurrentProfile);
router.get("/:playerId", playerAuthorization, PlayerProfileController.getProfileById);
router.post("/", playerAuthorization, upload.single("photo"), PlayerProfileController.createProfile);
router.put("/", playerAuthorization, upload.single("photo"), PlayerProfileController.updateProfile);

export default router;
