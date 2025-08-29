/* eslint-disable @typescript-eslint/naming-convention */
export enum LanguageCode {
	en_US = 'en_US',
	// ru_RU = 'ru_RU',
	// vi_VN = 'vi_VN',
	ph_PH = 'ph_PH',
	// kr_KR = 'kr_KR',
	// cn_CN = 'cn_CN',
}

export const supportedLanguageCount = Object.values(LanguageCode).length;
