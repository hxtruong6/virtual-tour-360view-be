// create module for admin to import all admin related modules
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { AuthModule } from '../../modules/auth/auth.module';
// Should be imported from marketplace module
import { AuctionModule } from '../../modules/marketplace/auctions/auctions.module';
import { ContentModule } from '../../modules/marketplace/contents/contents.module';
import { NftModule } from '../../modules/marketplace/nfts/nfts.module';
import { UserModule } from '../../modules/marketplace/users/users.module';
import { WalletModule } from '../../modules/marketplace/wallets/wallets.module';

@Module({
	imports: [
		NftModule, // for listing nfts
		AuthModule,
		AuctionModule,
		ContentModule,
		NftModule,
		UserModule,
		WalletModule,
		RouterModule.register([
			{
				path: 'markets',
				children: [
					{ path: 'auctions', module: AuctionModule },
					{ path: 'content', module: ContentModule },
					{ path: 'nfts', module: NftModule },
					{ path: 'users', module: UserModule },
					{ path: 'wallet', module: WalletModule },
				],
			},
		]),
	],
})
export class MarketPlaceModule {}
