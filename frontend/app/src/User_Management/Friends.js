import { handleSendMatchRequest } from './Chat.js'
import { fetchFriends } from './SearchUser.js'
import { getUsername } from './FriendsWait.js'

export function initFriends() 
{
	const chatIcon = document.getElementById('Chat');
        chatIcon.style.color = 'black';
    let resultsContainer = document.getElementById('results-list');
    const userId = Number(localStorage.getItem('id-online'));
    fetchFriends(userId).then(friends => {
        displayResults(friends, resultsContainer);
    });
}

function setBlockFriend(friendId, username)
{
    localStorage.setItem('block-friend-id', friendId);
    localStorage.setItem('block-username-id', username);
}


function removeFriend(friendId, username)
{
    localStorage.setItem('delete-friend-id', friendId);
    localStorage.setItem('delete-friend-username', username);
}

function setPublicProfileData(friendId, username) 
{
    localStorage.setItem('profile-friend-id', friendId);
    localStorage.setItem('profile-friend-username', username);
}

function setChatFriend(idToFind, userId, username) 
{
    localStorage.setItem('ChatUserId', userId);
    localStorage.setItem('ChatFriendId', idToFind);
    localStorage.setItem('ChatFriendName', username);
}

async function setMatch(idToFind, userId)
{
    var tournamentId = String(userId) + "_" + String(idToFind);
    localStorage.setItem('tournament_id', tournamentId);
    const matchPending = await checkMatchPending(idToFind);
    if (matchPending === true)
    {
        var errorMessage = document.getElementById('error-div-friends');
        errorMessage.innerHTML = "There is already a pending invitation with this user. Accept or cancel";
        errorMessage.style.color = "red";
        return;
    }
    else
        handleSendMatchRequest(window.chatSocket, idToFind);
    window.history.pushState({}, "", "OnlineFriends");
    window.dispatchEvent(new PopStateEvent('popstate'));
}

async function checkMatchPending(idToFind) 
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/messages/match/pending/${idToFind}/`, 
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
        return data.message;
    } 
    catch (error) 
    {
        alert('Error fetching pending invitations. Please try again');
        return false;
    }
}

function checkBlock(friend, userId)
{
    let whoIsBlock;
    if (userId === friend.user_sender)
        whoIsBlock = friend.user_recipient_blocked;
    else
        whoIsBlock = friend.user_sender_blocked;
    return (whoIsBlock);
}

async function fetchMessagesNotRead(idToFind)
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/messages/read/${idToFind}/`, 
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
        return data.message;
    } 
    catch (error) 
    {
        alert('Error fetching unread messages. Please try again');
        return false;
    }
}

async function displayResults(friends, resultsContainer)
{
    if (!resultsContainer) 
        return;
    resultsContainer.innerHTML = '';
    for (const friend of friends) 
    {
        const userId = Number(localStorage.getItem('id-online'));
        let idToFind;
        if (userId === friend.user_sender)
            idToFind = friend.user_recipient;
        else
            idToFind = friend.user_sender;
        localStorage.setItem('idToFind', idToFind);
        const username = await getUsername(idToFind);
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        const leftDiv = document.createElement('div');
        leftDiv.classList.add('d-flex', 'align-items-center');
        const removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger', 'spa-route', 'me-2');
        removeButton.setAttribute('aria-label', 'Remove');
        removeButton.setAttribute('data-path', '/ExecuteDeleteFriend');
        removeButton.style.padding = '2px 6px';
        removeButton.style.border = '1px solid black';
        removeButton.style.borderRadius = '50%';
        removeButton.style.fontSize = '0.875rem';
        const removeIcon = document.createElement('i');
        removeIcon.classList.add('bi', 'bi-x', 'text-white', 'spa-route');
        removeIcon.setAttribute('data-path', '/ExecuteDeleteFriend');
        removeButton.appendChild(removeIcon);
        removeButton.addEventListener('click', () => removeFriend(idToFind, username));
        const friendName = document.createElement('p');
        friendName.classList.add('spa-route');
        friendName.setAttribute('data-path', '/PublicProfile');
        friendName.classList.add('mb-0');
        friendName.style.fontWeight = 'bold';
        friendName.textContent = username;
        friendName.addEventListener("click", function() 
        {
            setPublicProfileData(idToFind, username);
        });
        friendName.addEventListener('mouseover', function() 
        {
            friendName.style.textDecoration = 'underline';
        });
        friendName.addEventListener('mouseout', function() 
        {
            friendName.style.textDecoration = 'none';
        });

        leftDiv.appendChild(removeButton);
        leftDiv.appendChild(friendName);
        const rightDiv = document.createElement('div');
        rightDiv.classList.add('d-flex', 'justify-content-end', 'align-items-center');
        const isBlocked = checkBlock(friend, userId);
        if (!isBlocked) 
        {
            const blockButton = document.createElement('button');
            blockButton.classList.add('btn', 'btn-info', 'btn-sm', 'me-2', 'text-white', 'spa-route');
            blockButton.setAttribute('data-path', '/ExecuteBlockFriend');
            blockButton.style.width = '65px';
            blockButton.innerHTML = '<b class="spa-route" data-path="/ExecuteBlockFriend">Block</b>';
            blockButton.addEventListener('click', () => setBlockFriend(idToFind, username));
            const chatButton = document.createElement('button');
            chatButton.classList.add('btn', 'btn-primary', 'btn-sm', 'me-2', 'text-white', 'spa-route');
            chatButton.setAttribute('data-path', '/Chat');
            chatButton.style.width = '65px';
            chatButton.innerHTML = '<b class="spa-route" data-path="/Chat">Chat</b>';
            chatButton.addEventListener('click', () => setChatFriend(idToFind, userId, username));
            const matchButton = document.createElement('button');
            matchButton.classList.add('btn', 'btn-warning', 'btn-sm', 'me-2', 'text-white', 'spa-route');
            matchButton.style.width = '65px';
            matchButton.innerHTML = '<b>Match</b>';
            matchButton.addEventListener('click', () => setMatch(idToFind, userId));
            let isOnline = friend.is_online;
            const onlineDiv = document.createElement('div');     
            onlineDiv.style.width = '65px';
            if (isOnline)
            {
                onlineDiv.style.color = "green";
                onlineDiv.innerHTML = '<b>Online</b>';
            }
            else 
            {
                onlineDiv.style.color = "red";
                onlineDiv.innerHTML = '<b>Offline</b>';
            }
            rightDiv.appendChild(blockButton);
            rightDiv.appendChild(chatButton);
            rightDiv.appendChild(matchButton);
            rightDiv.appendChild(onlineDiv);
        }
        listItem.appendChild(leftDiv);
        listItem.appendChild(rightDiv);
        let messagesPending = await fetchMessagesNotRead(idToFind);
        if (messagesPending === true)
            listItem.style.backgroundColor = "lightblue";
        resultsContainer.appendChild(listItem);
    };
}
