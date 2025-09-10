export async function initPublicProfile()
{
    const userName = localStorage.getItem('profile-friend-username');
    const userId = localStorage.getItem('profile-friend-id');
    const avatar = await getAvatar(userId);
    const dateCreated = await getDateCreated(userId);
    document.getElementById('PublicProfile-username').innerHTML = userName;
    document.getElementById('public-title-name').innerHTML = userName;
    document.getElementById('PublicAvatarImage').setAttribute("src", avatar);
    document.getElementById('date_joined_public').innerHTML = formatDate(dateCreated);
}

function formatDate(dateCreated)
{
    const date = new Date(dateCreated);
    const formattedDate = date.toLocaleString();
    return formattedDate;
}

async function getDateCreated(id)
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/auth/users/${id}/`, 
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
        const userData = await response.json();
        return userData.date_joined;
    }
    catch (error) 
    {
        alert('Error fetching user data. Please try again.');
        return [];
    }
}

async function getAvatar(id) 
{
    const token = localStorage.getItem("accessToken");
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/users/avatar/${id}/`, 
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
        return response.url;
    } 
    catch (error) 
    {
        alert('Error fetching avatar. Please try again.');
        return [];
    }
}
