import { ErrorCodeEnum, NotFoundError } from '../../infra';
import { SupportedLanguage } from '../i18n';
import { ResponseService } from './ResponseService';

describe('ResponseService', () => {
  let service: ResponseService;

  beforeEach(() => {
    service = new ResponseService();
  });

  it('wraps success payloads', () => {
    expect(service.success({ id: '1' }, 201)).toEqual({
      error: null,
      statusCode: 201,
      data: { id: '1' },
    });
  });

  it('wraps list-shaped payloads with success', () => {
    expect(service.success({ items: [{ id: '1' }], total: 1 })).toEqual({
      error: null,
      statusCode: 200,
      data: {
        items: [{ id: '1' }],
        total: 1,
      },
    });
  });

  it('wraps error payloads with application codes', () => {
    expect(
      service.error('Task not found', ErrorCodeEnum.NOT_FOUND, 404),
    ).toEqual({
      error: {
        clientMessage: 'Task not found',
        code: 'NOT_FOUND',
      },
      statusCode: 404,
    });
  });

  it('maps validation errors to VALIDATION_ERROR', () => {
    const payload = service.toErrorPayload(
      { message: ['providerMessageId must be a string'] },
      400,
    );

    expect(payload.code).toBe(ErrorCodeEnum.VALIDATION_ERROR);
    expect(payload.clientMessage).toContain('providerMessageId');
  });

  it('resolves multilingual app exceptions by accept-language', () => {
    const exception = new NotFoundError('Task').getResponse();
    const payload = service.toErrorPayload(exception, 404, SupportedLanguage.RU);

    expect(payload.clientMessage).toBe('Task не найден');
    expect(payload.code).toBe(ErrorCodeEnum.NOT_FOUND);
  });
});
