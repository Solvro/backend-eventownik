import { inject } from "@adonisjs/core";
import { MultipartFile } from "@adonisjs/core/bodyparser";
import { Exception } from "@adonisjs/core/exceptions";

import Event from "#models/event";
import Form from "#models/form";
import Participant from "#models/participant";

import { FormSubmitDTO } from "../types/form_types.js";
import { filterObjectFields } from "../utils/filter_object_fields.js";
import { FileService } from "./file_service.js";
import { ParticipantService } from "./participant_service.js";

@inject()
export class FormService {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private participantService: ParticipantService,
    private fileService: FileService,
  ) {}

  async submitForm(
    eventSlug: string,
    formId: number,
    formSubmitDTO: FormSubmitDTO,
  ): Promise<void | { status: number; error: object }> {
    const event = await Event.findByOrFail("slug", eventSlug);

    const form = await Form.query()
      .where("id", formId)
      .andWhere("event_id", event.id)
      .preload("attributes", async (query) => {
        await query.pivotColumns(["is_required"]);
      })
      .firstOrFail();

    const {
      email: participantEmail,
      participantSlug,
      ...attributes
    } = formSubmitDTO;

    if (form.isFirstForm && participantEmail === undefined) {
      return {
        status: 400,
        error: { missingRequiredFields: { name: "email" } },
      };
    } else if (!form.isFirstForm && participantSlug === undefined) {
      return {
        status: 400,
        error: { missingRequiredFields: { name: "participantSlug" } },
      };
    }

    const fileAttributesIds = new Set(
      form.attributes
        .filter((attribute) => attribute.type === "file")
        .map((attribute) => attribute.id),
    );

    const allowedFieldsIds = form.attributes.map((attribute) =>
      attribute.id.toString(),
    );

    const missingRequiredFields = form.attributes
      .filter((attribute) => attribute.$extras.pivot_is_required === true)
      .filter((attribute) => !(attribute.id in attributes))
      .map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
      }));

    if (missingRequiredFields.length > 0) {
      return {
        status: 400,
        error: { missingRequiredFields },
      };
    }

    const formFields = filterObjectFields(attributes, allowedFieldsIds);

    const transformedFormFields = await Promise.all(
      Object.entries(formFields).map(async ([attributeId, value]) => {
        if (fileAttributesIds.has(+attributeId)) {
          const fileName = await this.fileService.storeFile(
            value as MultipartFile,
          );

          if (fileName === undefined) {
            throw new Exception("Error while saving a file");
          }

          return {
            attributeId: +attributeId,
            value: fileName,
          };
        }

        return {
          attributeId: +attributeId,
          value: value as string,
        };
      }),
    );

    if (participantEmail !== undefined) {
      await this.participantService.createParticipant(event.id, {
        email: participantEmail,
        participantAttributes: transformedFormFields,
      });
    } else if (participantSlug !== undefined) {
      const participant = await Participant.findByOrFail(
        "slug",
        participantSlug,
      );
      await this.participantService.updateParticipant(
        event.id,
        participant.id,
        { email: undefined, participantAttributes: transformedFormFields },
      );
    }
  }
}
