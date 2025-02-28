import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BryntumCalendar } from '@bryntum/calendar-react';
import Cookies from 'js-cookie';
import SignInModal from './SignInModal';
import SignOutButton from './SignOutButton';
import { BryntumSync, listCalendarEvents } from '../crudFunctions';
import bryntumLogo from '../assets/bryntum-symbol-white.svg';
import '@bryntum/calendar/calendar.stockholm.css';
import '../css/App.css';

function App() {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState();
    const [isModalVisible, setModalVisible] = useState(true);
    const [accessToken, setAccessToken] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const syncData = useCallback(({ action, records }) => {
        if (action === 'add') {
            return;
        }
        records.forEach((record) => {
            BryntumSync(
                record.data.id,
                record.data.name,
                record.data.startDate,
                record.data.endDate,
                record.data.allDay,
                action,
                setEvents,
                accessToken
            );
        });
    }, [accessToken]);

    const addRecord = useCallback(({ eventRecord }) => {
        if (
            eventRecord.id.startsWith('_generated')
        ) {
            BryntumSync(
                eventRecord.data.id,
                eventRecord.data.name,
                eventRecord.data.startDate,
                eventRecord.data.endDate,
                eventRecord.data.allDay,
                'add',
                setEvents,
                accessToken
            );
        }
        else {
            BryntumSync(
                eventRecord.data.id,
                eventRecord.data.name,
                eventRecord.data.startDate,
                eventRecord.data.endDate,
                eventRecord.data.allDay,
                'update',
                setEvents,
                accessToken
            );
        }
    }, [accessToken]);

    const calendarConfig = useMemo(() => ({
        defaultMode      : 'month',
        eventEditFeature : {
            items : {
                nameField : {
                    required : true
                },
                resourceField   : null,
                recurrenceCombo : null
            }
        },
        eventMenuFeature : {
            items : {
                duplicate : null
            }
        },
        onDataChange     : syncData,
        onAfterEventSave : addRecord
    }), [syncData, addRecord]);

    useEffect(() => {
        async function fetchData() {
            const savedToken = Cookies.get('google_access_token');
            if (savedToken) {
                setAccessToken(savedToken);
                try {
                    await listCalendarEvents(savedToken, setEvents);
                }
                catch (error) {
                    console.error('Error fetching events:', error);
                }
            }
        }
        fetchData();
        setIsLoading(false);
    }, []);

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            { !accessToken && !isLoading ?
                <SignInModal
                    isModalVisible={isModalVisible}
                    setModalVisible={setModalVisible}
                    accessToken={accessToken}
                    setAccessToken={setAccessToken}
                    setEvents={setEvents}
                />
                : null
            }

            <header>
                <div className="title-container">
                    <img src={bryntumLogo} role="presentation" alt="Bryntum logo" />
                    <h1>Google Calendar Sign-in Demo</h1>
                </div>
                { accessToken ? (
                    <SignOutButton
                        accessToken={accessToken}
                        setAccessToken={setAccessToken}
                        setEvents={setEvents}
                        setModalVisible={setModalVisible}
                    />
                ) : null }
            </header>
            <BryntumCalendar
                ref={calendarRef}
                eventStore={{
                    data : events
                }}
                {...calendarConfig}
            />
        </GoogleOAuthProvider>
    );
}

export default App;
