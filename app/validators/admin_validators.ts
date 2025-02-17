import vine from "@vinejs/vine";
import { Infer } from "@vinejs/vine/types";

export const adminSchema = vine.object({
  firstName: vine.string(),
  lastName: vine.string(),
  password: vine.string(),
  email: vine
    .string()
    .email()
    .unique(
      async (db, value) =>
        !(await db.from("admins").where("email", value).first()),
    ),
  type: vine.enum(["organizer", "superadmin"]).optional(),
  active: vine.boolean().optional(),
  permissions: vine
    .array(
      vine.object({
        permissionId: vine
          .number()
          .exists({ table: "admin_permissions", column: "id" }),
        eventId: vine.number(),
      }),
    )
    .optional(),
});

export type AdminCreateDTO = Infer<typeof adminSchema>;

export const createAdminValidator = vine.compile(adminSchema);

export const updateAdminValidator = vine.compile(
  adminSchema.clone().optional(),
);
