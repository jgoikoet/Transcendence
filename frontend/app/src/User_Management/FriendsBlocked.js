import { getUsername } from './FriendsWait.js'

export function initFriendsBlocked() 
{
    const userId = Number(localStorage.getItem('id-online'));
    let resultsContainer = document.getElementById('results-list');
    fetchFriendsBlocked(userId).then(friends => {
        displayResults(friends, resultsContainer, userId);
    });
}

async function fetchFriendsBlocked(userId) 
{
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    const token = localStorage.getItem("accessToken");
    try 
    {
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/friends_blocked/${userId}/`, 
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
        return data;
    }
    catch (error) 
    {
        alert('Error fetching blocked friends. Please try again.');
        return [];
    }
}

function SetToUnblockFriend(friendid, usernameid) 
{
    localStorage.setItem("block-friendId",friendid);
    localStorage.setItem("block-username",usernameid);
}

async function displayResults(friends, resultsContainer, userId) 
{
    if (!resultsContainer) 
        return;
    resultsContainer.innerHTML = '';
    for (const friend of friends) 
    {
        let idToFind;
        if (userId === friend.user_sender)
            idToFind = friend.user_recipient;
        else
            idToFind = friend.user_sender;
        const username = await getUsername(idToFind);
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        const leftDiv = document.createElement('div');
        leftDiv.classList.add('d-flex', 'align-items-center');
        const friendName = document.createElement('p');
        friendName.classList.add('mb-0');
        friendName.textContent = username;
        leftDiv.appendChild(friendName);
        const rightDiv = document.createElement('div');
        rightDiv.classList.add('d-flex', 'justify-content-end');
        const unblockButton = document.createElement('button');
        unblockButton.classList.add('btn', 'btn-danger', 'btn-sm', 'text-white', 'spa-route');
        unblockButton.setAttribute('data-path', '/ExecuteUnblockedFriend');
        unblockButton.style.border = 'solid black';
        unblockButton.innerHTML = '<b class="spa-route" data-path="/ExecuteUnblockedFriend">Unblock</b>';
        rightDiv.appendChild(unblockButton);
        unblockButton.addEventListener('click', () => SetToUnblockFriend(idToFind, username));
        listItem.appendChild(leftDiv);
        listItem.appendChild(rightDiv);
        resultsContainer.appendChild(listItem);
    };
}
