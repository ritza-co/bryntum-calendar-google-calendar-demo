import { useRef, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BryntumCalendar } from '@bryntum/calendar-react';
import Cookies from 'js-cookie';
import SignInModal from './SignInModal';
import SignOutButton from './SignOutButton';
import { BryntumSync, listCalendarEvents } from '../crudFunctions';
import bryntumLogo from '../assets/bryntum-symbol-white.svg';
import '@bryntum/calendar/calendar.stockholm.css';
import '../css/App.css';
import SignInButton from './SignInButton';

function App() {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState();
    const [isModalVisible, setModalVisible] = useState(true);
    const [accessToken, setAccessToken] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const syncData = ({ action, records }) => {
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
    };

    const addRecord = ({ eventRecord }) => {
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
    };

    const calendarConfig = {
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
    };

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
                { accessToken ?
                    <SignOutButton
                        accessToken={accessToken}
                        setAccessToken={setAccessToken}
                        setEvents={setEvents}
                        setModalVisible={setModalVisible}
                    />
                    : null
                }
                { !accessToken && !isLoading ?
                    <SignInButton
                        setModalVisible={setModalVisible}
                        setAccessToken={setAccessToken}
                        setEvents={setEvents}
                    />
                    : null
                }
            </header>
            <BryntumCalendar
                ref={calendarRef}
                eventStore={{
                    data : events
                }}
                {...calendarConfig}
            />
            <div className="notice-info">
                <div className="notice-info-container">
                    <p className='notice-info-text'>
                    This is a publicly accessible demonstration of the{' '}
                        <a href="https://bryntum.com/products/calendar/">
                          Bryntum Calendar Component.
                        </a>{' '}
                        By signing in, you’ll be able to see how real events from your
                        Google Calendar are displayed in the Bryntum Calendar. You’ll also
                        be able to edit your events in the Bryntum Calendar component and
                        see those changles reflect on your Google Calendar. Note that after
                        signing in, you’ll need to grant us read and write access to your
                        Google Calendar. We do not store any events for longer than needed
                        to display them and send any changes back to Google Calendar and we
                        do not do anything with your data beyond what is strictly needed for
                        the demonstration.
                    </p>
                    <p className='notice-info-links'>
                    To provide these features, we request access to your Google Calendar
                    data. View our
                        <a href="/privacypolicy.html"> Privacy Policy</a> and{' '}
                        <a href="/termsofservice.html">Terms of Service</a>.
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;
