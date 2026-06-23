import { Types } from 'mongoose';
import { EmailMessageSchema, EmailMessageStatus } from '../../../database';

export class EmailMessageEntity {
  protected _id?: Types.ObjectId;
  protected _providerMessageId?: string;
  protected _from?: string;
  protected _to?: string;
  protected _subject?: string;
  protected _text?: string;
  protected _html?: string;
  protected _receivedAt?: Date;
  protected _status?: EmailMessageStatus;
  protected _companyId?: Types.ObjectId;
  protected _resolvedUserId?: Types.ObjectId;
  protected _llmRawResult?: Record<string, unknown>;
  protected _taskId?: Types.ObjectId;
  protected _error?: string;
  protected _createdAt?: Date;
  protected _updatedAt?: Date;

  buildId(id: Types.ObjectId): this {
    this._id = id;
    return this;
  }

  buildProviderMessageId(providerMessageId: string): this {
    this._providerMessageId = providerMessageId;
    return this;
  }

  buildFrom(from: string): this {
    this._from = from;
    return this;
  }

  buildTo(to: string): this {
    this._to = to;
    return this;
  }

  buildSubject(subject?: string): this {
    this._subject = subject;
    return this;
  }

  buildText(text: string): this {
    this._text = text;
    return this;
  }

  buildHtml(html?: string): this {
    this._html = html;
    return this;
  }

  buildReceivedAt(receivedAt: Date): this {
    this._receivedAt = receivedAt;
    return this;
  }

  buildStatus(status: EmailMessageStatus): this {
    this._status = status;
    return this;
  }

  buildCompanyId(companyId?: Types.ObjectId): this {
    this._companyId = companyId;
    return this;
  }

  buildResolvedUserId(resolvedUserId?: Types.ObjectId): this {
    this._resolvedUserId = resolvedUserId;
    return this;
  }

  buildLlmRawResult(llmRawResult?: Record<string, unknown>): this {
    this._llmRawResult = llmRawResult;
    return this;
  }

  buildTaskId(taskId?: Types.ObjectId): this {
    this._taskId = taskId;
    return this;
  }

  buildError(error?: string): this {
    this._error = error;
    return this;
  }

  getId(): Types.ObjectId {
    return this._id!;
  }

  getProviderMessageId(): string {
    return this._providerMessageId!;
  }

  getFrom(): string {
    return this._from!;
  }

  getTo(): string {
    return this._to!;
  }

  getSubject(): string | undefined {
    return this._subject;
  }

  getText(): string {
    return this._text!;
  }

  getHtml(): string | undefined {
    return this._html;
  }

  getReceivedAt(): Date {
    return this._receivedAt!;
  }

  getStatus(): EmailMessageStatus {
    return this._status!;
  }

  getCompanyId(): Types.ObjectId | undefined {
    return this._companyId;
  }

  getResolvedUserId(): Types.ObjectId | undefined {
    return this._resolvedUserId;
  }

  getLlmRawResult(): Record<string, unknown> | undefined {
    return this._llmRawResult;
  }

  getTaskId(): Types.ObjectId | undefined {
    return this._taskId;
  }

  getError(): string | undefined {
    return this._error;
  }

  convertToEntity(
    doc: EmailMessageSchema & {
      _id?: Types.ObjectId;
      createdAt?: Date;
      updatedAt?: Date;
    } | null,
  ): EmailMessageEntity | null {
    if (!doc) {
      return null;
    }

    return new EmailMessageEntity()
      .buildId(doc._id!)
      .buildProviderMessageId(doc.providerMessageId)
      .buildFrom(doc.from)
      .buildTo(doc.to)
      .buildSubject(doc.subject)
      .buildText(doc.text)
      .buildHtml(doc.html)
      .buildReceivedAt(doc.receivedAt)
      .buildStatus(doc.status)
      .buildCompanyId(doc.companyId)
      .buildResolvedUserId(doc.resolvedUserId)
      .buildLlmRawResult(doc.llmRawResult)
      .buildTaskId(doc.taskId)
      .buildError(doc.error);
  }

  convertToSchema(): Partial<EmailMessageSchema> {
    return {
      providerMessageId: this._providerMessageId,
      from: this._from,
      to: this._to,
      subject: this._subject,
      text: this._text,
      html: this._html,
      receivedAt: this._receivedAt,
      status: this._status,
      companyId: this._companyId,
      resolvedUserId: this._resolvedUserId,
      llmRawResult: this._llmRawResult,
      taskId: this._taskId,
      error: this._error,
    };
  }
}
