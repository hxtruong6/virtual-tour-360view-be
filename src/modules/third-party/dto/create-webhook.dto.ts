import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUrl } from 'class-validator';

import { EPaymongoWebhookEvent } from '../../../common/constants/enums';
import { EnumField } from '../../../decorators';

export class CreateWebhookDto {
	@ApiProperty({
		description: 'List of events to subscribe to',
		example: [EPaymongoWebhookEvent.LINK_PAYMENT_PAID],
	})
	@IsArray()
	@ArrayMinSize(1)
	@EnumField(() => EPaymongoWebhookEvent, { each: true })
	events!: EPaymongoWebhookEvent[];

	@ApiProperty({
		description: 'Webhook URL to receive events',
		example: 'https://api.example.com/webhooks/paymongo',
	})
	@IsUrl()
	url!: string;
}
