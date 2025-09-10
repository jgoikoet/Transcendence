import { connectWebSocket } from "./Chat.js";

export function initRegister()
{
    document.getElementById('signupForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        const signUpData = {
            username: username,
            email: email,
            password: password,
            first_name: first_name,
            last_name: last_name,
        };
        if (!username || !email || !password || !first_name || !last_name) {
            alert('Please fill in all required fields');
            return;
        }
        const dataJSON = JSON.stringify(signUpData);
        try {
            const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
            const response = await fetch(`${baseUrl}/user_management/api/users/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: dataJSON,
            });

            
            if (response.ok) 
            {
                const updatedData = await response.json();
                localStorage.setItem('accessToken', updatedData.access);
                const user_id = Number(updatedData.id);
                window.history.pushState({}, "", "/PrivateProfile");
                window.dispatchEvent(new PopStateEvent('popstate'));
                window.dispatchEvent(new Event('locationchange'));
                if (!window.chatSocket || window.chatSocket.readyState !== WebSocket.OPEN) 
                    window.chatSocket = connectWebSocket(user_id);
            } 
            else 
            {
                if (response.status === 409)
                {
                    var errorMessage = document.getElementById('error-div-register');
                    errorMessage.innerHTML = "Invalid and/or existing user";
                    errorMessage.style.color = "red";
                    return;
                }
                const error = await response.json();
                throw new Error(`HTTP error! status: ${error}`);
            }
        } catch (error) {
            alert('Error during registration. Please try again');
        }
    });
}
