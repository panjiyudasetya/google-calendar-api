import {
    GoogleEventApi,
    IBatchEventResponse,
    ICalendarEvent,
    IDeleteRequest,
    IFetchEventResponse,
    IGetInRangeRequestParams,
    IGetRequestParams,
} from './eventsApi';

import { AuthenticationChangeListener, Config } from './types';

class CalendarService {
    private gapi: any = null;
    private eventApi: GoogleEventApi = null;
    private isAuthenticated: boolean = false;
    private config: Config;

    constructor(config: Config) {
        // GAPI Loader
        this.loadApi = this.loadApi.bind(this);
        // Authentication
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.isClientAuthenticated = this.isClientAuthenticated.bind(this);
        // Event
        this.getEventsInRange = this.getEventsInRange.bind(this);
        this.createEvents = this.createEvents.bind(this);
        this.updateEvents = this.updateEvents.bind(this);
        this.deleteEvents = this.deleteEvents.bind(this);
        // Class property
        this.config = config;
        this.eventApi = new GoogleEventApi();
    }

    /**
     * Listen on authentication changed.
     * @param callback handler when authentication status change.
     */
    public listenOnAuthenticationChanged(callback: AuthenticationChangeListener): Promise<void> {
        return this.whenApiReady().then(() => this.gapi.auth2.getAuthInstance().isSignedIn.listen(callback));
    }

    /** Signin with Google Account. */
    public signIn(): Promise<void> {
        if (this.isAuthenticated) {
            return Promise.resolve();
        }

        return this.whenApiReady().then(() => this.gapi.auth2.getAuthInstance().signIn());
    }

    /** Sign out from Google Account. */
    public signOut(): Promise<void> {
        if (!this.isAuthenticated) {
            return Promise.resolve();
        }

        return this.whenApiReady().then(() => {
            this.gapi.auth2.getAuthInstance().signOut();
            this.gapi.auth2.getAuthInstance().disconnect();
        });
    }

    /** @returns True if client authenticated, False otherwise. */
    public isClientAuthenticated(): Promise<boolean> {
        return this.whenApiReady().then(() => this.gapi.auth2.getAuthInstance().isSignedIn.get());
    }

    /**
     * Get events from Google Calendar.
     * @param request parameters.
     */
    public getEvent(request: IGetRequestParams): Promise<IFetchEventResponse> {
        return this.whenApiReady().then(() => this.eventApi.getEvent(this.gapi, request));
    }

    /**
     * Get events from Google Calendar.
     * @param request parameters.
     */
    public getEventsInRange(request: IGetInRangeRequestParams): Promise<IFetchEventResponse> {
        return this.whenApiReady().then(() => this.eventApi.getEventsInRange(this.gapi, request));
    }

    /**
     * Create events on Google Calendar in batch.
     * @param events item that will be created on Google Calendar.
     */
    public createEvents(events: ICalendarEvent[]): Promise<IBatchEventResponse> {
        return this.whenApiReady().then(() => this.eventApi.createEvents(this.gapi, events));
    }

    /**
     * Update events on Google Calendar in batch.
     * @param events item that will be updated on Google Calendar.
     */
    public updateEvents(events: ICalendarEvent[]): Promise<IBatchEventResponse> {
        return this.whenApiReady().then(() => this.eventApi.updateEvents(this.gapi, events));
    }

    /**
     * Delete events on Google Calendar in batch.
     * @param requests  an array which contain information of calendar id and event id that should be deleted.
     */
    public deleteEvents(requests: IDeleteRequest[]): Promise<IBatchEventResponse> {
        return this.whenApiReady().then(() => this.eventApi.deleteEvents(this.gapi, requests));
    }

    /**
     * Bulk requests to insert/update/delete in one go
     * @param insertCandidates  candidate of events that should be inserted
     * @param updateCandidates  candidate of events that should be updated
     * @param deleteCandidates  candidate of events that should be deleted
     */
    public eventBulkRequests(
        insertCandidates: ICalendarEvent[],
        updateCandidates: ICalendarEvent[],
        deleteCandidates: IDeleteRequest[],
    ): Promise<IBatchEventResponse> {
        return this.whenApiReady().then(() =>
            this.eventApi.eventBulkRequests(this.gapi, insertCandidates, updateCandidates, deleteCandidates),
        );
    }

    /**
     * Handler listener for each changes of Authentication status.
     * @param isAuthenticated True if it's authenticated, False otherwise.
     */
    private onAuthenticationChanged(isAuthenticated: boolean): void {
        this.isAuthenticated = isAuthenticated;
    }

    /** @return Promise True when Google Api ready to use, False otherwise. */
    private whenApiReady(): Promise<boolean> {
        if (this.gapi && this.gapi.auth2) {
            return Promise.resolve(true);
        }
        return this.loadApi();
    }

    /** Load Google Calendar Api */
    private loadApi(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.gapi = window['gapi'];
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            document.body.appendChild(script);
            script.onload = (): void =>
                window['gapi'].load('client:auth2', () => {
                    this.gapi = window['gapi'];
                    this.gapi.client
                        .init(this.config)
                        .then(() => {
                            // Listen for sign-in state changes.
                            this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.onAuthenticationChanged);
                            // Handle the initial sign-in state.
                            this.onAuthenticationChanged(this.gapi.auth2.getAuthInstance().isSignedIn.get());
                            resolve(true);
                        })
                        .catch((e: Error) => reject(e));
                });
        });
    }
}

export default CalendarService;
