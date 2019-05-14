export type AuthenticationChangeListener = (isAuthenticated: boolean) => void;

export interface Config {
    apiKey: string;
    clientId: string;
    discoveryDocs: string;
    scope: string;
}
