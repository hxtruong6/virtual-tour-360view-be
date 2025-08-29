import { Injectable } from '@nestjs/common';

import { DBQueryDto } from '../../../common/dto/db-query.dto';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { IDataServices } from '../../../core/abstract/data-services.abstract';
import { UserRequestDto } from './dto/admin-user.request.dto';
import { UserDto, UserListResponseDto } from './dto/admin-user.response.dto';

@Injectable()
export class UserUseCase {
	constructor(private readonly dataServices: IDataServices) {}

	async getUsers(query: UserRequestDto): Promise<UserListResponseDto> {
		const user = await this.dataServices.users.getUsers({
			...new DBQueryDto(query),
			filter: {
				username: query.username,
				email: query.email,
				accountStatus: query.accountStatus,
			},
		});

		return new UserListResponseDto(
			user.items.map((item) => new UserDto(item)),
			new PageMetaDto({
				pageOptionsDto: query,
				itemCount: user.total,
			}),
		);
	}

	async getUserById(id: string) {
		return this.dataServices.users.getUserDetailById(id);
	}
}
