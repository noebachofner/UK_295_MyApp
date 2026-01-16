import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, ReturnUserDto, UpdateUserAdminDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsAdmin, UserId } from '../decorators';
import { AuthGuard } from '../guards/auth.guard';
import { CorrId } from '../../../../decorators/corr-id.decorator';

@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiInternalServerErrorResponse({
  description:
    'Internal Server Error\n\n[Referenz zu HTTP 500](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/500)',
})
@ApiUnauthorizedResponse({
  description:
    'Unauthorized, the user must be signed in\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: `Create user`,
    description: `Create a new user resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiConflictResponse({
    description: `The username already exists\n\n[Referenz zu HTTP 409](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/409)`,
  })
  @ApiCreatedResponse({
    description: `Return the created user resource\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)`,
    type: ReturnUserDto,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  @ApiBody({ type: CreateUserDto })
  create(
    @CorrId() corrId: number,
    @UserId() userId: number,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.create(corrId, userId, createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: `Get all user`,
    description: `Return an array of user resources\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    isArray: true,
    description: `Return an array of user resources\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  findAll(@CorrId() corrId: number, @IsAdmin() isAdmin: boolean) {
    if (!isAdmin) {
      return ApiForbiddenResponse({
        description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
      });
    }
    return this.userService.findAll(corrId);
  }

  @Get(':id')
  @ApiOperation({
    summary: `Get user by id`,
    description: `Return a user resource by it's id\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    description: `Return the found user resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiNotFoundResponse({
    description: `The user resource was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)`,
  })
  @ApiForbiddenResponse({
    description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
  })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @IsAdmin() isAdmin: boolean,
    @UserId() userId: number,
  ) {
    if (!isAdmin && id !== userId) {
      return ApiForbiddenResponse({
        description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
      });
    }
    return this.userService.findOne(corrId, id);
  }

  @Patch(':id/admin')
  @ApiOperation({
    summary: `Update user`,
    description: `Update a user resource by id with new values and return the updated resource.\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    description: `Return the updated user resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized, the user must be signed in\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description: `The user resource was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)`,
  })
  @ApiForbiddenResponse({
    description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserAdminDto })
  update(
    @CorrId() corrId: number,
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
    @IsAdmin() isAdmin: boolean,
  ) {
    if (!isAdmin) {
      return ApiForbiddenResponse({
        description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
      });
    }
    return this.userService.update(corrId, userId, id, updateUserAdminDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: `Delete user`,
    description: `Delete a user by id and return the deleted object\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)\`,`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    description: `Return the deleted user resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized, the user must be signed in\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description: `The user resource was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)`,
  })
  @ApiForbiddenResponse({
    description: `The user is not authorized to delete this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @IsAdmin() isAdmin: boolean,
  ) {
    if (!isAdmin) {
      throw new HttpException(
        `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
        403,
      );
    }
    return this.userService.remove(corrId, id);
  }
}
