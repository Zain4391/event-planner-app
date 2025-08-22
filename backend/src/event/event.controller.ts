import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/role';
import { UserRole } from 'src/auth/dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RoleGuard } from 'src/auth/guards/role-guard';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation-pipe';


/*
TODO:
1. Add event service implementation
2. Return status codes
3. Use the CurrentUser decorator to fetch user from request.

*/

@Controller('events')
export class EventController {

    constructor(
        private readonly eventService: EventService
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {}

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async findAllAdmin() {}

    @Get("my-events")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async findAllOrganizer() {}

    @Post("create-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async create(@Body() createEventDto: CreateEventDto) {}

    @Patch(":id/update-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async update(@Param("id", UuidValidationPipe) id: string, @Body() updateEventDto: UpdateEventDto) {}

    @Patch(":id/publish-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ORGANIZER)
    async confrim(@Param("id", UuidValidationPipe) id: string, @Body() status: string) {}

    @Delete(":id/remove-event")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
    async remove(@Param("id", UuidValidationPipe) id: string) {}
}
