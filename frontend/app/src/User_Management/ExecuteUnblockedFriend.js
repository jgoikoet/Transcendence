export function initUnblockedFriendScript()
{
    const userRecipient = Number(localStorage.getItem('block-friendId'));
    const userSender = Number(localStorage.getItem('id-online'));
    const userName = localStorage.getItem('block-username');
    document.getElementById('unblock-friend-name').textContent = userName;
    createAndSetButton(userSender, userRecipient);
}

function createAndSetButton(userSender, userRecipient)
{
    const unblockButton = document.getElementById('Unblock-button');
    unblockButton.addEventListener('click', async function()
    {
        const success = await removeFriendBlocked(userSender, userRecipient);
        if (success)
        {
            window.history.pushState({}, "", "FriendsBlocked");
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    });
}

async function removeFriendBlocked(userSender, userRecipient)
{
    const token = localStorage.getItem("accessToken");
    try
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/unblock_friend/`,
        {
            method: 'POST',
            headers:
            {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
            {
                user_sender: userSender,
                user_recipient: userRecipient
            })
        });
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        return true;
    } 
    catch (error)
    {
        alert('Error removing blocked friend. Please try again');
        return false;
    }
}
