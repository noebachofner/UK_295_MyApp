import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../user/decorators';
import { SignInDto } from '../dto/sign-in.dto';
import { AuthGuard } from '../user/guards/auth.guard';
import { CreateUserDto, ReturnUserDto } from '../user/dto';
import { UserService } from '../user/services/user.service';
import { TokenInfoDto } from '../dto/token-info.dto';
import { CorrId } from '../../../decorators/corr-id.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private userService: UserService) {}

  @Post('login')
  @ApiOperation({
    summary: `Sign in a user`,
    description: `Sign in a user resource`,
  })
  @ApiCreatedResponse({
    description: `Return the token info\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)`,
    type: TokenInfoDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description:
      'User not found\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiOperation({
    summary: `Sign in a user`,
    description: `Sign in a user resource`,
  })
  @ApiBody({
    type: SignInDto,
  })
  signIn(@CorrId() corrId: number, @Body() signInDto: SignInDto) {
    this.logger.log(
      `${corrId} ${this.signIn.name} with: ${JSON.stringify(signInDto, null, 2)}`,
    );
    return this.userService.signIn(corrId, signInDto);
  }

  @Post('register')
  @ApiOperation({
    summary: `Register a new user`,
    description: `Register a new user resource`,
  })
  @ApiCreatedResponse({
    description: `Return the created user resource\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)`,
    type: ReturnUserDto,
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiConflictResponse({
    description: `The username already exists\n\n[Referenz zu HTTP 409](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/409)`,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  register(@CorrId() corrId: number, @Body() registerDto: CreateUserDto) {
    this.logger.log(
      `${corrId} ${this.register.name} with: ${JSON.stringify(registerDto, null, 2)}`,
    );
    return this.userService.create(corrId, 0, registerDto);
  }

  @Get('profile')
  @ApiOperation({
    summary: `Get the user profile`,
    description: `Return the user profile`,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: `Return the user profile\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
    type: ReturnUserDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  getProfile(@User() user: ReturnUserDto) {
    return user;
  }
}
