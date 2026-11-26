export type ApiErrorKind = 'network' | 'timeout' | 'client' | 'server' | 'graphql';

const USER_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'Brak połączenia z serwerem. Sprawdź połączenie z internetem.',
  timeout: 'Serwer nie odpowiada. Spróbuj ponownie za chwilę.',
  client: 'Nie udało się wykonać zapytania.',
  server: 'Serwer jest chwilowo niedostępny. Spróbuj ponownie za chwilę.',
  graphql: 'Nie udało się pobrać danych.',
};

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get userMessage(): string {
    return USER_MESSAGES[this.kind];
  }

  // these are shown as a toast by errorInterceptor, the rest is handled by features
  get isGlobal(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }
}
