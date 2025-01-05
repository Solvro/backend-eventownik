import Event from "#models/event";
import { BaseModel, column, manyToMany } from "@adonisjs/lucid/orm";
import type { ManyToMany } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import { compose } from '@adonisjs/core/helpers'
import Permission from "./permission.js";
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'


const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class Admin extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare firstName: string;

  @column()
  declare lastName: string;

  @column({ serializeAs: null })
  declare password: string;

  @column()
  declare email: string;

  @column()
  declare type: "organizer" | "superadmin";

  @column()
  declare active: boolean;

  @manyToMany(() => Permission, {
    pivotTable: "admin_permissions",
    pivotColumns: ["event_id"],
    pivotTimestamps: true,
  })
  declare permissions: ManyToMany<typeof Permission>;

  @manyToMany(() => Event, {
    pivotTable: "admin_permissions",
    pivotColumns: ["permission_id"],
    pivotTimestamps: true,
  })
  declare events: ManyToMany<typeof Event>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  static accessTokens = DbAccessTokensProvider.forModel(Admin)
}
