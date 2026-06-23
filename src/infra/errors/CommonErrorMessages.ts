import { createMultilingualMessage } from './MultilingualMessage';

export const MISSING_COMPANY_API_KEY_HEADER_MESSAGE = createMultilingualMessage(
  'Missing x-company-api-key header',
  'Отсутствует заголовок x-company-api-key',
  'x-company-api-key sarlavhasi mavjud emas',
);

export const INVALID_COMPANY_API_KEY_HEADER_MESSAGE = createMultilingualMessage(
  'Invalid x-company-api-key header',
  'Некорректный заголовок x-company-api-key',
  'x-company-api-key sarlavhasi noto‘g‘ri',
);

export const MISSING_AUTHORIZATION_HEADER_MESSAGE = createMultilingualMessage(
  'Missing or invalid authorization header',
  'Отсутствует или некорректный заголовок авторизации',
  'Avtorizatsiya sarlavhasi yo‘q yoki noto‘g‘ri',
);

export const INVALID_AUTHORIZATION_HEADER_MESSAGE = createMultilingualMessage(
  'Invalid authorization header',
  'Некорректный заголовок авторизации',
  'Avtorizatsiya sarlavhasi noto‘g‘ri',
);

export const INVALID_AUTHORIZATION_CREDENTIALS_MESSAGE = createMultilingualMessage(
  'Invalid authorization credentials',
  'Некорректные учетные данные авторизации',
  'Avtorizatsiya ma’lumotlari noto‘g‘ri',
);

export const INVALID_CREDENTIALS_MESSAGE = createMultilingualMessage(
  'Invalid credentials',
  'Некорректные учетные данные',
  'Noto‘g‘ri hisob ma’lumotlari',
);

export const INTERNAL_SERVER_ERROR_MESSAGE = createMultilingualMessage(
  'Internal server error',
  'Внутренняя ошибка сервера',
  'Ichki server xatosi',
);

export const UNEXPECTED_ERROR_MESSAGE = createMultilingualMessage(
  'An unexpected error occurred',
  'Произошла непредвиденная ошибка',
  'Kutilmagan xatolik yuz berdi',
);
