import Admin from "#models/admin";

import { AdminCreateDTO, AdminUpdateDTO } from "../types/admin_types.js";

export class AdminService {
  async createAdmin(newAdminData: AdminCreateDTO) {
    const newAdmin = await Admin.create(newAdminData);

    if (newAdminData.permissions && newAdminData.permissions.length > 0) {
      await this.addAdminPermissions(newAdmin, newAdminData.permissions);
    }

    return newAdmin;
  }

  async addAdminPermissions(
    admin: Admin,
    permissions: { eventId: number; permissionId: number }[],
  ) {
    // Transform permissions to match database schema: event_id instead of eventId
    const transformedPermissions = Object.fromEntries(
      permissions.map((permission) => [
        permission.permissionId,
        { event_id: permission.eventId },
      ]),
    );

    await admin.related("permissions").attach(transformedPermissions);
  }

  async updateAdmin(adminId: number, adminUpdates: AdminUpdateDTO) {
    const admin = await Admin.findOrFail(adminId);

    admin.merge(adminUpdates);

    if (adminUpdates.permissions) {
      await this.addAdminPermissions(admin, adminUpdates.permissions);
    }

    await admin.save();

    return await Admin.findOrFail(adminId);
  }
}
