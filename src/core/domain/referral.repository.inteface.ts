import { type TRegisterReferralHistory } from '../../core/entities/referral.entity';

export interface IReferralRepository {
	createReferralHistory(
		item: TRegisterReferralHistory,
	): Promise<{ id: string }>;
}
