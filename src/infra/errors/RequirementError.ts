import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from './AppHttpException';
import { ErrorCodeEnum } from './ErrorCodeEnum';
import { MultilingualMessage } from './MultilingualMessage';

export class RequirementError extends AppHttpException {
  constructor(field: string, messages?: MultilingualMessage) {
    super(
      messages ?? {
        en: `'${field}' is required field`,
        ru: `Поле '${field}' является обязательным`,
        uz: `'${field}' maydoni majburiy`,
      },
      HttpStatus.BAD_REQUEST,
      ErrorCodeEnum.VALIDATION_ERROR,
    );
  }
}
