import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/types';

const ROLES: Role[] = ['ADMIN', 'STAFF', 'ACCOUNTANT'];

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ROLES })
  role: Role;
}