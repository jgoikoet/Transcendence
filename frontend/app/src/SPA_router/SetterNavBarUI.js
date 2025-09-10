import { initializeChatSocket } from './SPA_main_Setter.js'
import { isTokenValid } from './SetterScriptEntryPoint.js'

export async function exectNavarUpdate()
{
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const profileLink = document.getElementById("Private-profile-link");
    const avatarlink = document.getElementById("id-avatar");
    const avatarName = document.getElementById("id-username");
    const signoutLink = document.getElementById("signout-link");
    const ListSearchLink = document.getElementById("SearchUser-link");
    const FriendMenu = document.getElementById("Friends-Menu");
    const TournamentsMenu = document.getElementById("Tournaments-Menu");
    const WaitRoomLink =document.getElementById("WaitRoom");
    const ChatLink = document.getElementById("Chat");
    const homeDiv = document.getElementById("home1-div");
    const homeLetters = document.getElementById("home1-div-name");
    const retrievedToken = localStorage.getItem("accessToken");
    var isTokenOk = false;

    if (retrievedToken !== "undefined" && retrievedToken !== null)
        isTokenOk = await isTokenValid(retrievedToken);

    if (isTokenOk) 
    {
        await initializeChatSocket();
        let id = await getid();
        let avatar = await getAvatar(id.user_id);
        localStorage.setItem('id-online', id.user_id);
        document.getElementById('id-avatar').setAttribute("src", avatar);
        document.getElementById('id-username').textContent = id.username; 
        if (loginLink) 
            loginLink.parentElement.style.display = 'none';
        if (registerLink) 
            registerLink.parentElement.style.display = 'none';
        if (profileLink)
            profileLink.parentElement.style.display = '';
        if (signoutLink)
            signoutLink.parentElement.style.display = '';
        if (ListSearchLink)
            ListSearchLink.style.display = ''; 
        if (FriendMenu) 
            FriendMenu.style.display = '';
        if (TournamentsMenu) 
            TournamentsMenu.style.display = '';
        if (avatarlink)
            avatarlink.style.display = '';
        if (avatarName)
            avatarName.style.display = '';
        if (ChatLink)
            ChatLink.style.display = "";
        if (WaitRoomLink) 
            WaitRoomLink.style.display = "";
        if (homeDiv)
            homeDiv.href = "/Home";
        if (homeLetters)
            homeLetters.dataset.path = "/Home";
    } 
    else if (!isTokenOk) 
    {
        if (loginLink)
            loginLink.parentElement.style.display = '';
        if (registerLink)
            registerLink.parentElement.style.display = '';
        if (profileLink)
            profileLink.parentElement.style.display = 'none';
        if (signoutLink)
            signoutLink.parentElement.style.display = 'none';
        if (ListSearchLink)
            ListSearchLink.style.display = 'none'; 
        if (FriendMenu)
            FriendMenu.style.display = 'none';
        if (TournamentsMenu)
            TournamentsMenu.style.display = 'none';
        if (avatarlink)
            avatarlink.style.display = 'none';
        if (avatarName)
            avatarName.style.display = 'none';
        if (WaitRoomLink)
            WaitRoomLink.style.display = "none";
        if (ChatLink)
            ChatLink.style.display = "none";
        if (homeDiv)
            homeDiv.href = "/";
        if (homeLetters)
            homeLetters.dataset.path = "/";
    }
}

async function getid() 
{
    const token = localStorage.getItem("accessToken");
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try 
    {
        const response = await fetch(`${baseUrl}/user_management/api/auth/test-token/`, 
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
        const user = await response.json();
        return user;
    } 
    catch (error) 
    {
        alert('Error in validation to load main menu');
        return [];
    }  
}

async function getAvatar(id) 
{
    const token = localStorage.getItem("accessToken");
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    try 
    {
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
        alert('Error loading avatar. Please try again');
        return [];
    }
}

