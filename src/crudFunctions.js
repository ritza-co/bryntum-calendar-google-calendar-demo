function getCurrentWeekBoundaries() {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay()); // Subtract days to get to Sunday
    sunday.setHours(0, 0, 0, 0); // Start of day

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6); // Add 6 days to get to Saturday
    saturday.setHours(23, 59, 59, 999); // End of day

    return { sunday, saturday };
}

export async function listInitialCalendarEvents(accessToken, setEvents) {
    if (!accessToken) return;

    const { sunday, saturday } = getCurrentWeekBoundaries();

    const query = new URLSearchParams({
        timeMin      : sunday.toISOString(),
        timeMax      : saturday.toISOString(),
        singleEvents : 'true',
        maxResults   : '250', // default value = 250
        orderBy      : 'startTime'
    });

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, {
        headers : {
            Authorization : `Bearer ${accessToken}`
        }
    });
    if (!res.ok) {
        throw new Error('Error fetching events:', res.statusText);
    }
    const data = await res.json();
    if (!data.items) return;
    const formattedEvents = data.items.map(ev => ({
        id        : ev.id,
        name      : ev.summary,
        startDate : ev.start.dateTime || ev.start.date,
        endDate   : ev.end.dateTime   || ev.end.date,
        allDay    : !ev.start.dateTime
    }));
    setEvents(formattedEvents);
}

export async function listCalendarEvents(accessToken, setEvents) {
    if (!accessToken) return;

    const { sunday: lowerBoundary, saturday: upperBoundary } = getCurrentWeekBoundaries();

    lowerBoundary.setDate(lowerBoundary.getDate() - 1);
    lowerBoundary.setHours(23, 59, 59, 999);
    upperBoundary.setDate(upperBoundary.getDate() + 1);
    upperBoundary.setHours(0, 0, 0, 0);

    const pastEventsQuery = new URLSearchParams({
        timeMax      : lowerBoundary.toISOString(),
        singleEvents : 'true',
        maxResults   : '2500', // maximum number of events that can be fetched in one request
        orderBy      : 'startTime'
    });

    const futureEventsQuery = new URLSearchParams({
        timeMin      : upperBoundary.toISOString(),
        singleEvents : 'true',
        maxResults   : '2500',
        orderBy      : 'startTime'
    });

    const [pastRes, futureRes] = await Promise.all([
        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${pastEventsQuery}`, {
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        }),
        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${futureEventsQuery}`, {
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        })
    ]);

    if (!pastRes.ok) {
        throw new Error('Error fetching events:', pastRes.statusText);
    }
    if (!futureRes.ok) {
        throw new Error('Error fetching events:', futureRes.statusText);
    }

    const [pastData, futureData] = await Promise.all([
        pastRes.json(),
        futureRes.json()
    ]);

    if (!pastData.items) return;
    if (!futureData.items) return;

    const formatEvents = items => items.map(ev => ({
        id        : ev.id,
        name      : ev.summary,
        startDate : ev.start.dateTime || ev.start.date,
        endDate   : ev.end.dateTime || ev.end.date,
        allDay    : !ev.start.dateTime
    }));

    const pastEvents = formatEvents(pastData.items);
    const futureEvents = formatEvents(futureData.items);
    setEvents(currentEvents => {
        return [...pastEvents, ...currentEvents, ...futureEvents];
    });
}

export function BryntumSync(
    id,
    name,
    startDate,
    endDate,
    allDay,
    action,
    setEvents,
    accessToken
) {
    if (!accessToken) return;

    const baseUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const formatAllDayDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const eventData = {
        summary : name,
        start   : allDay ? { date : formatAllDayDate(startDate) } : { dateTime : new Date(startDate).toISOString() },
        end     : allDay ? { date : formatAllDayDate(endDate) }   : { dateTime : new Date(endDate).toISOString() }
    };

    if (action === 'add') {
        fetch(baseUrl, {
            method  : 'POST',
            headers : {
                Authorization  : `Bearer ${accessToken}`,
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(eventData)
        })
            .then(res => res.json())
            .then(data => {
                if (!data.id) throw new Error('Calendar API error');
                const newEvent = {
                    id        : data.id,
                    name      : data.summary,
                    startDate : data.start.dateTime || data.start.date,
                    endDate   : data.end.dateTime   || data.end.date,
                    allDay    : !data.start.dateTime
                };
                setEvents(prev => [...prev, newEvent]);
            })
            .catch(err => console.error('Error creating event:', err));
    }
    else if (action === 'update') {
        if (!id || id.startsWith('_generated')) return;
        fetch(`${baseUrl}/${id}`, {
            method  : 'PUT',
            headers : {
                Authorization  : `Bearer ${accessToken}`,
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(eventData)
        })
            .then(res => res.json())
            .then(data => {
                if (!data.id) throw new Error('Calendar API error');
                const updatedEvent = {
                    id        : data.id,
                    name      : data.summary,
                    startDate : data.start.dateTime || data.start.date,
                    endDate   : data.end.dateTime   || data.end.date,
                    allDay    : !data.start.dateTime
                };
                setEvents(prevEvents =>
                    prevEvents.map(evt => (evt.id === id ? updatedEvent : evt))
                );
            })
            .catch(err => console.error('Error updating event:', err));
    }
    else if (action === 'remove') {
        if (id.startsWith('_generated')) return;
        fetch(`${baseUrl}/${id}`, {
            method  : 'DELETE',
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        })
            .then(() => {
                setEvents(prevEvents => prevEvents.filter(evt => evt.id !== id));
            })
            .catch(err => console.error('Error deleting event:', err));
    }
}

