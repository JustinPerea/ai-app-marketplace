/**
 * Validation System Tests
 * 
 * Tests for native validation system (replacing zod 12KB)
 */

import { v, parse, safeParse, ValidationError } from '../utils/validation';

describe('Validation System - Native Implementation', () => {
  describe('String Validator', () => {
    it('validates strings correctly', () => {
      const schema = v.string();
      
      const validResult = schema.validate('hello');
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data).toBe('hello');
      }

      const invalidResult = schema.validate(123);
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error).toBeInstanceOf(ValidationError);
        expect(invalidResult.error.message).toContain('Expected string');
      }
    });

    it('validates string length constraints', () => {
      const schema = v.string().min(3).max(10);
      
      expect(schema.validate('hello').success).toBe(true);
      expect(schema.validate('hi').success).toBe(false);
      expect(schema.validate('this is too long').success).toBe(false);
    });

    it('validates string patterns', () => {
      const emailSchema = v.string().regex(/^[^@]+@[^@]+\.[^@]+$/);
      
      expect(emailSchema.validate('test@example.com').success).toBe(true);
      expect(emailSchema.validate('invalid-email').success).toBe(false);
    });

    it('validates string enums', () => {
      const schema = v.string().enum('red', 'green', 'blue');
      
      expect(schema.validate('red').success).toBe(true);
      expect(schema.validate('yellow').success).toBe(false);
    });

    it('handles optional strings', () => {
      const schema = v.string().optional();
      
      expect(schema.validate('hello').success).toBe(true);
      expect(schema.validate(undefined).success).toBe(true);
      expect(schema.validate(null).success).toBe(false);
    });

    it('handles nullable strings', () => {
      const schema = v.string().nullable();
      
      expect(schema.validate('hello').success).toBe(true);
      expect(schema.validate(null).success).toBe(true);
      expect(schema.validate(undefined).success).toBe(false);
    });

    it('handles default values', () => {
      const schema = v.string().default('default-value');
      
      const result = schema.validate(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('default-value');
      }
    });
  });

  describe('Number Validator', () => {
    it('validates numbers correctly', () => {
      const schema = v.number();
      
      expect(schema.validate(42).success).toBe(true);
      expect(schema.validate(3.14).success).toBe(true);
      expect(schema.validate('42').success).toBe(false);
      expect(schema.validate(NaN).success).toBe(false);
    });

    it('validates number ranges', () => {
      const schema = v.number().min(0).max(100);
      
      expect(schema.validate(50).success).toBe(true);
      expect(schema.validate(-1).success).toBe(false);
      expect(schema.validate(101).success).toBe(false);
    });

    it('validates integers', () => {
      const schema = v.number().int();
      
      expect(schema.validate(42).success).toBe(true);
      expect(schema.validate(3.14).success).toBe(false);
    });
  });

  describe('Boolean Validator', () => {
    it('validates booleans correctly', () => {
      const schema = v.boolean();
      
      expect(schema.validate(true).success).toBe(true);
      expect(schema.validate(false).success).toBe(true);
      expect(schema.validate('true').success).toBe(false);
      expect(schema.validate(1).success).toBe(false);
    });
  });

  describe('Array Validator', () => {
    it('validates arrays correctly', () => {
      const schema = v.array(v.string());
      
      expect(schema.validate(['a', 'b', 'c']).success).toBe(true);
      expect(schema.validate([]).success).toBe(true);
      expect(schema.validate(['a', 1, 'c']).success).toBe(false);
      expect(schema.validate('not-array').success).toBe(false);
    });

    it('validates array length constraints', () => {
      const schema = v.array(v.string()).min(1).max(3);
      
      expect(schema.validate(['a']).success).toBe(true);
      expect(schema.validate(['a', 'b', 'c']).success).toBe(true);
      expect(schema.validate([]).success).toBe(false);
      expect(schema.validate(['a', 'b', 'c', 'd']).success).toBe(false);
    });

    it('validates nested arrays', () => {
      const schema = v.array(v.array(v.number()));
      
      expect(schema.validate([[1, 2], [3, 4]]).success).toBe(true);
      expect(schema.validate([['a', 'b'], [3, 4]]).success).toBe(false);
    });
  });

  describe('Object Validator', () => {
    it('validates objects correctly', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number(),
        active: v.boolean()
      });
      
      const validData = {
        name: 'John',
        age: 30,
        active: true
      };
      
      const result = schema.validate(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('fails validation for missing required fields', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number()
      });
      
      expect(schema.validate({ name: 'John' }).success).toBe(false);
      expect(schema.validate({ age: 30 }).success).toBe(false);
    });

    it('handles optional fields', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number().optional()
      });
      
      expect(schema.validate({ name: 'John' }).success).toBe(true);
      expect(schema.validate({ name: 'John', age: 30 }).success).toBe(true);
    });

    it('validates nested objects', () => {
      const schema = v.object({
        user: v.object({
          name: v.string(),
          email: v.string()
        }),
        metadata: v.object({
          created: v.number(),
          updated: v.number()
        })
      });
      
      const validData = {
        user: {
          name: 'John',
          email: 'john@example.com'
        },
        metadata: {
          created: 1234567890,
          updated: 1234567891
        }
      };
      
      expect(schema.validate(validData).success).toBe(true);
    });

    it('rejects non-objects', () => {
      const schema = v.object({
        name: v.string()
      });
      
      expect(schema.validate('not-object').success).toBe(false);
      expect(schema.validate([]).success).toBe(false);
      expect(schema.validate(null).success).toBe(false);
    });
  });

  describe('Union Validator', () => {
    it('validates union types correctly', () => {
      const schema = v.union(v.string(), v.number());
      
      expect(schema.validate('hello').success).toBe(true);
      expect(schema.validate(42).success).toBe(true);
      expect(schema.validate(true).success).toBe(false);
    });

    it('handles complex unions', () => {
      const schema = v.union(
        v.object({ type: v.literal('user'), name: v.string() }),
        v.object({ type: v.literal('admin'), permissions: v.array(v.string()) })
      );
      
      expect(schema.validate({ 
        type: 'user', 
        name: 'John' 
      }).success).toBe(true);
      
      expect(schema.validate({ 
        type: 'admin', 
        permissions: ['read', 'write'] 
      }).success).toBe(true);
      
      expect(schema.validate({ 
        type: 'invalid', 
        name: 'John' 
      }).success).toBe(false);
    });
  });

  describe('Literal Validator', () => {
    it('validates literal values correctly', () => {
      const stringLiteral = v.literal('exactly-this');
      const numberLiteral = v.literal(42);
      const booleanLiteral = v.literal(true);
      
      expect(stringLiteral.validate('exactly-this').success).toBe(true);
      expect(stringLiteral.validate('something-else').success).toBe(false);
      
      expect(numberLiteral.validate(42).success).toBe(true);
      expect(numberLiteral.validate(43).success).toBe(false);
      
      expect(booleanLiteral.validate(true).success).toBe(true);
      expect(booleanLiteral.validate(false).success).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('parse function works correctly', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number()
      });
      
      const validData = { name: 'John', age: 30 };
      const result = parse(schema, validData);
      expect(result).toEqual(validData);
      
      expect(() => parse(schema, { name: 'John' })).toThrow(ValidationError);
    });

    it('safeParse function works correctly', () => {
      const schema = v.string();
      
      const validResult = safeParse(schema, 'hello');
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data).toBe('hello');
      }
      
      const invalidResult = safeParse(schema, 123);
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('Error Handling', () => {
    it('provides detailed error messages', () => {
      const schema = v.object({
        user: v.object({
          name: v.string().min(2),
          email: v.string().regex(/^[^@]+@[^@]+\.[^@]+$/)
        })
      });
      
      const result = schema.validate({
        user: {
          name: 'A',
          email: 'invalid-email'
        }
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.path.length).toBeGreaterThan(0);
      }
    });

    it('tracks validation paths correctly', () => {
      const schema = v.array(v.object({
        id: v.number(),
        tags: v.array(v.string())
      }));
      
      const result = schema.validate([
        { id: 1, tags: ['valid'] },
        { id: 'invalid', tags: [123] }
      ]);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.path).toContain('1'); // Second array item
        expect(result.error.path).toContain('id'); // The id field
      }
    });
  });

  describe('Complex Real-World Scenarios', () => {
    it('validates OpenAI-style request', () => {
      const messageSchema = v.object({
        role: v.string().enum('system', 'user', 'assistant'),
        content: v.string(),
        name: v.string().optional()
      });
      
      const requestSchema = v.object({
        model: v.string(),
        messages: v.array(messageSchema),
        temperature: v.number().min(0).max(2).optional(),
        max_tokens: v.number().int().min(1).optional(),
        stream: v.boolean().default(false)
      });
      
      const validRequest = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello!' }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      };
      
      const result = requestSchema.validate(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stream).toBe(false); // Default value applied
      }
    });

    it('validates Claude-style request', () => {
      const contentSchema = v.union(
        v.string(),
        v.array(v.object({
          type: v.string().enum('text', 'image'),
          text: v.string().optional(),
          source: v.object({
            type: v.literal('base64'),
            media_type: v.string(),
            data: v.string()
          }).optional()
        }))
      );
      
      const requestSchema = v.object({
        model: v.string(),
        messages: v.array(v.object({
          role: v.string().enum('user', 'assistant'),
          content: contentSchema
        })),
        max_tokens: v.number().int().min(1),
        system: v.string().optional()
      });
      
      const validRequest = {
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What is in this image?' },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: 'base64-encoded-data'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        system: 'You are a helpful assistant.'
      };
      
      const result = requestSchema.validate(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('Performance & Memory', () => {
    it('handles large objects efficiently', () => {
      const schema = v.object({
        items: v.array(v.object({
          id: v.number(),
          name: v.string(),
          active: v.boolean()
        }))
      });
      
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          active: i % 2 === 0
        }))
      };
      
      const startTime = Date.now();
      const result = schema.validate(largeData);
      const elapsed = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(100); // Should validate quickly
    });

    it('reuses validator instances', () => {
      const stringValidator = v.string();
      const schema1 = v.object({ name: stringValidator });
      const schema2 = v.object({ title: stringValidator });
      
      // Both should work with the same validator instance
      expect(schema1.validate({ name: 'test' }).success).toBe(true);
      expect(schema2.validate({ title: 'test' }).success).toBe(true);
    });
  });
});