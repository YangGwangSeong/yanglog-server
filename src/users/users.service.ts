import * as uuid from 'uuid';
import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { UserInfo } from './UserInfo';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ulid } from 'ulid';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class UsersService {
    constructor(
        private emailService: EmailService,
        private authService: AuthService,
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
        private dataSource: DataSource,
        ){}
    
    async createUser(name: string, email: string, password: string) {
        const userExist = await this.checkUserExists(email);
        if (userExist) {
            throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.');
        }

        const signupVerifyToken = uuid.v1();

        const chkSaveUser = await this.saveUser(name, email, password, signupVerifyToken);
        if(chkSaveUser){
            await this.sendMemberJoinEmail(email, signupVerifyToken);
        }
    }

    async verifyEmail(signupVerifyToken: string): Promise<string> {
        
        const user = await this.usersRepository.findOneBy({ signupVerifyToken:signupVerifyToken });

        if (!user ) {
            throw new NotFoundException('유저가 존재하지 않습니다.');
        }

        return this.authService.login({
            id: user.id,
            name: user.name,
            email: user.email,
        })
    }

    async login(email: string, password: string): Promise<{accessToken: string}> {

        const user = await this.usersRepository.findOneBy({email: email, password: password});
        if (!user) {
            throw new NotFoundException('유저가 존재하지 않습니다.');
        }

        const accessToken = this.authService.login({
            id: user.id,
            name: user.name,
            email: user.email,
        });

        return { accessToken : accessToken };
    }

    async getUserInfo(userId: string): Promise<UserInfo> {
        const user = await this.usersRepository.findOneBy({ id: userId });

        if (!user){
            throw new NotFoundException('유저가 존재하지 않습니다');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
        }
    }

    async getUserAll(): Promise<UserEntity[]> {

        return await this.usersRepository.find();
    }

    private async checkUserExists(emailAddress: string): Promise<boolean> {
        const user = await this.usersRepository.findOneBy({email: emailAddress});

        return user !== null;
    }

    private async saveUser(name: string, email: string, password: string, signupVerifyToken: string) {

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = new UserEntity();
            user.id = ulid();
            user.name = name;
            user.email = email;
            user.password = password;
            user.signupVerifyToken = signupVerifyToken;

            //await this.usersRepository.save(user);
            await queryRunner.manager.save(user);
            //트랜잭션 테스트 위한 에러발생
            //throw new InternalServerErrorException();
            await queryRunner.commitTransaction();

        } catch (e) {
            //error
            //console.log("에러발생체크");
            await queryRunner.rollbackTransaction();
            return false;
        } finally {
            await queryRunner.release();
        }

        return true;
        
    }

    private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
        await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
    }


}
