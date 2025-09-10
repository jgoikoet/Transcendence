export function initDeleteFriendScript()
{
    const userRecipient = localStorage.getItem('delete-friend-id');
    const userSender = Number(localStorage.getItem('id-online'));
    const selectedUserName = localStorage.getItem('delete-friend-username');
    document.getElementById('delete-friend-name').textContent = selectedUserName;
    createAndSetBotton(userSender, userRecipient);
}

function createAndSetBotton(userSender, userRecipient)
{
    const button = document.getElementById('delete-yes-botton');
    button.addEventListener('click', async function()
    {
        const success = await removeFriend(userSender, userRecipient);
        if (success)
        {
            window.history.pushState({}, "", "Friends");
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    });
}
    
async function removeFriend(userSender, userRecipient)
{
    const token = localStorage.getItem("accessToken");
    try
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/delete_friend/${userSender}/${userRecipient}/`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) 
            throw new Error(`HTTP error! status: ${response.status}`);
        return true;
    } 
    catch (error) 
    {
        alert('Error deleting friend. Please try again');
        return false;
    }  
}
