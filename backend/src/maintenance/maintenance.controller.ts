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
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceEntity } from './entities/maintenance.entity';

@ApiTags('maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @ApiOperation({ summary: 'List all maintenance records' })
  @ApiOkResponse({ type: MaintenanceEntity, isArray: true })
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a maintenance record by id' })
  @ApiParam({ name: 'id', description: 'Maintenance record id' })
  @ApiOkResponse({ type: MaintenanceEntity })
  @ApiNotFoundResponse({ description: 'Maintenance record not found' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a maintenance record' })
  @ApiCreatedResponse({ type: MaintenanceEntity })
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a maintenance record' })
  @ApiParam({ name: 'id', description: 'Maintenance record id' })
  @ApiOkResponse({ type: MaintenanceEntity })
  @ApiNotFoundResponse({ description: 'Maintenance record not found' })
  update(@Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a maintenance record' })
  @ApiParam({ name: 'id', description: 'Maintenance record id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Maintenance record not found' })
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}