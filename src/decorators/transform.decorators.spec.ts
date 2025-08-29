/* eslint-disable sonarjs/no-duplicate-string */
import { handlePhoneNumber } from './transform.decorators';

describe('handlePhoneNumber', () => {
	// Case 1: Local number with leading 0
	it('should return correct E.164 format for local number with leading 0', () => {
		const input = { dialCode: '+84', phone: '0763726339' };
		const result = handlePhoneNumber(input.phone, input.dialCode);
		expect(result).toBe('+84763726339');
	});

	// Case 2: Local number without leading 0
	it('should return correct E.164 format for local number without leading 0', () => {
		const input = { dialCode: '+84', phone: '763726339' };
		const result = handlePhoneNumber(input.phone, input.dialCode);
		expect(result).toBe('+84763726339');
	});

	// Case 3: Number with country code and leading 0
	it('should return correct E.164 format for number with country code and leading 0', () => {
		const input = { dialCode: '+84', phone: '840763726339' };
		const result = handlePhoneNumber(input.phone, input.dialCode);
		expect(result).toBe('+84763726339');
	});

	// Case 4: Number with +84 and leading 0
	it('should return correct E.164 format for number with +84 and leading 0', () => {
		const input = { dialCode: '+84', phone: '+840763726339' };
		const result = handlePhoneNumber(input.phone, input.dialCode);
		expect(result).toBe('+84763726339');
	});

	// Case 5: Correctly formatted E.164 number
	it('should return the correct E.164 format for already valid number', () => {
		const input = { dialCode: '+84', phone: '+84763726339' };
		const result = handlePhoneNumber(input.phone, input.dialCode);
		expect(result).toBe('+84763726339');
	});

	// Case 7: Phone number with 00
	it('should return correct E.164 format for phone number with 0', () => {
		const input = { dialCode: '+81', phone: '09012345678' };
		const result = handlePhoneNumber(input.phone, input.dialCode);
		expect(result).toBe('+819012345678');
	});
});
