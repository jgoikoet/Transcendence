import { getUsername } from './FriendsWait.js'

export function initFriendsRequest() 
{
    let resultsContainer = document.getElementById('results-list');
    fetchFriendsPending().then(friends => {
        displayResults(friends, resultsContainer);
    });
}

async function fetchFriendsPending() 
{
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem('id-online');
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/pending_recipient/${userId}/`, 
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
        alert('Error fetching pending friend requests. Please try again.');
        return [];
    }
}

async function Add_Friend_Final(userSender, userRecipient) 
{
    const token = localStorage.getItem("accessToken");
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try 
    {
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/friends_accept/`, 
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_sender: userSender,
                user_recipient: userRecipient,
            })
        });
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        return true;
    } 
    catch (error) 
    {
        alert('Error accepting friend request. Please try again.');
        return false;
    }
}

async function delete_friend_from_requestList(userSender, userRecipient)
{
    const  token = localStorage.getItem("accessToken");
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try
    {
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
        alert('Error denying friend request. Please try again.');
        return false;
    }  
}
    
async function displayResults(friends, resultsContainer) 
{
    if (!resultsContainer) 
        return;
    resultsContainer.innerHTML = '';
    if (friends != 0)
    {
        for (const friend of friends) 
        {
            const userId = Number(localStorage.getItem('id-online'));
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
            const yesButton = document.createElement('button');
            yesButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-2');
            yesButton.style.border = 'solid black';
            yesButton.style.width = '60px';
            yesButton.innerHTML = '<b>Yes</b>';
            const noButton = document.createElement('button');
            noButton.classList.add('btn', 'btn-danger', 'btn-sm', 'text-white');
            noButton.style.border = 'solid black';
            noButton.style.width = '60px';
            noButton.innerHTML = '<b>No</b>';
            rightDiv.appendChild(yesButton);
            rightDiv.appendChild(noButton);
            yesButton.addEventListener('click', async function()
            {
                const success = await Add_Friend_Final(friend.user_sender, friend.user_recipient);
                friendRequestRedir(success);
            });
            noButton.addEventListener('click', async function() 
            {
                const success = await delete_friend_from_requestList(friend.user_sender, friend.user_recipient);
                friendRequestRedir(success);
            }); 
            listItem.appendChild(leftDiv);
            listItem.appendChild(rightDiv);
            resultsContainer.appendChild(listItem);
        };
    }
}

function friendRequestRedir(success)
{
    if (success)
    {
        window.history.pushState({}, "", "FriendsRequest");
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}
