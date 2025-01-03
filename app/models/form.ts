import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, manyToMany } from '@adonisjs/lucid/orm';
import Event from '#models/event';
import Attribute from '#models/attribute';
import type { ManyToMany } from '@adonisjs/lucid/types/relations';


export default class Form extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare eventId: number;

  @column()
  declare isOpen: boolean;

  @column()
  declare description: string;

  @column()
  declare name: string;

  @column.dateTime()
  declare startDate: DateTime;

  @column.dateTime()
  declare endDate: DateTime | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>;

  @manyToMany(() => Attribute)
  declare attributes: ManyToMany<typeof Attribute>
}