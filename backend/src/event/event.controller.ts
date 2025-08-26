import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/role';
import { UserRole } from 'src/auth/dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RoleGuard } from 'src/auth/guards/role-guard';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation-pipe';
import { CurrentUser } from 'src/auth/decorators/getCurrentUser';
import type { jwtPayload } from 'src/auth/types/jwt-payload.type';

@Controller('events')
export class EventController {

    constructor(
        private readonly eventService: EventService
    ) {}

    @Get()
    async findAll() {
        const data = await this.eventService.findAll();
        return {
            data,
            message: "Published events fetched successfully",
            statusCode: HttpStatus.OK
        }
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async findAllAdmin(
        @CurrentUser() user: jwtPayload
    ) {
        const data = await this.eventService.findAll("Admin");
        return {
            data,
            message: "Events fetched successfully",
            statusCode: HttpStatus.OK
        }
    }

    @Get("my-events")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async findAllOrganizer(
        @CurrentUser() user: jwtPayload
    ) { 
        const data = await this.eventService.findAll("Organizer", user.id);
        return {
            data,
            message: "Organizer's events fetched successfully",
            statusCode: HttpStatus.OK
        }
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    async findOne(@Param("id", UuidValidationPipe) id: string) {
        const data = await this.eventService.findOne(id);
        return {
            data,
            message: "Event fetched successfully",
            statusCode: HttpStatus.OK
        }
    }

    @Post("create-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: jwtPayload) {
        const data = await this.eventService.create(createEventDto, user.id);
        return {
            data,
            message: "Event created successfully",
            statusCode: HttpStatus.CREATED
        }
    }

    @Patch(":id/update-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async update(@Param("id", UuidValidationPipe) id: string, @Body() updateEventDto: UpdateEventDto, @CurrentUser() user: jwtPayload) {
        const data = await this.eventService.update(id, updateEventDto, user.id);
        return {
            data,
            message: "Event updated successfully",
            statusCode: HttpStatus.OK
        }
    }

    @Patch(":id/publish-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async confrim(@Param("id", UuidValidationPipe) id: string, @CurrentUser() user: jwtPayload) {
        const data = await this.eventService.confirmAndPublish(id, user.id);
        return {
            data,
            message: "Event has been published",
            statusCode: HttpStatus.OK
        }
    }

    @Delete(":id/remove-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
    async remove(@Param("id", UuidValidationPipe) id: string) {
        const response = await this.eventService.remove(id);
        return {
            message: response,
            statusCode: HttpStatus.NO_CONTENT
        }
    }
}
