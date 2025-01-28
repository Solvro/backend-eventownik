import swagger from "#config/swagger";
import router from "@adonisjs/core/services/router";
import AutoSwagger from "adonis-autoswagger";
import { middleware } from "./kernel.js";


const BlocksController = () => import("#controllers/blocks_controller");
const EventController  = () => import ("#controllers/events_controller");
const ParticipantsController = () => import("#controllers/participants_controller");
const AuthController = () => import("#controllers/auth_controller");
const PermissionsController = () => import("#controllers/permissions_controller");
const AdminsController = () => import("#controllers/admins_controller");
const FormsController = () => import("#controllers/forms_controller");

router.get("/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});
router.get("/docs", async () => {
  return AutoSwagger.default.scalar("/swagger");
});

router
  .group(() => {
    router.resource("participants", ParticipantsController).apiOnly();
    router.resource("permissions", PermissionsController);
    router.resource("admins", AdminsController);
    router.resource("events", EventController);
    router.resource("blocks", BlocksController);

    router
      .group(() => {
        router.get('/', [FormsController, 'index'])
        router.post('/', [FormsController, 'store'])
        router.get('/:formId', [FormsController, 'show'])
        router.put('/:formId', [FormsController, 'update'])
        router.delete('/:formId', [FormsController, 'destroy'])
      })
      .prefix('/events/:id/forms')

    router
      .group(() => {
        router.post("login", [AuthController, "login"]);
        router.post("register", [AuthController, "register"]);
        router.get("me", [AuthController, "me"]).use(middleware.auth());
      })
      .prefix("auth");
  })
  .prefix("api/v1");
