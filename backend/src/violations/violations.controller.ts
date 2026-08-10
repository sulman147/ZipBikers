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
import { ViolationsService } from './violations.service';
import { CreateViolationDto } from './dto/create-violation.dto';
import { UpdateViolationDto } from './dto/update-violation.dto';
import { ViolationEntity } from './entities/violation.entity';

@ApiTags('violations')
@Controller('violations')
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all traffic violations' })
  @ApiOkResponse({ type: ViolationEntity, isArray: true })
  findAll() {
    return this.violationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a traffic violation by id' })
  @ApiParam({ name: 'id', description: 'Violation id' })
  @ApiOkResponse({ type: ViolationEntity })
  @ApiNotFoundResponse({ description: 'Violation not found' })
  findOne(@Param('id') id: string) {
    return this.violationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a traffic violation' })
  @ApiCreatedResponse({ type: ViolationEntity })
  create(@Body() dto: CreateViolationDto) {
    return this.violationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a traffic violation' })
  @ApiParam({ name: 'id', description: 'Violation id' })
  @ApiOkResponse({ type: ViolationEntity })
  @ApiNotFoundResponse({ description: 'Violation not found' })
  update(@Param('id') id: string, @Body() dto: UpdateViolationDto) {
    return this.violationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a traffic violation' })
  @ApiParam({ name: 'id', description: 'Violation id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Violation not found' })
  remove(@Param('id') id: string) {
    return this.violationsService.remove(id);
  }
}