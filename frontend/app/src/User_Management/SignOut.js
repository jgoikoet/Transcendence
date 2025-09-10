export function doSignOut()
{
    initSignOut();
}

function initSignOut() 
{
    const signOutButton = document.getElementById('signOutButton');
    if (signOutButton) 
    {
        signOutButton.addEventListener('click', function(event) 
        {
            event.preventDefault();
            handleSignOut();
            window.chatSocket.close();
        });
    } 
}

async function handleSignOut() 
{
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.history.pushState({}, "", "/Login");
        window.dispatchEvent(new PopStateEvent('popstate'));      
    } 
    catch (error) 
    {
        console.error('Error during signout:', error);
    }
}
