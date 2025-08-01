/**
 * Zero-Dependency Schema Validation
 * 
 * Lightweight validation system to replace Zod (saves 12KB)
 * Provides type-safe validation with minimal bundle impact
 */

export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ValidationError;
};

export class ValidationError extends Error {
  constructor(
    message: string,
    public path: string[] = [],
    public received?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Base validator interface
 */
export interface Validator<T> {
  validate(value: unknown, path?: string[]): ValidationResult<T>;
  optional(): Validator<T | undefined>;
  nullable(): Validator<T | null>;
  default(defaultValue: T): Validator<T>;
}

/**
 * Base validator implementation
 */
abstract class BaseValidator<T> implements Validator<T> {
  abstract validate(value: unknown, path?: string[]): ValidationResult<T>;

  optional(): Validator<T | undefined> {
    return new OptionalValidator(this);
  }

  nullable(): Validator<T | null> {
    return new NullableValidator(this);
  }

  default(defaultValue: T): Validator<T> {
    return new DefaultValidator(this, defaultValue);
  }
}

/**
 * String validator
 */
class StringValidator extends BaseValidator<string> {
  constructor(
    private constraints: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      enum?: readonly string[];
    } = {}
  ) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<string> {
    if (typeof value !== 'string') {
      return {
        success: false,
        error: new ValidationError(
          `Expected string, received ${typeof value}`,
          path,
          value
        )
      };
    }

    if (this.constraints.minLength !== undefined && value.length < this.constraints.minLength) {
      return {
        success: false,
        error: new ValidationError(
          `String must be at least ${this.constraints.minLength} characters`,
          path,
          value
        )
      };
    }

    if (this.constraints.maxLength !== undefined && value.length > this.constraints.maxLength) {
      return {
        success: false,
        error: new ValidationError(
          `String must be at most ${this.constraints.maxLength} characters`,
          path,
          value
        )
      };
    }

    if (this.constraints.pattern && !this.constraints.pattern.test(value)) {
      return {
        success: false,
        error: new ValidationError(
          `String does not match required pattern`,
          path,
          value
        )
      };
    }

    if (this.constraints.enum && !this.constraints.enum.includes(value)) {
      return {
        success: false,
        error: new ValidationError(
          `String must be one of: ${this.constraints.enum.join(', ')}`,
          path,
          value
        )
      };
    }

    return { success: true, data: value };
  }

  min(length: number): StringValidator {
    return new StringValidator({ ...this.constraints, minLength: length });
  }

  max(length: number): StringValidator {
    return new StringValidator({ ...this.constraints, maxLength: length });
  }

  regex(pattern: RegExp): StringValidator {
    return new StringValidator({ ...this.constraints, pattern });
  }

  enum<T extends readonly string[]>(...values: T): Validator<T[number]> {
    return new StringValidator({ ...this.constraints, enum: values }) as any;
  }
}

/**
 * Number validator
 */
class NumberValidator extends BaseValidator<number> {
  constructor(
    private constraints: {
      min?: number;
      max?: number;
      integer?: boolean;
    } = {}
  ) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<number> {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        success: false,
        error: new ValidationError(
          `Expected number, received ${typeof value}`,
          path,
          value
        )
      };
    }

    if (this.constraints.integer && !Number.isInteger(value)) {
      return {
        success: false,
        error: new ValidationError(
          `Expected integer, received ${value}`,
          path,
          value
        )
      };
    }

    if (this.constraints.min !== undefined && value < this.constraints.min) {
      return {
        success: false,
        error: new ValidationError(
          `Number must be at least ${this.constraints.min}`,
          path,
          value
        )
      };
    }

    if (this.constraints.max !== undefined && value > this.constraints.max) {
      return {
        success: false,
        error: new ValidationError(
          `Number must be at most ${this.constraints.max}`,
          path,
          value
        )
      };
    }

    return { success: true, data: value };
  }

  min(value: number): NumberValidator {
    return new NumberValidator({ ...this.constraints, min: value });
  }

  max(value: number): NumberValidator {
    return new NumberValidator({ ...this.constraints, max: value });
  }

  int(): NumberValidator {
    return new NumberValidator({ ...this.constraints, integer: true });
  }
}

/**
 * Boolean validator
 */
class BooleanValidator extends BaseValidator<boolean> {
  validate(value: unknown, path: string[] = []): ValidationResult<boolean> {
    if (typeof value !== 'boolean') {
      return {
        success: false,
        error: new ValidationError(
          `Expected boolean, received ${typeof value}`,
          path,
          value
        )
      };
    }

    return { success: true, data: value };
  }
}

/**
 * Array validator
 */
class ArrayValidator<T> extends BaseValidator<T[]> {
  constructor(
    private itemValidator: Validator<T>,
    private constraints: {
      minLength?: number;
      maxLength?: number;
    } = {}
  ) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<T[]> {
    if (!Array.isArray(value)) {
      return {
        success: false,
        error: new ValidationError(
          `Expected array, received ${typeof value}`,
          path,
          value
        )
      };
    }

    if (this.constraints.minLength !== undefined && value.length < this.constraints.minLength) {
      return {
        success: false,
        error: new ValidationError(
          `Array must have at least ${this.constraints.minLength} items`,
          path,
          value
        )
      };
    }

    if (this.constraints.maxLength !== undefined && value.length > this.constraints.maxLength) {
      return {
        success: false,
        error: new ValidationError(
          `Array must have at most ${this.constraints.maxLength} items`,
          path,
          value
        )
      };
    }

    const validatedItems: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i], [...path, i.toString()]);
      if (!itemResult.success) {
        return itemResult;
      }
      validatedItems.push(itemResult.data);
    }

    return { success: true, data: validatedItems };
  }

  min(length: number): ArrayValidator<T> {
    return new ArrayValidator(this.itemValidator, { ...this.constraints, minLength: length });
  }

  max(length: number): ArrayValidator<T> {
    return new ArrayValidator(this.itemValidator, { ...this.constraints, maxLength: length });
  }
}

