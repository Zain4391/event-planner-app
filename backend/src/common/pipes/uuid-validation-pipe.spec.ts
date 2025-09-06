import { BadRequestException } from '@nestjs/common';
import { UuidValidationPipe } from './uuid-validation-pipe';

describe('UuidValidationPipe', () => {
  let pipe: UuidValidationPipe;

  beforeEach(() => {
    pipe = new UuidValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should implement PipeTransform', () => {
    expect(pipe.transform).toBeDefined();
    expect(typeof pipe.transform).toBe('function');
  });

  describe('transform', () => {
    const validUuids = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
      '00000000-0000-0000-0000-000000000000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
    ];

    const invalidUuids = [
      'not-a-uuid',
      '123e4567-e89b-12d3-a456',
      '123e4567-e89b-12d3-a456-42661417400g',
      '123e4567-e89b-12d3-a456-4266141740000',
      '123e4567-e89b-12d3-a456-42661417400',
      '123e4567e89b12d3a456426614174000',
      '',
      '123e4567-e89b-12d3-a456-426614174000-extra',
      '123e4567-e89b-12d3-a456-426614174000 ',
      ' 123e4567-e89b-12d3-a456-426614174000',
    ];

    it('should return the same value for valid UUIDs', () => {
      validUuids.forEach((uuid) => {
        const result = pipe.transform(uuid, {} as any);
        expect(result).toBe(uuid);
      });
    });

    it('should throw BadRequestException for invalid UUIDs', () => {
      invalidUuids.forEach((invalidUuid) => {
        expect(() => pipe.transform(invalidUuid, {} as any)).toThrow(BadRequestException);
      });
    });

    it('should throw BadRequestException with correct message for invalid UUIDs', () => {
      invalidUuids.forEach((invalidUuid) => {
        expect(() => pipe.transform(invalidUuid, {} as any)).toThrow('Invalid UUID format');
      });
    });

    it('should throw BadRequestException when value is null', () => {
      expect(() => pipe.transform(null as any, {} as any)).toThrow(BadRequestException);
      expect(() => pipe.transform(null as any, {} as any)).toThrow('ID parameter is required');
    });

    it('should throw BadRequestException when value is undefined', () => {
      expect(() => pipe.transform(undefined as any, {} as any)).toThrow(BadRequestException);
      expect(() => pipe.transform(undefined as any, {} as any)).toThrow('ID parameter is required');
    });

    it('should throw BadRequestException when value is empty string', () => {
      expect(() => pipe.transform('', {} as any)).toThrow(BadRequestException);
      expect(() => pipe.transform('', {} as any)).toThrow('ID parameter is required');
    });

    it('should throw BadRequestException when value is whitespace only', () => {
      expect(() => pipe.transform('   ', {} as any)).toThrow(BadRequestException);
      expect(() => pipe.transform('   ', {} as any)).toThrow('Invalid UUID format');
    });

    it('should handle non-string values', () => {
      const nonStringValues = [123, {}, [], true, false, Symbol('test')];

      nonStringValues.forEach((value) => {
        expect(() => pipe.transform(value as any, {} as any)).toThrow(BadRequestException);
      });
    });

    it('should ignore metadata parameter', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const metadata = { type: 'param', metatype: String };

      const result = pipe.transform(uuid, metadata as any);

      expect(result).toBe(uuid);
    });

    it('should work with different metadata types', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const metadataTypes = [
        { type: 'param' },
        { type: 'body' },
        { type: 'query' },
        { type: 'custom' },
        {},
        null,
        undefined,
      ];

      metadataTypes.forEach((metadata) => {
        expect(() => pipe.transform(uuid, metadata as any)).not.toThrow();
      });
    });

    it('should be case sensitive for UUID format', () => {
      const upperCaseUuid = '123E4567-E89B-12D3-A456-426614174000';
      const mixedCaseUuid = '123e4567-E89b-12d3-A456-426614174000';

      expect(() => pipe.transform(upperCaseUuid, {} as any)).toThrow(BadRequestException);
      expect(() => pipe.transform(mixedCaseUuid, {} as any)).toThrow(BadRequestException);
    });
  });
});
