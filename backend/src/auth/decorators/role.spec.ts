import { SetMetadata } from '@nestjs/common';
import { Roles } from './role';
import { UserRole } from '../dto/register.dto';

// Mock SetMetadata to track calls
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

const mockSetMetadata = SetMetadata as jest.MockedFunction<typeof SetMetadata>;

describe('Roles Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Roles).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof Roles).toBe('function');
  });

  describe('when called with single role', () => {
    it('should call SetMetadata with correct parameters', () => {
      Roles(UserRole.ADMIN);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [UserRole.ADMIN]);
    });

    it('should work with ORGANIZER role', () => {
      Roles(UserRole.ORGANIZER);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        UserRole.ORGANIZER,
      ]);
    });

    it('should work with CUSTOMER role', () => {
      Roles(UserRole.CUSTOMER);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        UserRole.CUSTOMER,
      ]);
    });
  });

  describe('when called with multiple roles', () => {
    it('should call SetMetadata with array of roles', () => {
      Roles(UserRole.ADMIN, UserRole.ORGANIZER);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        UserRole.ADMIN,
        UserRole.ORGANIZER,
      ]);
    });

    it('should work with all three roles', () => {
      Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.CUSTOMER);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        UserRole.ADMIN,
        UserRole.ORGANIZER,
        UserRole.CUSTOMER,
      ]);
    });

    it('should work with duplicate roles', () => {
      Roles(UserRole.ADMIN, UserRole.ADMIN);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        UserRole.ADMIN,
        UserRole.ADMIN,
      ]);
    });
  });

  describe('when called with no roles', () => {
    it('should call SetMetadata with empty array', () => {
      Roles();

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', []);
    });
  });

  describe('return value', () => {
    it('should return the result of SetMetadata', () => {
      const mockResult = Symbol('metadata-result');
      mockSetMetadata.mockReturnValue(mockResult as any);

      const result = Roles(UserRole.ADMIN);

      expect(result).toBe(mockResult);
    });
  });

  describe('integration with UserRole enum', () => {
    it('should use correct enum values', () => {
      Roles(UserRole.ADMIN);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', ['Admin']);
    });

    it('should handle all enum values correctly', () => {
      const allRoles = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.CUSTOMER];
      Roles(...allRoles);

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        'Admin',
        'Organizer',
        'Customer',
      ]);
    });
  });
});
