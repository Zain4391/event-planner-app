import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { DatabaseType } from 'src/database/database.module';
import * as schema from "../database/schemas/schema";
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';


@Injectable()
export class EventService {

    constructor(
        @Inject("DATABASE_CONNECTION") private readonly db: DatabaseType,
        private readonly configService: ConfigService
    ) {}

    async findAll(userRole?: string) {
        try {
            const events = await this.db.select().from(schema.events);
            if(events.length === 0) {
                return [];
            }

            const publishedEvents = events.map((event) => event.status === "Published");
            return publishedEvents;
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: string, organizerId?: string, userRole?: string) {
        try {
            const [event] = await this.db.select().from(schema.events).where(eq(schema.events.id, id));

            if(!event) {
                throw new NotFoundException("Event not found");
            }

            if(userRole === "Admin") {
                return event;
            }

            if(event.status === "Published") {
                return event;
            }

            if(organizerId && event.organizerId === organizerId) {
                return event;
            }
        } catch (error) {
            throw error;
        }
    }

    async create(createeventDto: CreateEventDto, organizerId: string) {
        try {
            const [category] = await this.db.select().from(schema.categories).where(eq(
                schema.categories.id,
                createeventDto.categoryId
            ));

            if(!category) {
                throw new NotFoundException("Category not found");
            }

            // Validate event date is in future
            const eventDateTime = new Date(`${createeventDto.eventDate}T${createeventDto.startTime}`);
            if (eventDateTime <= new Date()) {
                throw new BadRequestException('Event date must be in the future');
            }

            // Validate start time < end time
            if (createeventDto.startTime >= createeventDto.endTime) {
                throw new BadRequestException('Start time must be before end time');
            }

            // create the event draft
            const [event] = await this.db.insert(schema.events).values({
                ...createeventDto,
                organizerId: organizerId,
                availableCapacity: createeventDto.totalCapacity,
                status: 'Draft'
            }).returning()

            return event;
        } catch (error) {
            throw error;
        }
    }

    async update(updateEventDto: UpdateEventDto, organizerId: string) {
        /* TODO */
    }

    async confirmAndPublish(eventId: string) {
        /* TODO */
    }

    async remove(eventId: string) {
        /* TODO */
    }
}
