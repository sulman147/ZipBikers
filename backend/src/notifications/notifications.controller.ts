import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationEntity } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all notifications' })
  @ApiOkResponse({ type: NotificationEntity, isArray: true })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by id' })
  @ApiParam({ name: 'id', description: 'Notification id' })
  @ApiOkResponse({ type: NotificationEntity })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiCreatedResponse({ type: NotificationEntity })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification (e.g. mark as read)' })
  @ApiParam({ name: 'id', description: 'Notification id' })
  @ApiOkResponse({ type: NotificationEntity })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    return this.notificationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}