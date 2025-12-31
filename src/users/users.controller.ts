import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from 'src/common/interfaces/current-user.interface';
import { UserProfileDto } from './dto/user-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create or update a role with permissions' })
  @ApiResponse({
    status: 201,
    description: 'Role created or updated successfully',
    type: UserProfileDto,
  })
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: ICurrentUser) {
    if (!user.id) {
      return null;
    }
    const profile = await this.usersService.getUserProfile(user.id);
    if (!profile) return null;
    return profile;
  }
}
