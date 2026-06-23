import { NotFoundError } from './NotFoundError';
import { ErrorCodeEnum } from './ErrorCodeEnum';

describe('NotFoundError', () => {
  it('builds multilingual messages for a target', () => {
    const error = new NotFoundError('Task');
    const response = error.getResponse() as {
      code: string;
      message: string;
      messages: { en: string; ru: string; uz: string };
    };

    expect(error.getStatus()).toBe(404);
    expect(response.code).toBe(ErrorCodeEnum.NOT_FOUND);
    expect(response.messages).toEqual({
      en: 'Task not found',
      ru: 'Task не найден',
      uz: 'Task topilmadi',
    });
  });
});
