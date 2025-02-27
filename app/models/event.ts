import { DateTime } from "luxon";

import { BaseModel, column, hasMany, manyToMany } from "@adonisjs/lucid/orm";
import type { HasMany, ManyToMany } from "@adonisjs/lucid/types/relations";

import Email from "#models/email";

import Admin from "./admin.js";
import Participant from "./participant.js";
import Permission from "./permission.js";

// import Form from './Form.ts';

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare organizerId: number;

  @column()
  declare name: string;

  @column()
  declare description: string | null;

  @column()
  declare slug: string;

  @column.dateTime()
  declare startDate: DateTime;

  @column.dateTime()
  declare endDate: DateTime;

  @column()
  declare firstFormId: number | null;

  @column()
  declare lat: number | null;

  @column()
  declare long: number | null;

  @column()
  declare primaryColor: string | null;

  @column()
  declare organizer: string | null;

  @column()
  declare participantsCount: number | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @column()
  declare photoUrl: string | null;

  @manyToMany(() => Admin, {
    pivotTable: "admin_permissions",
    pivotColumns: ["permission_id"],
    pivotTimestamps: true,
  })
  declare admins: ManyToMany<typeof Admin>;

  @manyToMany(() => Permission, {
    pivotTable: "admin_permissions",
    pivotColumns: ["admin_id"],
    pivotTimestamps: true,
  })
  declare permissions: ManyToMany<typeof Permission>;

  // @belongsTo(() => Form)
  // public firstForm: BelongsTo<typeof Form>;

  @hasMany(() => Participant)
  declare participants: HasMany<typeof Participant>;

  @hasMany(() => Email)
  declare emails: HasMany<typeof Email>;

  @column()
  declare socialMediaLinks: string[] | null;
}
