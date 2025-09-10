export function initMatchHistory1v1_interface_public()
{
    const friendName = document.getElementById('friend-name-history-interface');
    const friendNameValue = localStorage.getItem('profile-friend-username');
    friendName.innerHTML = friendNameValue;
}