/**
 * Object validator
 */
class ObjectValidator<T extends Record<string, any>> extends BaseValidator<T> {
  constructor(private shape: { [K in keyof T]: Validator<T[K]> }) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<T> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        success: false,
        error: new ValidationError(
          `Expected object, received ${typeof value}`,
          path,
          value
        )
      };
    }

    const result = {} as T;
    const inputObj = value as Record<string, unknown>;

    for (const [key, validator] of Object.entries(this.shape)) {
      const fieldResult = validator.validate(inputObj[key], [...path, key]);
      if (!fieldResult.success) {
        return fieldResult;
      }
      result[key as keyof T] = fieldResult.data;
    }

    return { success: true, data: result };
  }
}

/**
 * Union validator
 */
class UnionValidator<T> extends BaseValidator<T> {
  constructor(private validators: Validator<any>[]) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<T> {
    const errors: ValidationError[] = [];

    for (const validator of this.validators) {
      const result = validator.validate(value, path);
      if (result.success) {
        return result;
      }
      errors.push(result.error);
    }

    return {
      success: false,
      error: new ValidationError(
        `Value does not match any of the union types`,
        path,
        value
      )
    };
  }
}

/**
 * Optional validator wrapper
 */
class OptionalValidator<T> extends BaseValidator<T | undefined> {
  constructor(private innerValidator: Validator<T>) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<T | undefined> {
    if (value === undefined) {
      return { success: true, data: undefined };
    }
    return this.innerValidator.validate(value, path);
  }
}

/**
 * Nullable validator wrapper
 */
class NullableValidator<T> extends BaseValidator<T | null> {
  constructor(private innerValidator: Validator<T>) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<T | null> {
    if (value === null) {
      return { success: true, data: null };
    }
    return this.innerValidator.validate(value, path);
  }
}

/**
 * Default validator wrapper
 */
class DefaultValidator<T> extends BaseValidator<T> {
  constructor(
    private innerValidator: Validator<T>,
    private defaultValue: T
  ) {
    super();
  }

  validate(value: unknown, path: string[] = []): ValidationResult<T> {
    if (value === undefined) {
      return { success: true, data: this.defaultValue };
    }
    return this.innerValidator.validate(value, path);
  }
}

/**
 * Schema builder functions
 */
export const v = {
  string: () => new StringValidator(),
  number: () => new NumberValidator(),
  boolean: () => new BooleanValidator(),
  array: <T>(itemValidator: Validator<T>) => new ArrayValidator(itemValidator),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: Validator<T[K]> }) => 
    new ObjectValidator(shape),
  union: <T>(...validators: Validator<T>[]) => new UnionValidator<T>(validators),
  literal: <T extends string | number | boolean>(value: T): Validator<T> => ({
    validate: (input: unknown, path: string[] = []): ValidationResult<T> => {
      if (input === value) {
        return { success: true, data: value };
      }
      return {
        success: false,
        error: new ValidationError(
          `Expected literal value ${value}, received ${input}`,
          path,
          input
        )
      };
    },
    optional: () => v.union(v.literal(value), v.undefined()) as any,
    nullable: () => v.union(v.literal(value), v.null()) as any,
    default: (defaultValue: T) => new DefaultValidator(v.literal(value), defaultValue)
  }),
  undefined: (): Validator<undefined> => ({
    validate: (input: unknown, path: string[] = []): ValidationResult<undefined> => {
      if (input === undefined) {
        return { success: true, data: undefined };
      }
      return {
        success: false,
        error: new ValidationError(
          `Expected undefined, received ${typeof input}`,
          path,
          input
        )
      };
    },
    optional: () => v.undefined(),
    nullable: () => v.union(v.undefined(), v.null()) as any,
    default: (defaultValue: undefined) => new DefaultValidator(v.undefined(), defaultValue)
  }),
  null: (): Validator<null> => ({
    validate: (input: unknown, path: string[] = []): ValidationResult<null> => {
      if (input === null) {
        return { success: true, data: null };
      }
      return {
        success: false,
        error: new ValidationError(
          `Expected null, received ${typeof input}`,
          path,
          input
        )
      };
    },
    optional: () => v.union(v.null(), v.undefined()) as any,
    nullable: () => v.null(),
    default: (defaultValue: null) => new DefaultValidator(v.null(), defaultValue)
  }),
  any: (): Validator<any> => ({
    validate: (input: unknown): ValidationResult<any> => {
      return { success: true, data: input };
    },
    optional: () => v.any(),
    nullable: () => v.any(),
    default: (defaultValue: any) => new DefaultValidator(v.any(), defaultValue)
  })
};

/**
 * Parse with validation
 */
export function parse<T>(validator: Validator<T>, value: unknown): T {
  const result = validator.validate(value);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Safe parse with validation
 */
export function safeParse<T>(validator: Validator<T>, value: unknown): ValidationResult<T> {
  return validator.validate(value);
}