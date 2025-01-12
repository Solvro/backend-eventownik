import Permission from "#models/permission";
import { BaseSeeder } from "@adonisjs/lucid/seeders";

export default class extends BaseSeeder {
  async run() {
    await Permission.updateOrCreateMany(
      ["action", "subject"],
      [
        { action: "update", subject: "event" },
        { action: "delete", subject: "event" },
        { action: "read", subject: "forms" },
        { action: "update", subject: "forms" },
        { action: "delete", subject: "forms" },
      ],
    );
  }
}
