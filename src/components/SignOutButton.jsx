import { googleLogout } from '@react-oauth/google';
import { BryntumButton } from '@bryntum/calendar-react';
import Cookies from 'js-cookie';

function SignOutButton({
    accessToken,
    setAccessToken,
    setEvents,
    setModalVisible
}) {

    const handleSignOut = () => {
        Cookies.remove('google_access_token', { path : '/' });
        googleLogout();
        setAccessToken(null);
        setEvents();
        setModalVisible(true);
    };

    if (!accessToken) return null;

    return (
        <BryntumButton
            text="Sign Out"
            icon="b-fa-sign-out"
            cls="b-raised"
            color="b-blue"
            onClick={handleSignOut}
        />
    );
}

export default SignOutButton;