import { schema } from "@osd/config-schema";

describe("Index Name Validation", () => {
  const validateSchema = schema.object({
    indexName: schema.string({
      validate: (value) => {
        const invalidCharactersPattern = /[\s,:\"*+\/\\|?#><]/;
        if (value !== value.toLowerCase() || value.startsWith("_") || value.startsWith("-") || invalidCharactersPattern.test(value)) {
          return "Invalid index name.";
        }

        return undefined;
      },
    }),
    dataSourceId: schema.maybe(schema.string()),
  });

  const validateQuery = (indexName: string) => {
    try {
      validateSchema.validate({ indexName });
      return undefined;
    } catch (e) {
      return e.message;
    }
  };

  it("should fail validation for index names with uppercase letters", () => {
    const errorMessage = validateQuery("IndexNameWithUppercase");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should fail validation for index names starting with an underscore", () => {
    const errorMessage = validateQuery("_indexname");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should fail validation for index names starting with a hyphen", () => {
    const errorMessage = validateQuery("-indexname");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should fail validation for index names containing invalid characters", () => {
    const errorMessage = validateQuery("********************************");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });

  it("should pass validation for valid index names", () => {
    const errorMessage = validateQuery("valid_index-name123");
    expect(errorMessage).toBeUndefined();
  });

  it("should fail validation for index names containing spaces", () => {
    const errorMessage = validateQuery("invalid index");
    expect(errorMessage).toBe("[indexName]: Invalid index name.");
  });
});
