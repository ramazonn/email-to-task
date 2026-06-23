export interface ApiErrorPayload {
  clientMessage: string;
  code: string;
}

export interface ApiSuccessResponse<T = Record<string, unknown>> {
  error: null;
  statusCode: number;
  data: T;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
  statusCode: number;
}

export type ApiResponse<T = Record<string, unknown>> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;
