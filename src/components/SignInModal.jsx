import { useEffect } from 'react';
import { FocusTrap } from 'focus-trap-react';
import { BryntumButton } from '@bryntum/calendar-react';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { listCalendarEvents } from '../crudFunctions';

function SignInModal({
    isModalVisible,
    setModalVisible,
    accessToken,
    setAccessToken,
    setEvents
}) {

    const login = useGoogleLogin({
        onSuccess : (tokenResponse) => {
            Cookies.set('google_access_token', tokenResponse.access_token, { expires : 1, path : '/' });
            setAccessToken(tokenResponse.access_token);
            setModalVisible(false);
            listCalendarEvents(tokenResponse.access_token, setEvents);
        },
        onError : (err) => {
            console.error('Login Failed:', err);
        },
        scope                : 'https://www.googleapis.com/auth/calendar.events',
        use_fedcm_for_prompt	: true
    });

    // Prevent page scrolling when modal is open
    useEffect(() => {
        if (isModalVisible) {
            const scrollY = window.scrollY;
            document.body.style.overflowY = 'hidden';
            window.scrollTo(0, 0);
            return () => {
                document.body.style.overflowY = 'auto';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isModalVisible]);

    useEffect(() => {
        if (accessToken) {
            setModalVisible(false);
        }
    }, [accessToken, setModalVisible]);

    return (
        isModalVisible ? (
            <FocusTrap focusTrapOptions={{ initialFocus : '.b-raised', escapeDeactivates : false }}>
                <div className="sign-in-modal">
                    <div className="sign-in-modal-content">
                        <div className="sign-in-modal-content-text">
                            <h2>Sign in with Google</h2>
                            <p>Sign in to view and manage events from your Google Calendar</p>
                        </div>

                        <BryntumButton
                            cls="b-raised"
                            text="Sign in with Google"
                            icon="b-fa-g"
                            color='b-blue'
                            onClick={login}
                        />
                    </div>
                </div>
            </FocusTrap>
        ) : null
    );
}

export default SignInModal;