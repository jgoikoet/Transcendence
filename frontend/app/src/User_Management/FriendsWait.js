export function initFriendsWait() {

    let resultsContainer = document.getElementById('results-list');
    fetchFriendsWaiting().then(friends => {
        displayResults(friends, resultsContainer);
    });
}

async function fetchFriendsWaiting() {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem('id-online');
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try 
    {

        const response = await fetch(`${baseUrl}/chat/chat/friend_requests/pending/${userId}/`, 
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
        alert('Error fetching pending requests. Please try again.');
        return [];
    }
}

export async function getUsername(idToFind)
{
    const token = localStorage.getItem("accessToken");
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try {
        const response = await fetch(`${baseUrl}/user_management/api/auth/users/${idToFind}/`, 
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
        return data.username;
    } 
    catch (error) 
    {
        alert('Error fetching usernames. Please try again.');
        return [];
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
        const username = await getUsername(idToFind);
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-center', 'align-items-center');
        const leftDiv = document.createElement('div');
        leftDiv.classList.add('d-flex', 'justify-content-center');
        const friendName = document.createElement('p');
        friendName.classList.add('mb-0', 'text-center',);
        friendName.textContent = username;
        leftDiv.appendChild(friendName);
        listItem.appendChild(leftDiv);
        resultsContainer.appendChild(listItem);
    };
}
