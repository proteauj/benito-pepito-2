export {};

declare global {
  interface Window {
    Square: {
      payments: (
        appId: string,
        locationId: string
      ) => {
        card: (
          options?: {
            postalCode?: boolean;
            style?: Record<string, any>;
          }
        ) => Promise<{
          attach: (element: HTMLElement | string) => Promise<void>;
          tokenize: () => Promise<{
            status: string;
            token?: string;
            errors?: any[];
          }>;
        }>;
      }
    };
  }
}