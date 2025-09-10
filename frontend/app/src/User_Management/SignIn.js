import {connectWebSocket} from "./Chat.js"

export function initSignIn() {
    const signInForm = document.getElementById('signInForm');
    if (signInForm)
        signInForm.addEventListener('submit', handleSignIn);
    else 
        console.error('Sign in form not found. DOM structure:', document.body.innerHTML);
}

async function handleSignIn(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    try {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/users/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) 
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (data.require_2fa) {
                const twoFactorCode = prompt('Enter your 2FA code:');
                if (twoFactorCode) {
                    const twoFactorResponse = await fetch(`${baseUrl}/user_management/api/users/login/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, password, two_factor_code: twoFactorCode }),
                    });

                    if (twoFactorResponse.ok) {
                        const twoFactorData = await twoFactorResponse.json();
                        localStorage.setItem('accessToken', twoFactorData.access);
                        localStorage.setItem('refreshToken', twoFactorData.refresh);
                        window.history.pushState({}, "", "/PrivateProfile");
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                    else
                    {
                        const error = await twoFactorResponse.json();
                        throw new Error(`HTTP error! status: ${error}`);
                    }
                }
            } 
            else 
            {
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                window.history.pushState({}, "", "/PrivateProfile");
                window.dispatchEvent(new PopStateEvent('popstate'));
                window.dispatchEvent(new Event('locationchange'));
                const user_id = Number(data.user_id);
                if (!window.chatSocket || window.chatSocket.readyState !== WebSocket.OPEN) 
                    window.chatSocket = connectWebSocket(user_id);
                setFriendsColor();          

            }
        } else {
            const error = await response.json();
        }
    } catch (error) {
        var errorMessage = document.getElementById('error-div');
        errorMessage.innerHTML = "Invalid username or password";
        errorMessage.style.color = "red";
    }
}

async function setFriendsColor()
{
    const messagePending = await fetchTotalMessagesNotRead();
    if (messagePending === true)
    {
        const chatIcon = document.getElementById('Chat');
        chatIcon.style.color = 'red';
    }
}

async function fetchTotalMessagesNotRead()
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/messages/read/total/`, 
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) 
        {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        return data.message;
    } 
    catch (error) 
    {
        alert('Error fetching messages. Please try again');
        return false;
    }
}
