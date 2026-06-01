import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: T;
  rawBody: string;
  isSuccess: boolean;
  isClientError: boolean;
  isServerError: boolean;
}

export class ApiHelper {
  private request: APIRequestContext;
  private baseUrl: string = 'https://api.trademe.co.nz';
  private timeout: number = 30000;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async get<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  private async makeRequest<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const requestOptions: Parameters<APIRequestContext['fetch']>[1] = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      timeout,
    };

    if (body) {
      requestOptions.data = body;
    }

    const response: APIResponse = await this.request.fetch(url, requestOptions);
    const rawBody = await response.text();

    let parsedBody: T;
    try {
      parsedBody = JSON.parse(rawBody) as T;
    } catch {
      parsedBody = rawBody as unknown as T;
    }

    const status = response.status();
    const isSuccess = status >= 200 && status < 300;
    const isClientError = status >= 400 && status < 500;
    const isServerError = status >= 500;

    return {
      status,
      statusText: response.statusText(),
      headers: response.headers(),
      body: parsedBody,
      rawBody,
      isSuccess,
      isClientError,
      isServerError,
    };
  }

  async getResponseTime(endpoint: string): Promise<number> {
    const startTime = Date.now();
    await this.get(endpoint);
    return Date.now() - startTime;
  }

  hasFields(obj: unknown, fields: string[]): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const objRecord = obj as Record<string, unknown>;
    return fields.every(field => field in objRecord);
  }

  validateStructure(
    obj: unknown,
    schema: Record<string, string>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof obj !== 'object' || obj === null) {
      return {
        valid: false,
        errors: ['Response body is not an object'],
      };
    }

    const objRecord = obj as Record<string, unknown>;

    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in objRecord)) {
        errors.push(`Missing field: ${key}`);
        continue;
      }

      const actualType = typeof objRecord[key];
      if (actualType !== expectedType) {
        errors.push(
          `Field "${key}" has type "${actualType}", expected "${expectedType}"`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  assertSuccess(response: ApiResponse): void {
    if (!response.isSuccess) {
      throw new Error(
        `Expected successful response (2xx), got ${response.status} ${response.statusText}`
      );
    }
  }

  assertStatus(response: ApiResponse, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, got ${response.status}`
      );
    }
  }

  assertBodyContains(response: ApiResponse, expectedData: unknown): void {
    const actualStr = JSON.stringify(response.body);
    const expectedStr = JSON.stringify(expectedData);

    if (!actualStr.includes(expectedStr)) {
      throw new Error(
        `Response body does not contain expected data.\nExpected: ${expectedStr}\nActual: ${actualStr}`
      );
    }
  }
}
