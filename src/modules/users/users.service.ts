import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt'
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { Watchlist } from '../watchlist/models/watchlist.model';
import { AuthUserResponse } from '../auth/response';
import { TokenService } from '../token/token.service';


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User) private readonly userRepository: typeof User,
        private readonly tokenService: TokenService
        ) {}

    async hashPassword (password: string): Promise<string> {
        try {
            return bcrypt.hash (password, 10)
        } catch (error) {
            throw new Error(error)
        }
    }

    async findUserByEmail (email: string): Promise<User> { 
        try {
            return this.userRepository.findOne({where: {email}});
        } catch (error) {
            throw new Error(error)
        }
    }


    async createUser(dto : CreateUserDTO): Promise<CreateUserDTO> {
        try {
            dto.password = await this.hashPassword(dto.password);
        await this.userRepository.create({
            firstName: dto.firstName,
            username: dto.username,
            email : dto.email,
            password: dto.password
        });
        return dto
        } catch (error) {
            throw new Error(error)
        }
    }

    async publicUser (email: string): Promise<AuthUserResponse> {
        try {
        const user =  await this.userRepository.findOne({
                where : {email},
                attributes: {exclude: ['password']},
                include: {
                    model: Watchlist,
                    required: false
                }
            })
            const token = await this.tokenService.generateJwtToken(user)
            return { user , token}
        } catch (error) {
            throw new Error(error)
        }
    }

    async updateUser (email: string, dto: UpdateUserDTO): Promise<UpdateUserDTO> {
        try {
            await this.userRepository.update(dto, {where: {email}})
        return dto
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteUser (email: string): Promise<boolean> {
        try {
            await this.userRepository.destroy({where: {email}})
        return true
        } catch (error) {
            throw new Error(error)
        }
    }
}
