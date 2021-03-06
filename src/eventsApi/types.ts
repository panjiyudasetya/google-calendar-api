export type OrderType = 'startTime' | 'endTime';

export interface ICalTime {
    dateTime: string;
    timeZone?: string;
}

export interface ICalPerson {
    email: string;
    displayName: string;
    self: boolean;
}

export interface IAttendee {
    id?: string;
    email: string;
    displayName: string;
    organizer: boolean;
    self?: boolean;
    resource?: boolean;
    optional?: boolean;
    responseStatus?: string;
    comment?: string;
    additionalGuests?: number;
}

export interface IAttachment {
    fileUrl: string;
    title: string;
    mimeType: string;
    iconLink: string;
    fileId: string;
}

export interface ICalReminder {
    useDefault: boolean;
}

export interface IExtendedProperties {
    private: {
        externalID: string;
    };
}

export interface IBaseApiResponse {
    status: number;
    statusText: string;
}

export interface IEventResource {
    id?: string; // If not proviced, id will be generated by Calendar API automatically
    colorId?: string; // @see https://developers.google.com/calendar/v3/reference/colors
    summary: string;
    description: string;
    start: ICalTime;
    end: ICalTime;
    visibility: string;
    sendUpdates?: boolean;
    attendees?: IAttendee[];
    attachments?: IAttachment[];
    extendedProperties: IExtendedProperties;
}

export interface IEventResponse {
    iCalUID: string;
    id: string;
    kind: string;
    created: string;
    creator: ICalPerson;
    start: ICalTime;
    end: ICalTime;
    summary: string;
    description: string;
    visibility: string;
    htmlLink: string;
    etag: string;
    reminders: ICalReminder;
    status: string;
    organizer: ICalPerson;
    sequence: number;
    updated: string;
    extendedProperties: IExtendedProperties;
}

export interface ICalendarEvent {
    calendarId: string;
    resource: IEventResource;
}

export interface IFetchEventResponse extends IBaseApiResponse {
    result: {
        kind: string;
        summary: string;
        items: IEventResponse[];
        timeZone: string;
        updated: string;
    };
}

export interface IBatchItemEventResponse extends IBaseApiResponse {
    result: IEventResponse;
}

export interface IBatchEventResponse extends IBaseApiResponse {
    result: {
        [key: string]: IBatchItemEventResponse;
    };
}

export interface IDeleteRequest {
    calendarId: string; // Calendar ID. Use "primary" to retrieve events from your primary calendar.
    eventId: string; // ID of the event.
}

export interface IGetRequestParams {
    calendarId: string; // Calendar ID. Use "primary" to retrieve events from your primary calendar.
    eventId: string; // ID of the event.
}

export interface IGetInRangeRequestParams {
    calendarId: string; // Calendar ID. Use "primary" to retrieve events from your primary calendar.
    singleEvents: boolean; // Set to True when you need to make distinction of an events at the same start/end time. False otherwise.
    startDate: Date; // Start of date request.
    endDate: Date; // End of date request.
    orderBy: OrderType; // Order event according to available type. {@see OrderType}.
    showDeleted?: boolean; // Set to True when you need to show deleted events. False otherwise.
}
