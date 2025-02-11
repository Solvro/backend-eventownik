import Admin from "#models/admin";
import { OrganizerService } from "#services/organizer_service";
import {
  addOrganizerValidator,
  updateOrganizerPermissionsValidator,
} from "#validators/organizer";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

@inject()
export default class OrganizersController {
  //eslint-disable-next-line no-useless-constructor
  constructor(private organizerService: OrganizerService) {}

  /**
   * @index
   * @operationId getEventOrganizers
   * @description Returns an array of organizers of specified event
   * @tag organizers
   * @responseBody 200 - <Admin[]>
   */
  async index(context: HttpContext) {
    const eventId = +context.params.eventId;

    return await Admin.query()
      .select("firstName", "lastName", "email")
      .whereHas("events", (query) => query.where("events.id", eventId));
  }

  /**
   * @store
   * @operationId addEventOrganizer
   * @description Adds an admin as an event organizer
   * @requestBody <addOrganizerValidator>
   * @tag organizers
   */
  async store({ params, request }: HttpContext) {
    const eventId = +params.eventId;

    const organizerData = await addOrganizerValidator.validate(request.all());

    await this.organizerService.addOrganizer(eventId, organizerData);
  }

  /**
   * @show
   * @operationId getEventOrganizer
   * @description Returns organizer details
   * @tag organizers
   * @responseBody 200 - <Admin>
   * @responseBody 404 - { error: `Organizer with id {organizerId} does not exist` },
   */
  async show({ params }: HttpContext) {
    const eventId = +params.eventId;
    const organizerId = +params.id;

    const organizer = await Admin.query()
      .where("id", organizerId)
      .whereHas("events", (query) => query.where("events.id", eventId))
      .preload("permissions", (permissionsQuery) =>
        permissionsQuery.where("event_id", eventId),
      )
      .firstOrFail();

    return organizer;
  }

  /**
   * @update
   * @operationId updateOrganizerPermissions
   * @description Changes organizer's permissions to the ones specified in the request body
   * @tag organizers
   * @responseBody 200 - <Admin>
   * @responseBody 404 - { "message": "Row not found", "name": "Exception", "status": 404 }
   */
  async update({ params, request }: HttpContext) {
    const eventId = +params.eventId;
    const organizerId = +params.id;

    const permissionsIds = await updateOrganizerPermissionsValidator.validate(
      request.body(),
    );

    const updatedOrganizer = this.organizerService.updateOrganizerPermissions(
      organizerId,
      eventId,
      permissionsIds,
    );

    return updatedOrganizer;
  }
}
