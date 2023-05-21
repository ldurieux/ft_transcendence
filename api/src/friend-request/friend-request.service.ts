import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './friend-request.entity';

import { User } from 'src/user/user.entity';

@Injectable()
export class FriendRequestService {
    constructor(
        @InjectRepository(FriendRequest)
        private reqRepository: Repository<FriendRequest>,
    ) {}

    async send(from: User, to: User): Promise<boolean> {
        let req: FriendRequest = await this.reqRepository.findOne({
            where: {
                requester: { id: from.id },
                receiver: { id: to.id },
            }
        });
        if (req) {
            throw new HttpException("Request already sent", HttpStatus.CONFLICT);
        }

        req = new FriendRequest;
        req.requester = from;
        req.receiver = to;

        await this.reqRepository.save(req);
        return true;
    }

    async get(requestId: number) : Promise<FriendRequest> {
        let req: FriendRequest = await this.reqRepository.findOne({
            where: {
                id: requestId
            },
            relations: {
                requester: true,
                receiver: true,
            }
        })
        if (!req) {
            throw new HttpException("Request not found", HttpStatus.NOT_FOUND);
        }

        return req;
    }

    async accept(self: User, from: User): Promise<boolean> {
        let req: FriendRequest = await this.reqRepository.findOne({
            where: {
                requester: { id: from.id },
                receiver: { id: self.id },
            }
        });
        if (!req) {
            throw new HttpException("Friend request not found", HttpStatus.NOT_FOUND);
        }

        await this.reqRepository.remove(req);
        return true;
    }

    async reject(self: User, from: User): Promise<boolean> {
        let req: FriendRequest = await this.reqRepository.findOne({
            where: {
                requester: { id: from.id },
                receiver: { id: self.id },
            }
        });
        if (!req) {
            throw new HttpException("Friend request not found", HttpStatus.NOT_FOUND);
        }

        await this.reqRepository.remove(req);
        return true;
    }

    async hasRequest(self: User, other: User): Promise<boolean> {
        let req = await this.reqRepository.findOne({
            where: {
                requester: { id: other.id },
                receiver: { id: self.id }
            }
        })
        if (req) {
            return true;
        }
        return false;
    }
}
