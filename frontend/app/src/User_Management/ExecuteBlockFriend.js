export function initBlockRequest()
{
    const userSender = Number(localStorage.getItem('id-online'));
    const userRecipient = Number(localStorage.getItem('block-friend-id'));
    const selectedUserName = localStorage.getItem('block-username-id');
    document.getElementById('block-friend-name').textContent = selectedUserName;
    createAndSetBotton(userSender, userRecipient);
}

function createAndSetBotton(userSender, userRecipient)
{
    const Yesboton = document.getElementById('Block-yes-botton');
    Yesboton.addEventListener('click', async function() 
    {
        const success = await BlockFriend(userSender, userRecipient);
        if (success)
        {
            window.history.pushState({}, "", "Friends");
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    });
}

async function BlockFriend(userSender, userRecipient)
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/block_friend/`, 
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_sender: userSender,
                user_recipient: userRecipient
            })
        });
        if (!response.ok) 
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }   
        return true;
    } 
    catch (error) 
    {
        alert('Error blocking friend. Please try again');
        return false;
    }
}
