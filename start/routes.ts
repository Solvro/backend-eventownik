import swagger from "#config/swagger";
import router from "@adonisjs/core/services/router";
import AutoSwagger from "adonis-autoswagger";

import { middleware } from "./kernel.js";

const ParticipantsController = () =>
  import("#controllers/participants_controller");
const AuthController = () => import("#controllers/auth_controller");

router.get("/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});
router.get("/docs", async () => {
    return AutoSwagger.default.scalar("/swagger")
});

router
  .group(() => {
    router.resource("participants", ParticipantsController).apiOnly();

    router
      .group(() => {
        router.post("login", [AuthController, "login"]);
        router.post("register", [AuthController, "register"]);
        router.get("me", [AuthController, "me"]).use(middleware.auth());
      })
      .prefix("auth");
  })
  .prefix("api/v1");
