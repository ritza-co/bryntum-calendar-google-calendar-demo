import { BryntumButton } from '@bryntum/calendar-react';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { listCalendarEvents } from '../crudFunctions';

function SignInButton({
    setModalVisible,
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

    return (
        <BryntumButton
            cls="b-raised"
            text="Sign in with Google"
            icon="b-fa-g"
            color='b-blue'
            onClick={login}
        />
    );
}

export default SignInButton;