import { loadWindowLocation } from './SPA_main_Setter.js'

export async function execScript(locationPath, route)
{
    if (locationPath === "/")
    {
        if (await isUserLoggedIn()) {
            window.history.replaceState({}, "", "/Home");
            loadWindowLocation();
            return;
        }
    }
    if (route.script) {
        const script = document.createElement('script');
        script.src = route.script;
        script.onload = function() {
            if (typeof window.initProfile === 'function') {
                window.initProfile();
            }
            else if (typeof window[`init${route.title.split(' | ')[0]}`] === 'function') {
                window[`init${route.title.split(' | ')[0]}`]();
            }
        };
        document.body.appendChild(script);
    }
}




export async function isTokenValid(token)
{
    if (!token)
        return false;
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try
    {
        const response = await fetch(`${baseUrl}/user_management/api/auth/test-token/`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 401)
            return false;
        if (!response.ok)
            throw new Error('Network response was not ok');
        return true;
    }
    catch (error)
    {
        if (error.message !== 'Network response was not ok') {
            alert('Error validating the token');
        }
        return false;
    }
}

export async function isUserLoggedIn()
{
    const token = localStorage.getItem('accessToken');
    if (token !== "undefined" && token !== null)
    {
        if (await isTokenValid(token))
            return 1;
        else
            return 0;
    }
}