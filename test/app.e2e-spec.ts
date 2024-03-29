import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum'
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // won't let pass extra elements not defined indto or any other post request
    }
    ))
    await app.init();
    await app.listen(3333)
    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333')
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'a@app.com',
      password: '123'
    }
    describe('Signup', () => {
      it(`should throw if email empty`, () => {
        return pactum
          .spec()
          .post(`/auth/signup`,
          ).withBody({
            password: dto.password
          })
          .expectStatus(400)
      })

      it(`should throw if password empty`, () => {
        return pactum
          .spec()
          .post(`/auth/signup`,
          ).withBody({
            email: dto.email
          })
          .expectStatus(400)
      })

      it(`should throw if body empty`, () => {
        return pactum
          .spec()
          .post(`/auth/signup`,
          ).withBody({})
          .expectStatus(400)
      })

      it('should signup', () => {
        return pactum
          .spec()
          .post(`/auth/signup`,
          ).withBody(dto)
          .expectStatus(201)
      });
    });

    describe('Signin', () => {

      it(`should throw if email empty`, () => {
        return pactum
          .spec()
          .post(`/auth/signin`,
          ).withBody({
            password: dto.password
          })
          .expectStatus(400)
      })

      it(`should throw if password empty`, () => {
        return pactum
          .spec()
          .post(`/auth/signin`,
          ).withBody({
            email: dto.email
          })
          .expectStatus(400)
      })

      it(`should throw if body empty`, () => {
        return pactum
          .spec()
          .post(`/auth/signin`,
          ).withBody({})
          .expectStatus(400)
      })
      it('should signin', () => {
        return pactum
          .spec()
          .post(`/auth/signin`,
          ).withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token') // stores the access token recieved
      })
    })
  })

  describe('User', () => {

    describe('Get me', () => {
      it('get me the current user', () => {
        return pactum
          .spec()
          .get(`/users/me`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
      })
    })

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstname: "Parth",
          email: 'part@part.com'
        }
        return pactum
          .spec()
          .patch(`/users`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody({ dto })
          .expectStatus(200)
      })
    })
  })

  describe('Bookmark', () => {

    describe('Get empty bookmarks', () => {
      it('should get empty Bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBody([])

      })
    })

    describe('Create bookmarks', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://youtu.be/GHTA143_b-s?si=mvkqXhXdI7Xo7CP6'
      }

      it('should create Bookmarks', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      })
    })

    describe('Get bookmarks', () => {

      it('should get Bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(1);
      })
    })

    describe('Get bookmarks by Id', () => {
      it('should get Bookmarks by Id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectBodyContains('$S{bookmarkId}')
          .expectStatus(200)
      })
    })
    describe('Edit bookmarks', () => {
      const dto: EditBookmarkDto = {
        description: 'Hello Parth Great learning nest js'
      }
      it('should edit Bookmarks by Id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .withBody(dto)
          .expectBodyContains(dto.description)
      })

    })
    describe('Delete bookmarks', () => {
      it('should delete Bookmark by Id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(204)
      })
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(0);
      })
    })
  })
})