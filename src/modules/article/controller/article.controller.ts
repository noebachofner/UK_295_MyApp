import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from '../service/article.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { UserId } from '../../auth/user/decorators';
import { ReplaceArticleDto } from '../dto/replace-article.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReturnArticleDto } from '../dto/return-article.dto';
import { AuthGuard } from '../../auth/user/guards/auth.guard';

@Controller('article')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create article',
    description: 'Create a new article resource.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({
    type: ReturnArticleDto,
    description:
      'Return the created article resource\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)',
  })
  @ApiBody({ type: CreateArticleDto })
  create(@UserId() userId: number, @Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(userId, createArticleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all article',
    description: 'Return an array of article resources.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the found article resource array\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
    isArray: true,
  })
  findAll() {
    return this.articleService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get article by id',
    description: `Return a article resource by it's id.`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the found article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Replace article',
    description: `Replace a article resource by id with new values and return the replaced resource.`,
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the replaced article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiConflictResponse({
    description:
      'The article version mismatch\n\n[Referenz zu HTTP 409](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/409)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ReplaceArticleDto })
  replace(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() replaceDto: ReplaceArticleDto,
  ) {
    return this.articleService.replace(userId, id, replaceDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update article',
    description: `Update a article resource by id with new values and return the updated resource.`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the updated article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateArticleDto })
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.update(userId, id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete article',
    description: `Delete a article by id and return the deleted object.`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the deleted article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
