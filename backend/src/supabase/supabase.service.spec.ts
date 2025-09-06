import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

// Mock the Supabase client
const mockSupabaseClient = {
  storage: {
    from: jest.fn(),
    upload: jest.fn(),
    download: jest.fn(),
    remove: jest.fn(),
    list: jest.fn(),
  },
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(),
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_SERVICE_KEY: 'test-service-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize Supabase client with correct configuration', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith('SUPABASE_URL');
      expect(configService.getOrThrow).toHaveBeenCalledWith('SUPABASE_SERVICE_KEY');
    });
  });

  describe('client getter', () => {
    it('should return the Supabase client', () => {
      const client = service.client;
      expect(client).toBe(mockSupabaseClient);
    });

    it('should return the same client instance', () => {
      const client1 = service.client;
      const client2 = service.client;
      expect(client1).toBe(client2);
    });
  });

  describe('storage getter', () => {
    it('should return the Supabase storage client', () => {
      const storage = service.storage;
      expect(storage).toBe(mockSupabaseClient.storage);
    });

    it('should return the same storage instance', () => {
      const storage1 = service.storage;
      const storage2 = service.storage;
      expect(storage1).toBe(storage2);
    });
  });

  describe('integration with Supabase client', () => {
    it('should provide access to auth methods', () => {
      const client = service.client;
      expect(client.auth).toBeDefined();
      expect(client.auth.signUp).toBeDefined();
      expect(client.auth.signIn).toBeDefined();
      expect(client.auth.signOut).toBeDefined();
      expect(client.auth.getUser).toBeDefined();
    });

    it('should provide access to database methods', () => {
      const client = service.client;
      expect(client.from).toBeDefined();
      expect(client.select).toBeDefined();
      expect(client.insert).toBeDefined();
      expect(client.update).toBeDefined();
      expect(client.delete).toBeDefined();
    });

    it('should provide access to storage methods', () => {
      const storage = service.storage;
      expect(storage.from).toBeDefined();
      expect(storage.upload).toBeDefined();
      expect(storage.download).toBeDefined();
      expect(storage.remove).toBeDefined();
      expect(storage.list).toBeDefined();
    });
  });

  describe('configuration validation', () => {
    it('should throw error if SUPABASE_URL is not provided', async () => {
      const module = await Test.createTestingModule({
        providers: [
          SupabaseService,
          {
            provide: ConfigService,
            useValue: {
              getOrThrow: jest.fn((key: string) => {
                if (key === 'SUPABASE_URL') {
                  throw new Error('SUPABASE_URL is required');
                }
                return 'test-value';
              }),
            },
          },
        ],
      }).compile();

      expect(() => {
        module.get<SupabaseService>(SupabaseService);
      }).toThrow('SUPABASE_URL is required');
    });

    it('should throw error if SUPABASE_SERVICE_KEY is not provided', async () => {
      const module = await Test.createTestingModule({
        providers: [
          SupabaseService,
          {
            provide: ConfigService,
            useValue: {
              getOrThrow: jest.fn((key: string) => {
                if (key === 'SUPABASE_SERVICE_KEY') {
                  throw new Error('SUPABASE_SERVICE_KEY is required');
                }
                return 'test-value';
              }),
            },
          },
        ],
      }).compile();

      expect(() => {
        module.get<SupabaseService>(SupabaseService);
      }).toThrow('SUPABASE_SERVICE_KEY is required');
    });
  });
});
