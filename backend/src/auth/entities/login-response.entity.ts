import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class LoginResponseEntity {
  @ApiProperty({ description: 'JWT bearer token to send as `Authorization: Bearer <token>`.' })
  accessToken: string;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;
}