import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { OPERATIONS } from '../../../common/constants/Operations';
import { EmailMessageEntity } from '../../../domain';
import { OperationOriginEnum } from '../../../infra/operations';
import { logger, OperationReporter } from '../../../lib/logger';
import {
  buildEmailClassificationPrompt,
  MAX_OUTPUT_TOKENS,
  OPENAI_TIMEOUT_MS,
  SYSTEM_PROMPT,
} from '../prompts/EmailClassificationPrompt';
import {
  ContentValidationError,
  ExtractionResult,
  ExtractionResultSchema,
  LlmRefusalError,
} from '../schema';

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
      timeout: OPENAI_TIMEOUT_MS,
    });
  }

  async classifyEmail(
    email: EmailMessageEntity,
  ): Promise<{ extraction: ExtractionResult; raw: Record<string, unknown> }> {
    const model = this.configService.getOrThrow<string>('OPENAI_MODEL');
    const emailMessageId = email.getId().toString();
    const userPrompt = buildEmailClassificationPrompt({
      from: email.getFrom(),
      to: email.getTo(),
      subject: email.getSubject(),
      text: email.getText(),
    });

    OperationReporter.received(OPERATIONS.CLASSIFY_EMAIL, OperationOriginEnum.EXTERNAL, {
      emailMessageId,
      providerMessageId: email.getProviderMessageId(),
      model,
    });

    const startedAt = Date.now();

    try {
      const response = await this.client.responses.create({
        model,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        input: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        text: {
          format: zodTextFormat(ExtractionResultSchema, 'extraction_result'),
        },
      });

      if (response.error) {
        throw new Error(`OpenAI response error: ${response.error.message}`);
      }

      const refusal = this.extractRefusal(response);
      if (refusal) {
        throw new LlmRefusalError(refusal);
      }

      const outputText = response.output_text;
      if (!outputText) {
        throw new ContentValidationError('OpenAI returned empty output');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(outputText);
      } catch {
        throw new ContentValidationError('OpenAI returned malformed JSON');
      }

      const validation = ExtractionResultSchema.safeParse(parsed);
      if (!validation.success) {
        logger.warn(`LLM output failed zod validation: ${validation.error.message}`);
        throw new ContentValidationError(validation.error.message);
      }

      OperationReporter.success(OPERATIONS.CLASSIFY_EMAIL, OperationOriginEnum.EXTERNAL, {
        emailMessageId,
        providerMessageId: email.getProviderMessageId(),
        model,
        durationMs: Date.now() - startedAt,
        isActionable: validation.data.isActionable,
      });

      return {
        extraction: validation.data,
        raw: response as unknown as Record<string, unknown>,
      };
    } catch (error) {
      OperationReporter.error(OPERATIONS.CLASSIFY_EMAIL, OperationOriginEnum.EXTERNAL, {
        emailMessageId,
        providerMessageId: email.getProviderMessageId(),
        model,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  private extractRefusal(response: OpenAI.Responses.Response): string | null {
    for (const item of response.output ?? []) {
      if (item.type === 'message') {
        for (const content of item.content ?? []) {
          if (content.type === 'refusal') {
            return content.refusal;
          }
        }
      }
    }

    return null;
  }
}
