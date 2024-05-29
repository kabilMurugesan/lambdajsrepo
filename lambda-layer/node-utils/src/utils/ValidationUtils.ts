import * as joi from 'joi';

interface ValidationResult<T> {
  error?: joi.ValidationError | null;
  value: T;
}

export function validateInput<T>(
  schema: joi.Schema,
  data: any
): ValidationResult<T> {
  const result = schema.validate(data);
  return { error: result.error || null, value: result.value };
}
