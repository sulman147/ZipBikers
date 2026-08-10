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
import { BikesService } from './bikes.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { BikeEntity } from './entities/bike.entity';

@ApiTags('bikes')
@Controller('bikes')
export class BikesController {
  constructor(private readonly bikesService: BikesService) {}

  @Get()
  @ApiOperation({ summary: 'List all bikes' })
  @ApiOkResponse({ type: BikeEntity, isArray: true })
  findAll() {
    return this.bikesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bike by id' })
  @ApiParam({ name: 'id', description: 'Bike id' })
  @ApiOkResponse({ type: BikeEntity })
  @ApiNotFoundResponse({ description: 'Bike not found' })
  findOne(@Param('id') id: string) {
    return this.bikesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a bike' })
  @ApiCreatedResponse({ type: BikeEntity })
  create(@Body() dto: CreateBikeDto) {
    return this.bikesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bike' })
  @ApiParam({ name: 'id', description: 'Bike id' })
  @ApiOkResponse({ type: BikeEntity })
  @ApiNotFoundResponse({ description: 'Bike not found' })
  update(@Param('id') id: string, @Body() dto: UpdateBikeDto) {
    return this.bikesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bike' })
  @ApiParam({ name: 'id', description: 'Bike id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Bike not found' })
  remove(@Param('id') id: string) {
    return this.bikesService.remove(id);
  }
}