import { useEffect } from 'react';
import { FocusTrap } from 'focus-trap-react';
import { BryntumButton } from '@bryntum/calendar-react';
import SignInButton from './SignInButton';

function SignInModal({
    isModalVisible,
    setModalVisible,
    accessToken,
    setAccessToken,
    setEvents
}) {

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

    useEffect(() => {
        if (isModalVisible) {
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    setModalVisible(false);
                }
            };

            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isModalVisible, setModalVisible]);

    return (
        isModalVisible ? (
            <FocusTrap focusTrapOptions={{ initialFocus : '.b-raised' }}>
                <div className="sign-in-modal">
                    <div className="sign-in-modal-content">
                        <div className="sign-in-modal-content-text">
                            <h2>Sign in with Google</h2>
                            <p>Sign in to view and manage events from your Google Calendar</p>
                        </div>
                        <BryntumButton
                            icon='b-fa-xmark'
                            cls="b-transparent b-rounded close-modal"
                            onClick={()=> setModalVisible(false)}
                        />
                        <SignInButton
                            setModalVisible={setModalVisible}
                            setAccessToken={setAccessToken}
                            setEvents={setEvents}
                        />
                    </div>
                </div>
            </FocusTrap>
        ) : null
    );
}

export default SignInModal;