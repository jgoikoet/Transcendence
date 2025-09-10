export function initListSearch() 
{
    const searchInput = document.getElementById('search-username');
    const buttonInput = document.getElementById('search-user-form');
    const resultsContainer = document.getElementById('results-list');

    buttonInput.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (query.length > 1) {
            searchUsers(query, resultsContainer);
        } else {
            resultsContainer.innerHTML = '';
        }
    });

    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        if (query.length > 1) {
            searchUsers(query, resultsContainer);
        } else {
            resultsContainer.innerHTML = '';
        }
    });
}

async function searchUsers(query, resultsContainer) 
{
    const userSender = Number(localStorage.getItem('id-online'));
    const myFriends = await fetchFriends(userSender);
    const users = await fetchUsers();
    const matches = users.filter(user => 
        user.user__username.toLowerCase().includes(query.toLowerCase())
    );
    displayResults(matches, userSender, myFriends, resultsContainer);
}

export async function fetchFriends(userSender) 
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/friends/${userSender}/`, 
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) 
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const friends = await response.json();
        return friends;
    } 
    catch (error) 
    {
        alert('Error fetching users. Please try again');
        return [];
    }
}

async function fetchUsers() 
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/auth/users/list/`, 
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) 
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        return users;
    } 
    catch (error) 
    {
        alert('Error fetching usernames. Please try again');
        return [];
    }
}

function displayResults(matches, userSender, myFriends, resultsContainer) 
{
    resultsContainer.innerHTML = '';
    const friendsArray = myFriends || [];
    matches.forEach(match => {
        if (match.user__id === userSender) 
        {
            return;
        }
        const item = document.createElement('li');
        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        item.textContent = match.user__username;
        const isFriend = friendsArray.some(friend => friend.user_sender === match.user__id || friend.user_recipient === match.user__id);
        if (!isFriend) 
        {
            const addButton = document.createElement('button');
            addButton.classList.add('btn', 'btn-success', 'btn-sm', 'spa-route');
            addButton.setAttribute('data-path', '/ExecuteFriendRequest');
            addButton.style.border = '2px solid black';
            addButton.style.fontWeight = 'bold';
            addButton.textContent = 'ADD';
            addButton.addEventListener('click', () => setFriend(match.user__id, match.user__username));
            item.appendChild(addButton);
        }
        resultsContainer.appendChild(item);
    });
}

function setFriend(userId, user__username) 
{
    localStorage.setItem('selectedUser', user__username);
    localStorage.setItem('selectedID', userId);
}
