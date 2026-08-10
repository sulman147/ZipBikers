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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentEntity } from './entities/assignment.entity';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all assignments' })
  @ApiOkResponse({ type: AssignmentEntity, isArray: true })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assignment by id' })
  @ApiParam({ name: 'id', description: 'Assignment id' })
  @ApiOkResponse({ type: AssignmentEntity })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an assignment (assign a bike to a rider)' })
  @ApiCreatedResponse({ type: AssignmentEntity })
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment id' })
  @ApiOkResponse({ type: AssignmentEntity })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}