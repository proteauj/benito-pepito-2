export {};

declare global {
  interface Window {
    Square: {
      payments: (
        appId: string,
        locationId: string
      ) => {
        card: () => Promise<{
          attach: (element: HTMLElement | string) => Promise<void>;
          tokenize: () => Promise<any>;
        }>;
      };
    };
  }
}