import { Module } from '@nestjs/common';

import { NFTQueueService } from './nft-queue.service';
import { TokenQueueService } from './token-queue.service';

@Module({
	providers: [TokenQueueService, NFTQueueService],
})
export class QueueModule {}
