import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";


@Controller('auth')
export class AuthController {
    constructor(prisma:PrismaService,private authService: AuthService) { }
    //@HttpCode(HttpStatus.ok) ok- means 200 this is usedto send custom status code
    @Post('signup')
    signup(@Body() dto:AuthDto) {   //@ Req could also be used which imports the express req but it would not make the code reusable if the framework is added to the application or changed
        return this.authService.signup(dto);

    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto:AuthDto) {

        return this.authService.signin(dto);
    }
}