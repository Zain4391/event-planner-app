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

            const publishedEvents = events.filter((event) => event.status === "Published");
            return publishedEvents;
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: string) {
        try {
            const [event] = await this.db.select().from(schema.events).where(eq(schema.events.id, id));

            if(!event) {
                throw new NotFoundException("Event not found");
            }

            if(event.status === "Published") {
                return event;
            }

            throw new NotFoundException("Event not found or published.");

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

    async update(id: string ,updateEventDto: UpdateEventDto, organizerId: string) {
        try {
            if (updateEventDto.categoryId) {
                const [category] = await this.db.select().from(schema.categories)
                    .where(eq(schema.categories.id, updateEventDto.categoryId));
                if (!category) {
                    throw new NotFoundException("Category not found");
                }
            }

            if (updateEventDto.eventDate || updateEventDto.startTime) {
                
                // Get current event for missing fields
                const [currentEvent] = await this.db.select().from(schema.events)
                    .where(eq(schema.events.id, id));
                
                const eventDate = updateEventDto.eventDate || currentEvent.eventDate;
                const startTime = updateEventDto.startTime || currentEvent.startTime;
                const endTime = updateEventDto.endTime || currentEvent.endTime;
                
                // Validate future date
                const eventDateTime = new Date(`${eventDate}T${startTime}`);
                if (eventDateTime <= new Date()) {
                    throw new BadRequestException('Event date must be in the future');
                }
                
                // Validate start < end time
                if (startTime >= endTime) {
                    throw new BadRequestException('Start time must be before end time');
                }
            }

            let updateData = { ...updateEventDto };
            if (updateEventDto.totalCapacity) {
                // Get current event to calculate new availableCapacity
                const [currentEvent] = await this.db.select().from(schema.events)
                    .where(eq(schema.events.id, id));
                
                const ticketsSold = currentEvent.totalCapacity - currentEvent.availableCapacity;
                const newAvailableCapacity = updateEventDto.totalCapacity - ticketsSold;
                
                if (newAvailableCapacity < 0) {
                    throw new BadRequestException('Cannot reduce capacity below tickets already sold');
                }
                
                updateData.totalCapacity = newAvailableCapacity;
            }
            const [event] = await this.db.update(schema.events).set(updateEventDto).where(
                and(
                    eq(schema.events.id, id),
                    eq(schema.events.organizerId, organizerId)
                )
            ).returning()

            if(!event) {
                throw new NotFoundException("Event not found");
            }
            return event;
        } catch (error) {
            throw error;
        }
    }

    async confirmAndPublish(id: string, organizerId: string) {
        try {
            const [event] = await this.db.update(schema.events).set({
                status: "Published"
            }).where(
                and(
                    eq(schema.events.id, id),
                    eq(schema.events.organizerId, organizerId)
                )
            ).returning()

            if(!event) {
                throw new NotFoundException("Event not found.");
            }

            return event;
        } catch (error) {
            throw error;
        }
    }

    async remove(id: string) {
        try {
            await this.db.delete(schema.events).where(eq(schema.events.id, id));
            return "Event removed";
        } catch (error) {
            throw error;
        }
    }

    /* FOR Cancellation (Planned) 
    
    1. Cancel the event by setting status as cancelled.
    2. Broadcasts an event called EVENT.CANCEL. 
    3. The event is caught by required modules (payment for refunds, order for cancellation etc.) and
       they perform said operations

    ============== OR =========================
    1. Use transaction to perform event cancellation
    2. Then in the same transaction, refund the user.
    
    */
}
