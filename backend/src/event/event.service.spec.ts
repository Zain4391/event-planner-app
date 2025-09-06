import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';

// Mock the database schema
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

const mockSchema = {
  events: {
    id: 'id',
    title: 'title',
    description: 'description',
    categoryId: 'categoryId',
    organizerId: 'organizerId',
    venueName: 'venueName',
    venueAddress: 'venueAddress',
    eventDate: 'eventDate',
    startTime: 'startTime',
    endTime: 'endTime',
    totalCapacity: 'totalCapacity',
    availableCapacity: 'availableCapacity',
    status: 'status',
    bannerImageUrl: 'bannerImageUrl',
  },
  categories: {
    id: 'id',
    name: 'name',
  },
};

describe('EventService', () => {
  let service: EventService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockEvents = [
      {
        id: 'event-1',
        title: 'Tech Conference',
        status: 'Published',
        organizerId: 'organizer-1',
      },
      {
        id: 'event-2',
        title: 'Music Festival',
        status: 'Published',
        organizerId: 'organizer-2',
      },
    ];

    it('should return all events for admin', async () => {
      mockDb.select.mockResolvedValueOnce(mockEvents);

      const result = await service.findAll('Admin');

      expect(result).toEqual(mockEvents);
      expect(mockDb.select).toHaveBeenCalledWith().from(mockSchema.events);
    });

    it('should return organizer events for organizer role', async () => {
      const organizerId = 'organizer-1';
      const organizerEvents = [mockEvents[0]];
      mockDb.select.mockResolvedValueOnce(organizerEvents);

      const result = await service.findAll('Organizer', organizerId);

      expect(result).toEqual(organizerEvents);
      expect(mockDb.select).toHaveBeenCalledWith().from(mockSchema.events).where(expect.any(Function));
    });

    it('should return published events for other roles', async () => {
      const publishedEvents = mockEvents;
      mockDb.select.mockResolvedValueOnce(publishedEvents);

      const result = await service.findAll();

      expect(result).toEqual(publishedEvents);
      expect(mockDb.select).toHaveBeenCalledWith().from(mockSchema.events).where(expect.any(Function));
    });

    it('should return empty array when no events', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.findAll()).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    const eventId = 'event-id';
    const mockEvent = {
      id: eventId,
      title: 'Tech Conference',
      status: 'Published',
    };

    it('should return a published event', async () => {
      mockDb.select.mockResolvedValueOnce([mockEvent]);

      const result = await service.findOne(eventId);

      expect(result).toEqual(mockEvent);
      expect(mockDb.select).toHaveBeenCalledWith().from(mockSchema.events).where(expect.any(Function));
    });

    it('should throw NotFoundException when event not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.findOne(eventId)).rejects.toThrow(
        new NotFoundException('Event not found')
      );
    });

    it('should throw NotFoundException when event is not published', async () => {
      const draftEvent = { ...mockEvent, status: 'Draft' };
      mockDb.select.mockResolvedValueOnce([draftEvent]);

      await expect(service.findOne(eventId)).rejects.toThrow(
        new NotFoundException('Event not found or published.')
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.findOne(eventId)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    const organizerId = 'organizer-id';
    const mockCreateEventDto: CreateEventDto = {
      title: 'Tech Conference',
      description: 'A great tech conference',
      categoryId: 'category-id',
      venueName: 'Convention Center',
      venueAddress: '123 Main St',
      eventDate: '2024-12-25',
      startTime: '14:30:00',
      endTime: '18:00:00',
      totalCapacity: 100,
      bannerImageUrl: 'https://example.com/banner.jpg',
    };

    const mockCategory = {
      id: 'category-id',
      name: 'Technology',
    };

    const mockEvent = {
      id: 'event-id',
      ...mockCreateEventDto,
      organizerId,
      availableCapacity: 100,
      status: 'Draft',
    };

    it('should create an event successfully', async () => {
      mockDb.select.mockResolvedValueOnce([mockCategory]);
      mockDb.insert.mockResolvedValueOnce([mockEvent]);

      const result = await service.create(mockCreateEventDto, organizerId);

      expect(result).toEqual(mockEvent);
      expect(mockDb.select).toHaveBeenCalledWith().from(mockSchema.categories).where(expect.any(Function));
      expect(mockDb.insert).toHaveBeenCalledWith(mockSchema.events);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.create(mockCreateEventDto, organizerId)).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });

    it('should throw BadRequestException when event date is in the past', async () => {
      const pastEventDto = {
        ...mockCreateEventDto,
        eventDate: '2020-01-01',
      };
      mockDb.select.mockResolvedValueOnce([mockCategory]);

      await expect(service.create(pastEventDto, organizerId)).rejects.toThrow(
        new BadRequestException('Event date must be in the future')
      );
    });

    it('should throw BadRequestException when start time is after end time', async () => {
      const invalidTimeEventDto = {
        ...mockCreateEventDto,
        startTime: '18:00:00',
        endTime: '14:30:00',
      };
      mockDb.select.mockResolvedValueOnce([mockCategory]);

      await expect(service.create(invalidTimeEventDto, organizerId)).rejects.toThrow(
        new BadRequestException('Start time must be before end time')
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.create(mockCreateEventDto, organizerId)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const eventId = 'event-id';
    const organizerId = 'organizer-id';
    const updateEventDto: UpdateEventDto = {
      title: 'Updated Tech Conference',
      description: 'Updated description',
    };

    const mockCurrentEvent = {
      id: eventId,
      title: 'Tech Conference',
      eventDate: '2024-12-25',
      startTime: '14:30:00',
      endTime: '18:00:00',
      totalCapacity: 100,
      availableCapacity: 80,
    };

    const mockUpdatedEvent = {
      id: eventId,
      ...updateEventDto,
    };

    it('should update an event successfully', async () => {
      mockDb.select.mockResolvedValueOnce([mockCurrentEvent]);
      mockDb.update.mockResolvedValueOnce([mockUpdatedEvent]);

      const result = await service.update(eventId, updateEventDto, organizerId);

      expect(result).toEqual(mockUpdatedEvent);
      expect(mockDb.update).toHaveBeenCalledWith(mockSchema.events);
    });

    it('should validate category when categoryId is provided', async () => {
      const updateWithCategory = { ...updateEventDto, categoryId: 'new-category-id' };
      const mockCategory = { id: 'new-category-id', name: 'New Category' };

      mockDb.select.mockResolvedValueOnce([mockCategory]);
      mockDb.select.mockResolvedValueOnce([mockCurrentEvent]);
      mockDb.update.mockResolvedValueOnce([mockUpdatedEvent]);

      await service.update(eventId, updateWithCategory, organizerId);

      expect(mockDb.select).toHaveBeenCalledWith().from(mockSchema.categories).where(expect.any(Function));
    });

    it('should throw NotFoundException when category not found', async () => {
      const updateWithCategory = { ...updateEventDto, categoryId: 'invalid-category' };
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.update(eventId, updateWithCategory, organizerId)).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });

    it('should validate future date when date/time is updated', async () => {
      const updateWithDate = {
        ...updateEventDto,
        eventDate: '2020-01-01',
        startTime: '14:30:00',
      };

      mockDb.select.mockResolvedValueOnce([mockCurrentEvent]);

      await expect(service.update(eventId, updateWithDate, organizerId)).rejects.toThrow(
        new BadRequestException('Event date must be in the future')
      );
    });

    it('should validate time order when time is updated', async () => {
      const updateWithTime = {
        ...updateEventDto,
        startTime: '18:00:00',
        endTime: '14:30:00',
      };

      mockDb.select.mockResolvedValueOnce([mockCurrentEvent]);

      await expect(service.update(eventId, updateWithTime, organizerId)).rejects.toThrow(
        new BadRequestException('Start time must be before end time')
      );
    });

    it('should calculate new available capacity when total capacity is updated', async () => {
      const updateWithCapacity = { ...updateEventDto, totalCapacity: 120 };
      mockDb.select.mockResolvedValueOnce([mockCurrentEvent]);
      mockDb.update.mockResolvedValueOnce([mockUpdatedEvent]);

      await service.update(eventId, updateWithCapacity, organizerId);

      expect(mockDb.set).toHaveBeenCalledWith({
        ...updateWithCapacity,
        availableCapacity: 100, // 120 - 20 (tickets sold)
      });
    });

    it('should throw BadRequestException when reducing capacity below tickets sold', async () => {
      const updateWithLowCapacity = { ...updateEventDto, totalCapacity: 50 };
      mockDb.select.mockResolvedValueOnce([mockCurrentEvent]);

      await expect(service.update(eventId, updateWithLowCapacity, organizerId)).rejects.toThrow(
        new BadRequestException('Cannot reduce capacity below tickets already sold')
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      mockDb.select.mockResolvedValueOnce([mockCurrentEvent]);
      mockDb.update.mockResolvedValueOnce([]);

      await expect(service.update(eventId, updateEventDto, organizerId)).rejects.toThrow(
        new NotFoundException('Event not found')
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.update(eventId, updateEventDto, organizerId)).rejects.toThrow(error);
    });
  });

  describe('confirmAndPublish', () => {
    const eventId = 'event-id';
    const organizerId = 'organizer-id';
    const mockPublishedEvent = {
      id: eventId,
      status: 'Published',
    };

    it('should publish an event successfully', async () => {
      mockDb.update.mockResolvedValueOnce([mockPublishedEvent]);

      const result = await service.confirmAndPublish(eventId, organizerId);

      expect(result).toEqual(mockPublishedEvent);
      expect(mockDb.update).toHaveBeenCalledWith(mockSchema.events);
      expect(mockDb.set).toHaveBeenCalledWith({ status: 'Published' });
    });

    it('should throw NotFoundException when event not found', async () => {
      mockDb.update.mockResolvedValueOnce([]);

      await expect(service.confirmAndPublish(eventId, organizerId)).rejects.toThrow(
        new NotFoundException('Event not found.')
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.update.mockRejectedValueOnce(error);

      await expect(service.confirmAndPublish(eventId, organizerId)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const eventId = 'event-id';

    it('should remove an event successfully', async () => {
      mockDb.delete.mockResolvedValueOnce(undefined);

      const result = await service.remove(eventId);

      expect(result).toBe('Event removed');
      expect(mockDb.delete).toHaveBeenCalledWith(mockSchema.events).where(expect.any(Function));
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.delete.mockRejectedValueOnce(error);

      await expect(service.remove(eventId)).rejects.toThrow(error);
    });
  });
});
