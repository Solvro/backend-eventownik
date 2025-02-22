import { HttpContext } from "@adonisjs/core/http";

import Email from "#models/email";
import Event from "#models/event";
import {
  emailsStoreValidator,
  emailsUpdateValidator,
} from "#validators/emails";

export default class EmailsController {
  /**
   * @index
   * @operationId listEmails
   * @description Retrieve a list of emails for a specific event without content, along with their sending status.
   * @tag emails
   * @responseBody 200 - [ { "id": 1, "eventId": 5, "name": "test124", "trigger": "participant_registered", "triggerValue": "", "createdAt": "2025-02-22T19:13:10.471+00:00", "updatedAt": "2025-02-22T19:13:10.471+00:00", "meta": { "failedCount": "1", "pendingCount": "1", "sentCount": "0" } } ]
   */
  async index({ params, bouncer }: HttpContext) {
    const eventId = Number(params.eventId);
    await bouncer.authorize("manage_email", await Event.findOrFail(eventId));

    const emails = await Email.query()
      .where("event_id", eventId)
      .select([
        "id",
        "name",
        "trigger",
        "trigger_value",
        "created_at",
        "updated_at",
      ])
      .withCount("participants", (q) =>
        q.where("status", "failed").as("failedCount"),
      )
      .withCount("participants", (q) =>
        q.where("status", "pending").as("pendingCount"),
      )
      .withCount("participants", (q) =>
        q.where("status", "sent").as("sentCount"),
      );

    return emails;
  }

  /**
   * @show
   * @operationId getEmail
   * @description Retrieve details of a specific email linked to an event.
   * @tag emails
   * @responseBody 200 - { "id": 1, "eventId": 5, "name": "test124", "content": "uuuu", "trigger": "participant_registered", "triggerValue": "eeee", "createdAt": "2025-02-22T19:13:10.471+00:00", "updatedAt": "2025-02-22T19:13:10.471+00:00", "participants": [ { "id": 4, "email": "dasd", "eventId": 5, "firstName": "fdf", "lastName": "fddfd", "createdAt": "2002-12-10 23:00:00", "updatedAt": null, "meta": { "pivot_status": "failed", "pivot_email_id": 1, "pivot_participant_id": 4, "pivot_send_at": null, "pivot_send_by": null } }, { "id": 4, "email": "dasd", "eventId": 5, "firstName": "fdf", "lastName": "fddfd", "createdAt": "2002-12-10 23:00:00", "updatedAt": null, "meta": { "pivot_status": "pending", "pivot_email_id": 1, "pivot_participant_id": 4, "pivot_send_at": null, "pivot_send_by": null } } ] }
   * @responseBody 404 - {"message": "Email not found"}
   */
  async show({ params, bouncer }: HttpContext) {
    const emailId = +params.id;
    const event = await Event.findOrFail(params.eventId);
    await bouncer.authorize("manage_email", event);

    const email = Email.query()
      .preload("participants", (q) => q.pivotColumns(["status"]))
      .where("id", emailId)
      .where("event_id", event.id)
      .firstOrFail();

    return email;
  }

  /**
   * @store
   * @operationId createEmail
   * @description Create a new email associated with a specific event.
   * @tag emails
   * @requestBody <emailsStoreValidator>
   * @responseBody 201 - {"id": 1, "name": "Email Name", "content": "Email Content", "trigger": "participant_registered"}
   * @responseBody 400 - {"message": "Failed to create email"}
   */
  async store({ params, request, response, bouncer }: HttpContext) {
    const event = await Event.findOrFail(+params.eventId);
    await bouncer.authorize("manage_email", event);

    const data = await request.validateUsing(emailsStoreValidator);

    const email = await event
      .related("emails")
      .create({ eventId: event.id, ...data });

    return response.status(201).send(email);
  }

  /**
   * @update
   * @operationId updateEmail
   * @description Update an existing email associated with a specific event and return the updated email.
   * @tag emails
   * @requestBody <emailsUpdateValidator>
   * @responseBody 200 - {"id": 1, "name": "Updated Name", "content": "Updated Content", "trigger": "form_filled"}
   */
  async update({ params, request, bouncer }: HttpContext) {
    await bouncer.authorize(
      "manage_email",
      await Event.findOrFail(params.eventId),
    );

    const data = await request.validateUsing(emailsUpdateValidator);
    const emailId = Number(params.id);
    const email = await Email.findOrFail(emailId);

    await email.merge(data).save();

    return email;
  }

  /**
   * @destroy
   * @operationId deleteEmail
   * @description Remove an email associated with a specific event.
   * @tag emails
   * @responseBody 204 - {}
   */
  async destroy({ params, response }: HttpContext) {
    const emailId = Number(params.id);
    const email = await Email.findOrFail(emailId);

    await email.related("participants").detach();
    await email.delete();

    return response.noContent();
  }
}
