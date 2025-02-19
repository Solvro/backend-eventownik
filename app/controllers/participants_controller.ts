import { HttpContext } from "@adonisjs/core/http";

import Participant from "#models/participant";
import ParticipantAttribute from "#models/participant_attribute";
import { participantAttributesStoreValidator } from "#validators/participant_attributes";
import {
  participantsStoreValidator,
  participantsUpdateValidator,
} from "#validators/participants";


export default class ParticipantsController {
  /**
   * @index
   * @tag participants
   */
  async index({ params, request }: HttpContext) {
  const page = request.input('page', 1);
  const limit = request.input('limit', 10);
  const participants = await Participant.query()
    .where('event_id', params.event_id)
    .preload('participant_attributes', (query) => {
      query
        .select('id', 'attribute_id', 'value', 'participant_id')
        .preload('attribute', (attributeQuery) => {
          attributeQuery
          .select('name', "slug")
          .where('show_in_list', true);
        });
    })
    .paginate(page, limit);
  const serialized_participants = participants.serialize({
    fields: {
      omit: ["eventId"]
    },
    relations:{
      participant_attributes:{
        fields: ["id","value"],
        relations: {
          attribute: {
            fields: ["id", "name", "slug"]
          }
        }
      }
    }
}
);
  const participantsJson = serialized_participants.data.map((participants) => {
    return {
      id: participants.id,
      email: participants.email,
      firstName: participants.firstName,
      lastName: participants.lastName,
      slug: participants.slug,
      createdAt: participants.createdAt,
      updatedAt: participants.updatedAt,
      attributes: participants.participant_attributes.map((attribute: any) => {
        return {
          id: attribute.attribute.id,
          name: attribute.attribute.name,
          slug: attribute.attribute.slug,
          participantAttributes: {
            id: attribute.id,
            value: attribute.value
          }
        }
      })
    }
  })
  return participantsJson;
}

  async store({ request, response }: HttpContext) {
    const participant_data = await participantsStoreValidator.validate(request.all());
    const participant_attributes = await participantAttributesStoreValidator.validate(request.all());
    const participant = await Participant.create(participant_data);
    // participant.related('participant_attributes').createMany(request.body()['participant_attributes']);
    const participantAttributes = request.body()['participant_attributes'];

    for (const attribute of participantAttributes ){
      const attribute_data = await participantAttributesStoreValidator.validate(
      {"participantId": participant.id,
       "attributeId": attribute['attributeId'],
        "value": attribute['value']
      }
    );
    await ParticipantAttribute.create(attribute_data);
    }

    participant.related('participant_attributes').createMany(participant_attributes.participantAttributes);
    return response.status(201).send(participant);
  }

  /**
   * @show
   * @tag participants
   */
  async show({ params }: HttpContext) {
    return await Participant.findOrFail(params.id);
  }

  /**
   * @update
   * @tag participants
   */
  async update({ params, request }: HttpContext) {
    const data = await participantsUpdateValidator.validate(request.all());
    const participant = await Participant.findOrFail(params.id);
    participant.merge(data);
    await participant.save();
    return { message: `Participant successfully updated.`, participant };
  }

  /**
   * @destroy
   * @tag participants
   */
  async destroy({ params }: HttpContext) {
    const participant = await Participant.findOrFail(params.id);
    await participant.delete();
    return { message: `Participant successfully deleted.` };
  }

  async attachEmail({ params, request, response }: HttpContext) {
    const participant = await Participant.findOrFail(params.id);

    const emailId = request.input("email_id") as number;
    const pivotData = request.only(["send_at", "send_by", "status"]) as {
      send_at?: string;
      send_by?: string;
      status?: string;
    };

    // const email = await Email.findOrFail(emailId);

    await participant.related("emails").attach({ [emailId]: pivotData });

    return response.status(201).send({ message: "Email successfully sent" });
  }
}
