import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRecord } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

export interface LoginResult {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: JsonDbService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const record = this.db.findOneBy<UserRecord>('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (!record) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, record.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = this.sanitize(record);
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken, user };
  }

  findUserById(id: string): User | null {
    const record = this.db.findById<UserRecord>('users', id);
    return record ? this.sanitize(record) : null;
  }

  private sanitize(record: UserRecord): User {
    const { id, name, email, role } = record;
    return { id, name, email, role };
  }
}
