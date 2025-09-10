export function initScriptFriendRequest()
{
    const userId = localStorage.getItem('id-online');
    const selectedUser = localStorage.getItem('selectedUser');
    const selectedId = localStorage.getItem('selectedID');
    document.getElementById('friend-name').textContent = selectedUser;
    createButton(selectedId, userId);
}

function createButton(selectedId, userId)
{
    const button = document.getElementById('yes-botton');
    button.addEventListener('click', async function()
    {
        const success = await createFriendRequest(selectedId, userId);
        if (success)
        {
            window.history.pushState({}, "", "SearchUser");
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    });
}
   
async function createFriendRequest(selectedId, userId)
{
    const usedIdInt = parseInt(userId, 10);
    const selectedIdInt = parseInt(selectedId, 10);
    const token = localStorage.getItem("accessToken");
    try
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/create/`,
        {
            method: 'POST',
            headers:
            {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
            { 
                user_sender: usedIdInt,
                user_recipient: selectedIdInt,
                user_sender_blocked: false,  
                user_recipient_blocked: false,
                status: 0
            })
        });
        if (!response.ok)
        {
            if (response.status === 409)
            {
                var errorMessage = document.getElementById('error-div-executeFriendRequest');
                errorMessage.innerHTML = "There is already a pending friend request with this user";
                errorMessage.style.color = "red";
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    } 
    catch (error)
    {
        alert('Error adding friend. Please try again');
        return false;
    } 
}
