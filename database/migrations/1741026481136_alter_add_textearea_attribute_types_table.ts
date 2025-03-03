import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "add_textearea_attribute_types";

  async up() {
    this.schema.raw(`
      ALTER TYPE attribute_type ADD VALUE 'textarea';
    `);
  }

  public async down() {
    this.schema.raw(`
      CREATE TYPE attribute_type_old AS ENUM ('text', 'number', 'file', 'select', 'block', 'date', 'time', 'datetime', 'email', 'tel', 'color', 'checkbox');

      UPDATE attributes SET type = 'text' WHERE type = 'textarea';

      ALTER TABLE attributes ALTER COLUMN type TYPE attribute_type_old USING type::text::attribute_type_old;

      DROP TYPE attribute_type;

      ALTER TYPE attribute_type_old RENAME TO attribute_type;
    `);
  }
}
