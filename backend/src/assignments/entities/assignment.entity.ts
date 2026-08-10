import { ApiProperty } from '@nestjs/swagger';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';

export class AssignmentEntity extends CreateAssignmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;
}