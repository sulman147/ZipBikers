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
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { InspectionEntity } from './entities/inspection.entity';

@ApiTags('inspections')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all inspections' })
  @ApiOkResponse({ type: InspectionEntity, isArray: true })
  findAll() {
    return this.inspectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inspection by id' })
  @ApiParam({ name: 'id', description: 'Inspection id' })
  @ApiOkResponse({ type: InspectionEntity })
  @ApiNotFoundResponse({ description: 'Inspection not found' })
  findOne(@Param('id') id: string) {
    return this.inspectionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an inspection (before/after handover)' })
  @ApiCreatedResponse({ type: InspectionEntity })
  create(@Body() dto: CreateInspectionDto) {
    return this.inspectionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inspection' })
  @ApiParam({ name: 'id', description: 'Inspection id' })
  @ApiOkResponse({ type: InspectionEntity })
  @ApiNotFoundResponse({ description: 'Inspection not found' })
  update(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.inspectionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inspection' })
  @ApiParam({ name: 'id', description: 'Inspection id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Inspection not found' })
  remove(@Param('id') id: string) {
    return this.inspectionsService.remove(id);
  }
}