export async function listCalendarEvents(accessToken, setEvents) {
    if (!accessToken) return;

    const now = new Date();
    const twoWeeksBack = new Date(now);
    twoWeeksBack.setDate(now.getDate() - 14);
    const twoWeeksForward = new Date(now);
    twoWeeksForward.setDate(now.getDate() + 14);

    const query = new URLSearchParams({
        timeMin      : twoWeeksBack.toISOString(),
        timeMax      : twoWeeksForward.toISOString(),
        singleEvents : 'true',
        maxResults   : '100',
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

