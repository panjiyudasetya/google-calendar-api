import {
    IBatchEventResponse,
    ICalendarEvent,
    IDeleteRequest,
    IFetchEventResponse,
    IGetInRangeRequestParams,
    IGetRequestParams,
} from './types';

interface IGoogleEventApi {
    /**
     * Get event from Google Calendar.
     * @param gapi      Google API.
     * @param request   object {@see IGetRequestParams}.
     * @param eventId   event ID.
     */
    getEvent(gapi: any, request: IGetRequestParams): Promise<IFetchEventResponse>;
    /**
     * Get events from Google Calendar.
     * @param gapi      Google API.
     * @param request   object {@see IGetInRangeRequestParams}.
     */
    getEventsInRange(gapi: any, request: IGetInRangeRequestParams): Promise<IFetchEventResponse>;
    /**
     * Create events on Google Calendar in batch.
     * @param gapi      Google API.
     * @param events    item that will be created on Google Calendar.
     */
    createEvents(gapi: any, events: ICalendarEvent[]): Promise<IBatchEventResponse>;
    /**
     * Update events on Google Calendar in batch.
     * @param gapi      Google API.
     * @param events    item that will be updated on Google Calendar.
     */
    updateEvents(gapi: any, events: ICalendarEvent[]): Promise<IBatchEventResponse>;
    /**
     * Delete events on Google Calendar in batch.
     * @param gapi      Google API.
     * @param requests  an array which contain information of calendar id and event id that should be deleted.
     */
    deleteEvents(gapi: any, requests: IDeleteRequest[]): Promise<IBatchEventResponse>;
    /**
     * Bulk requests to insert/update/delete in one go
     * @param gapi              Google API.
     * @param insertCandidates  candidate of events that should be inserted
     * @param updateCandidates  candidate of events that should be updated
     * @param deleteCandidates  candidate of events that should be deleted
     */
    eventBulkRequests(
        gapi: any,
        insertCandidates: ICalendarEvent[],
        updateCandidates: ICalendarEvent[],
        deleteCandidates: IDeleteRequest[],
    ): Promise<IBatchEventResponse>;
}

class GoogleEventApi implements IGoogleEventApi {
    /** @inheritdoc */
    getEvent(gapi: any, request: IGetRequestParams): Promise<IFetchEventResponse> {
        return new Promise((resolve, reject) => {
            gapi.client.calendar.events
                .get({
                    calendarId: request.calendarId,
                    eventId: request.eventId,
                })
                .then((response: IFetchEventResponse) => resolve(response), reason => reject(reason));
        });
    }

    /** @inheritdoc */
    getEventsInRange(gapi: any, request: IGetInRangeRequestParams): Promise<IFetchEventResponse> {
        return new Promise((resolve, reject) => {
            const reqParams = {
                calendarId: request.calendarId,
                singleEvents: request.singleEvents,
                orderBy: request.orderBy,
                timeMin: request.startDate.toISOString(),
                timeMax: request.endDate.toISOString(),
            };

            if (request.showDeleted) {
                reqParams['showDeleted'] = request.showDeleted;
            }

            gapi.client.calendar.events
                .list(reqParams)
                .then((response: IFetchEventResponse) => resolve(response), reason => reject(reason));
        });
    }

    /** @inheritdoc */
    createEvents(gapi: any, events: ICalendarEvent[]): Promise<IBatchEventResponse> {
        return new Promise((resolve, reject) => {
            const batch = gapi.client.newBatch();
            events.forEach(event => {
                const id = event.resource.id ? event.resource.id : event.resource.extendedProperties.private.externalID;
                const request = gapi.client.calendar.events.insert({
                    calendarId: event.calendarId,
                    resource: event.resource,
                });
                batch.add(request, { id });
            });
            batch.then((response: IBatchEventResponse) => resolve(response), (reason: any) => reject(reason));
        });
    }

    /** @inheritdoc */
    updateEvents(gapi: any, events: ICalendarEvent[]): Promise<IBatchEventResponse> {
        return new Promise((resolve, reject) => {
            const batch = gapi.client.newBatch();
            events.forEach(event => {
                if (event.resource.id) {
                    const request = gapi.client.calendar.events.update({
                        calendarId: event.calendarId,
                        eventId: event.resource.id,
                        resource: event.resource,
                    });
                    batch.add(request, { id: event.resource.id });
                } else {
                    reject(new Error(`Event ID must be provided!\n${JSON.stringify(event)}`));
                }
            });
            batch.then((response: IBatchEventResponse) => resolve(response), (reason: any) => reject(reason));
        });
    }

    /** @inheritdoc */
    deleteEvents(gapi: any, requests: IDeleteRequest[]): Promise<IBatchEventResponse> {
        return new Promise((resolve, reject) => {
            const batch = gapi.client.newBatch();
            requests.forEach(req => {
                const request = gapi.client.calendar.events.delete({
                    calendarId: req.calendarId,
                    eventId: req.eventId,
                });
                batch.add(request, { id: req.eventId });
            });
            batch.then((response: IBatchEventResponse) => resolve(response), (reason: any) => reject(reason));
        });
    }

    /** @inheritdoc */
    eventBulkRequests(
        gapi: any,
        insertCandidates: ICalendarEvent[],
        updateCandidates: ICalendarEvent[],
        deleteCandidates: IDeleteRequest[],
    ): Promise<IBatchEventResponse> {
        return new Promise((resolve, reject) => {
            const batch = gapi.client.newBatch();
            insertCandidates.forEach(event => {
                const id = event.resource.id ? event.resource.id : event.resource.extendedProperties.private.externalID;
                const request = gapi.client.calendar.events.insert({
                    calendarId: event.calendarId,
                    resource: event.resource,
                });
                batch.add(request, { id });
            });
            updateCandidates.forEach(event => {
                if (event.resource.id) {
                    const request = gapi.client.calendar.events.update({
                        calendarId: event.calendarId,
                        eventId: event.resource.id,
                        resource: event.resource,
                    });
                    batch.add(request, { id: event.resource.id });
                } else {
                    reject(new Error(`Event ID must be provided!\n${JSON.stringify(event)}`));
                }
            });
            deleteCandidates.forEach(req => {
                const request = gapi.client.calendar.events.delete({
                    calendarId: req.calendarId,
                    eventId: req.eventId,
                });
                batch.add(request, { id: req.eventId });
            });
            batch.then((response: IBatchEventResponse) => resolve(response), (reason: any) => reject(reason));
        });
    }
}

export default GoogleEventApi;
