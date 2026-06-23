import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../common';
import { CreateUserDto, ListUsersQueryDto, UpdateUserDto } from '../dto';
import { UserService } from '../service/UserService';

@ApiTags('users')
@ApiSecurity('basicAuth')
@ApiBasicAuth('basicAuth')
@UseGuards(BasicAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse({ description: 'User created' })
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ description: 'Paginated user list' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.userService.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ description: 'User details' })
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ description: 'Updated user' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiOkResponse({ description: 'User deleted' })
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
