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
import { RidersService } from './riders.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { RiderEntity } from './entities/rider.entity';

@ApiTags('riders')
@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  @ApiOperation({ summary: 'List all riders' })
  @ApiOkResponse({ type: RiderEntity, isArray: true })
  findAll() {
    return this.ridersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rider by id' })
  @ApiParam({ name: 'id', description: 'Rider id' })
  @ApiOkResponse({ type: RiderEntity })
  @ApiNotFoundResponse({ description: 'Rider not found' })
  findOne(@Param('id') id: string) {
    return this.ridersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a rider' })
  @ApiCreatedResponse({ type: RiderEntity })
  create(@Body() dto: CreateRiderDto) {
    return this.ridersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a rider' })
  @ApiParam({ name: 'id', description: 'Rider id' })
  @ApiOkResponse({ type: RiderEntity })
  @ApiNotFoundResponse({ description: 'Rider not found' })
  update(@Param('id') id: string, @Body() dto: UpdateRiderDto) {
    return this.ridersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rider' })
  @ApiParam({ name: 'id', description: 'Rider id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Rider not found' })
  remove(@Param('id') id: string) {
    return this.ridersService.remove(id);
  }
}