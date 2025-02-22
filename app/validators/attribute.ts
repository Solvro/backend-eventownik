import vine from "@vinejs/vine";

export const createAttributeSchema = vine.object({
  name: vine.string(),
  slug: vine.string().nullable().optional(),
  type: vine.enum([
    "text",
    "number",
    "file",
    "select",
    "block",
    "date",
    "time",
    "datetime",
    "email",
    "tel",
    "color",
    "checkbox",
  ]),
  options: vine.array(vine.string()).minLength(2).optional(),
  rootBlockId: vine
    .number()
    .nullable()
    .optional()
    .requiredWhen("type", "=", "block"),
  showInList: vine.boolean().optional(),
});

export const createAttributeValidator = vine.compile(createAttributeSchema);
