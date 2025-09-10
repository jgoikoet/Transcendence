import { exectNavarUpdate } from './SetterNavBarUI.js'
import { ROUTES } from './SetterRoutes.js'
import { execScript } from './SetterScriptEntryPoint.js'
import { terminateGame } from "../PongGame/LocalMultiplayer.js"
import { terminateGameIA } from "../PongGame/SinglePlayerIA.js"
import { terminateCobeteGame } from "../localCobeteGame/cobeteGame.js"
import { terminateCobeteGameOnline } from "../cobeteOnline/cobeteGameOnline.js"
import { connectWebSocket } from '../User_Management/Chat.js'

export async function initializeChatSocket() 
{
    const userId = Number(localStorage.getItem('id-online'));
    const token = localStorage.getItem('accessToken');
    if (userId && token)
    {
        if (!window.chatSocket || window.chatSocket.readyState !== WebSocket.OPEN)
        {
            window.chatSocket = connectWebSocket(userId);
        }
    }
}

window.onpopstate = () => {
    handleQueryParams();
    loadWindowLocation();
};

window.onload = async () => {
    await initializeChatSocket();
    handleQueryParams();
    loadWindowLocation();
};

document.addEventListener("click", (event) => {
    if (!event.target.matches(".spa-route"))
        return;
    navigationEventHandler(event);
});

function navigationEventHandler(event) 
{
    event.preventDefault();
    const path = event.target.dataset.path || event.target.href;
    window.history.pushState({}, "", path);
    loadWindowLocation();
}

function handleOAuthRedirect() 
{
    exectNavarUpdate();
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access');
    const refreshToken = params.get('refresh');
    const userData = params.get('user');
    const oauth2fa = params.get('oauth2fa');

    if (oauth2fa) {
        showOAuth2FAVerification(oauth2fa);
    } else if (accessToken && refreshToken && userData) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', userData);
    }
}

function showOAuth2FAVerification(userId) 
{
    const verificationForm = `
        <div class="container mt-5">
            <div class="card mx-auto mb-4 border-dark" style="max-width: 500px;">
                <div class="card-header text-center bg-dark" style="color: #f6f8fa;">
                    <h5><b>Two-Factor Authentication</b></h5>
                </div>
                <div class="card-body">
                    <form id="oauth2faForm">
                        <div class="mb-3">
                            <label for="twoFACode" class="form-label">Enter 2FA Code</label>
                            <input type="text" class="form-control" id="twoFACode" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Verify</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.getElementById('spa-template-content').innerHTML = verificationForm;
    document.getElementById('oauth2faForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('twoFACode').value;
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        try {
            const response = await fetch(`${baseUrl}/user_management/api/oauth-2fa-verify/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, user_id: userId }),
            });
            const data = await response.json();
            if (response.ok) 
            {
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.history.pushState({}, "", "/PrivateProfile");
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
            else
            {
                throw new Error(`HTTP error! status: ${data}`);
            }
        } 
        catch (error) 
        {
            alert('Error during 2FA verification. Please try again.');
        }
    });
}

window.onload = function() {
    handleOAuthRedirect();
    loadWindowLocation();
};

function handleQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const oauth2fa = urlParams.get('oauth2fa');
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const oauth2faHash = hashParams.get('oauth2fa');
    if (oauth2fa || oauth2faHash) {
        const userId = oauth2fa || oauth2faHash;
        showOAuth2FAVerification(userId);
        window.history.replaceState({}, document.title, window.location.pathname);
        return true; 
    }
    return false;
}

window.addEventListener('load', handleQueryParams);
window.addEventListener('popstate', handleQueryParams);

export async function loadWindowLocation() 
{
    if (handleQueryParams()) 
        return;
    handleQueryParams();
    const location = window.location;
    const locationPath = (location.length === 0) ? "/" : location.pathname;
	if (window.route && window.route.dispose)
		window.route.dispose();
    window.route = ROUTES[locationPath] || ROUTES["404"];
    try {
        const response = await fetch(window.route.template);
        if (!response.ok) 
            throw new Error('Network response was not ok');
        const html = await response.text();
        document.getElementById("spa-template-content").innerHTML = html;
        document.title = window.route.title;
        document.querySelector('meta[name="description"]').setAttribute("content", window.route.description);
        terminateGame();
        terminateGameIA();
        terminateCobeteGame();
        terminateCobeteGameOnline();
        execScript(locationPath, window.route);
		if (window.route.init)
			window.route.init();
        exectNavarUpdate();
    } 
    catch (error) 
    {
        alert('Error loading HTML. Please try again.');
    }
}
