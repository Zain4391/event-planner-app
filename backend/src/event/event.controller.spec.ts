import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';
import { jwtPayload } from '../auth/types/jwt-payload.type';

describe('EventController', () => {
  let controller: EventController;
  let eventService: EventService;

  const mockEventService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    confirmAndPublish: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const mockEvents = [
      {
        id: 'event-1',
        title: 'Tech Conference',
        status: 'Published',
      },
      {
        id: 'event-2',
        title: 'Music Festival',
        status: 'Published',
      },
    ];

    it('should return published events', async () => {
      mockEventService.findAll.mockResolvedValueOnce(mockEvents);

      const result = await controller.findAll();

      expect(result).toEqual({
        data: mockEvents,
        message: 'Published events fetched successfully',
        statusCode: HttpStatus.OK,
      });
      expect(eventService.findAll).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockEventService.findAll.mockRejectedValueOnce(error);

      await expect(controller.findAll()).rejects.toThrow(error);
    });
  });

  describe('findAllAdmin', () => {
    const mockUser: jwtPayload = {
      id: 'admin-id',
      email: 'admin@example.com',
      isActive: true,
      role: 'Admin',
    };

    const mockEvents = [
      {
        id: 'event-1',
        title: 'Tech Conference',
        status: 'Published',
      },
      {
        id: 'event-2',
        title: 'Draft Event',
        status: 'Draft',
      },
    ];

    it('should return all events for admin', async () => {
      mockEventService.findAll.mockResolvedValueOnce(mockEvents);

      const result = await controller.findAllAdmin(mockUser);

      expect(result).toEqual({
        data: mockEvents,
        message: 'Events fetched successfully',
        statusCode: HttpStatus.OK,
      });
      expect(eventService.findAll).toHaveBeenCalledWith('Admin');
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockEventService.findAll.mockRejectedValueOnce(error);

      await expect(controller.findAllAdmin(mockUser)).rejects.toThrow(error);
    });
  });

  describe('findAllOrganizer', () => {
    const mockUser: jwtPayload = {
      id: 'organizer-id',
      email: 'organizer@example.com',
      isActive: true,
      role: 'Organizer',
    };

    const mockEvents = [
      {
        id: 'event-1',
        title: 'My Event',
        organizerId: 'organizer-id',
      },
    ];

    it('should return organizer events', async () => {
      mockEventService.findAll.mockResolvedValueOnce(mockEvents);

      const result = await controller.findAllOrganizer(mockUser);

      expect(result).toEqual({
        data: mockEvents,
        message: "Organizer's events fetched successfully",
        statusCode: HttpStatus.OK,
      });
      expect(eventService.findAll).toHaveBeenCalledWith('Organizer', mockUser.id);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockEventService.findAll.mockRejectedValueOnce(error);

      await expect(controller.findAllOrganizer(mockUser)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    const eventId = 'event-id';
    const mockEvent = {
      id: eventId,
      title: 'Tech Conference',
      status: 'Published',
    };

    it('should return an event by id', async () => {
      mockEventService.findOne.mockResolvedValueOnce(mockEvent);

      const result = await controller.findOne(eventId);

      expect(result).toEqual({
        data: mockEvent,
        message: 'Event fetched successfully',
        statusCode: HttpStatus.OK,
      });
      expect(eventService.findOne).toHaveBeenCalledWith(eventId);
    });

    it('should handle service errors', async () => {
      const error = new Error('Event not found');
      mockEventService.findOne.mockRejectedValueOnce(error);

      await expect(controller.findOne(eventId)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    const mockUser: jwtPayload = {
      id: 'organizer-id',
      email: 'organizer@example.com',
      isActive: true,
      role: 'Organizer',
    };

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

    const mockEvent = {
      id: 'event-id',
      ...mockCreateEventDto,
      organizerId: mockUser.id,
      availableCapacity: 100,
      status: 'Draft',
    };

    it('should create an event successfully', async () => {
      mockEventService.create.mockResolvedValueOnce(mockEvent);

      const result = await controller.create(mockCreateEventDto, mockUser);

      expect(result).toEqual({
        data: mockEvent,
        message: 'Event created successfully',
        statusCode: HttpStatus.CREATED,
      });
      expect(eventService.create).toHaveBeenCalledWith(mockCreateEventDto, mockUser.id);
    });

    it('should handle service errors', async () => {
      const error = new Error('Category not found');
      mockEventService.create.mockRejectedValueOnce(error);

      await expect(controller.create(mockCreateEventDto, mockUser)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const eventId = 'event-id';
    const mockUser: jwtPayload = {
      id: 'organizer-id',
      email: 'organizer@example.com',
      isActive: true,
      role: 'Organizer',
    };

    const updateEventDto: UpdateEventDto = {
      title: 'Updated Tech Conference',
      description: 'Updated description',
    };

    const mockUpdatedEvent = {
      id: eventId,
      ...updateEventDto,
    };

    it('should update an event successfully', async () => {
      mockEventService.update.mockResolvedValueOnce(mockUpdatedEvent);

      const result = await controller.update(eventId, updateEventDto, mockUser);

      expect(result).toEqual({
        data: mockUpdatedEvent,
        message: 'Event updated successfully',
        statusCode: HttpStatus.OK,
      });
      expect(eventService.update).toHaveBeenCalledWith(eventId, updateEventDto, mockUser.id);
    });

    it('should handle service errors', async () => {
      const error = new Error('Event not found');
      mockEventService.update.mockRejectedValueOnce(error);

      await expect(controller.update(eventId, updateEventDto, mockUser)).rejects.toThrow(error);
    });
  });

  describe('confrim', () => {
    const eventId = 'event-id';
    const mockUser: jwtPayload = {
      id: 'organizer-id',
      email: 'organizer@example.com',
      isActive: true,
      role: 'Organizer',
    };

    const mockPublishedEvent = {
      id: eventId,
      status: 'Published',
    };

    it('should publish an event successfully', async () => {
      mockEventService.confirmAndPublish.mockResolvedValueOnce(mockPublishedEvent);

      const result = await controller.confrim(eventId, mockUser);

      expect(result).toEqual({
        data: mockPublishedEvent,
        message: 'Event has been published',
        statusCode: HttpStatus.OK,
      });
      expect(eventService.confirmAndPublish).toHaveBeenCalledWith(eventId, mockUser.id);
    });

    it('should handle service errors', async () => {
      const error = new Error('Event not found');
      mockEventService.confirmAndPublish.mockRejectedValueOnce(error);

      await expect(controller.confrim(eventId, mockUser)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const eventId = 'event-id';
    const mockMessage = 'Event removed';

    it('should remove an event successfully', async () => {
      mockEventService.remove.mockResolvedValueOnce(mockMessage);

      const result = await controller.remove(eventId);

      expect(result).toEqual({
        message: mockMessage,
        statusCode: HttpStatus.NO_CONTENT,
      });
      expect(eventService.remove).toHaveBeenCalledWith(eventId);
    });

    it('should handle service errors', async () => {
      const error = new Error('Event not found');
      mockEventService.remove.mockRejectedValueOnce(error);

      await expect(controller.remove(eventId)).rejects.toThrow(error);
    });
  });
});
