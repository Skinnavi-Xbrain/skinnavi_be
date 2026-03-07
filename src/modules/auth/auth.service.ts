import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuthDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    const { email, password, confirm_password, full_name, avatar_url } =
      createAuthDto;

    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match.');
    }

    const userExists = await this.prisma.users.findUnique({
      where: { email },
    });
    if (userExists) {
      throw new ConflictException('Email already exists.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        full_name,
        avatar_url,
      },
    });

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    const { password_hash: _password_hash, ...result } = user;
    return { ...result, ...tokens };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const isPasswordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );
    if (!isPasswordMatches) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    const { password_hash: _hash, ...userData } = user;
    return {
      user: userData,
      ...tokens,
    };
  }

  async logout(userId: string) {
    // Xóa hashed_refresh_token trong DB để chặn refresh
    await this.prisma.users.updateMany({
      where: {
        id: userId,
        hashed_refresh_token: { not: null }, // Chỉ update nếu đang có token
      } as any, // Ép kiểu vì schema chưa có trường này
      data: { hashed_refresh_token: null } as any,
    });
    return true;
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user || !(user as any).hashed_refresh_token)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(
      rt,
      (user as any).hashed_refresh_token,
    );
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRtHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.prisma.users.update({
      where: { id: userId },
      data: { hashed_refresh_token: hash } as any,
    });
  }

  async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRETKEY'),
        expiresIn: this.configService.get('JWT_ACTIVATE_EXPIRES'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRETKEY'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
