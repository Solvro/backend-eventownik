import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
// import Participant from './Participant'
import Attribute from './Attribute'


export default class ParticipantAttribute extends BaseModel {
  @column({ isPrimary: true })
  declare  id: number

  @column()
  declare participantId: number

  @column()
  declare  attributeId: number

  @column()
  declare  value: string | null

  @belongsTo(() => Participant, {
    foreignKey: 'participantId',
  })
  public participant: BelongsTo<typeof Participant>

  @belongsTo(() => Attribute, {
    foreignKey: 'attributeId',
  })
  public attribute: BelongsTo<typeof Attribute>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}