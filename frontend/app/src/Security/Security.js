window.handleSignIn = async function({ username, password }) {
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try {
        const response = await fetch(`${baseUrl}/user_management/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });
        
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            const userData = {
                user_id: data.user_id,
                username: data.username
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            console.error('Login failed', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

async function refreshToken() {
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.error('No refresh token found');
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/user_management/api/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({refresh: refreshToken}),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.access);
            return data.access;
        } else {
            console.error('Failed to refresh token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}

async function makeApiRequest(url, method = 'GET', body = null) {
    let token = localStorage.getItem('accessToken');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        let response = await fetch(url, {method, headers, body: body ? JSON.stringify(body) : null});
        
        if (response.status === 401) {
            token = await refreshToken();
            headers.Authorization = `Bearer ${token}`;
            response = await fetch(url, {method, headers, body: body ? JSON.stringify(body) : null});
        }
        
        if (!response.ok) throw new Error('API request failed');
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
    }
}

window.makeApiRequest = makeApiRequest;