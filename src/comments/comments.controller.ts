import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from 'src/decorators/user.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentDto } from './dto/comment.dto';

@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	//posts/:postId/comments(GET)
	// @Get(':postId')
	// async getAllComments(@Param('postId') postId: string): Promise<CommentDto[]> {
	// 	return this.commentsService.getAllComments(postId);
	// }

	//posts/:postId/comments(POST)
	// @UseGuards(AccessTokenGuard)
	// @Post()
	// async createComment(
	// 	@CurrentUser('sub') sub: string,
	// 	@Body() dto: CreateCommentDto,
	// ): Promise<void> {
	// 	this.commentsService.createComment(sub, dto);
	// }

	//posts/:postId/comments/:commentId(PUT)
	// @UseGuards(AccessTokenGuard)
	// @Put(':commentId')
	// async updateCommentById(
	// 	@Param('commentId') commentId: string,
	// 	@Body() dto: UpdateCommentDto,
	// ): Promise<void> {
	// 	this.commentsService.updateCommentById(commentId, dto);
	// }

	//posts/:postId/comments/:commentId(DELETE)
	// @UseGuards(AccessTokenGuard)
	// @Delete(':commentId')
	// async deleteCommentById(
	// 	@Param('commentId') commentId: string,
	// ): Promise<void> {
	// 	this.commentsService.deleteCommentById(commentId);
	// }
}
