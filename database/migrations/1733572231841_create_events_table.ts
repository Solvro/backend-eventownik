import { BaseSchema } from "@adonisjs/lucid/schema";

export default class EventsSchema extends BaseSchema {
  protected tableName = "events";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .integer("organizer_id")
        .unsigned()
        .references("admins.id")
        .onDelete("CASCADE");
      table.string("name", 255).notNullable();
      table.text("description", "long").nullable();
      table.string("slug", 255).notNullable();
      table.timestamp("start_date").notNullable();
      table.timestamp("end_date").notNullable();
      table
        .integer("first_form_id")
        .unsigned()
        .references("forms.id")
        .onDelete("CASCADE");
      table.float("lat").nullable();
      table.float("long").nullable();
      table.string("primary_color", 12);
      table.string("secondary_color", 12);
      table.timestamps();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
