import { BaseSchema } from "@adonisjs/lucid/schema";

export default class ParticipantEmailsSchema extends BaseSchema {
  protected tableName = "participant_emails";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .integer("participant_id")
        .unsigned()
        .references("id")
        .inTable("participants")
        .onDelete("CASCADE");
      table
        .integer("email_id")
        .unsigned()
        .references("id")
        .inTable("emails")
        .onDelete("CASCADE");
      table.timestamp("send_at", { useTz: true }).nullable();
      table.text("send_by").nullable();
      table
        .enum("status", ["pending", "sent", "failed"], {
          useNative: true,
          enumName: "email_status",
        })
        .notNullable();
      table.timestamps();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
    this.schema.raw('DROP TYPE IF EXISTS "email_status"');
  }
}
