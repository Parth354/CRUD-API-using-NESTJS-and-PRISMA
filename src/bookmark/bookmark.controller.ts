import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/index';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {

    constructor(private service:BookmarkService){}

    @Get()
    getBookmarks(@GetUser('id') userId:number ){
     return this.service.getBookmarks(userId)
    }
     
    @Get(':id')
    getBookmarkbyId(@GetUser('id') userId:number
    ,@Param('id', ParseIntPipe) bookmarkId: number
    ){
        return this.service.getBookmarkById(userId,bookmarkId) 
    }
    
    @Post()
    createBookmark(@GetUser('id') userId:number ,
    @Body() dto:CreateBookmarkDto
    ){
        return this.service.createBookmark(userId,dto) 
    }
    
    @Patch(':id')
    editBookmarkbyId(@GetUser('id') userId:number
    ,@Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto:EditBookmarkDto
    ){
        return this.service.editBookmarkbyId(userId,bookmarkId,dto) 
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkbyId(@GetUser('id') userId:number
    ,@Param('id', ParseIntPipe) bookmarkId: number
    ){
        return this.service.deleteBookmarkbyId(userId,bookmarkId) 
    }
}
