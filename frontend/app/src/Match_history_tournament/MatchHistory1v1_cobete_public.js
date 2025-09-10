export function initMatchHistory1v1_cobete_public()
{
    const matchList = document.getElementById('matchList-cobete-public');
    const oneVsonePlayed = document.getElementById('1v1-total-cobete-public');
    const oneVsoneWin = document.getElementById('1v1-wins-cobete-public');
    const oneVsoneLosses = document.getElementById('1v1-losses-cobete-public');
    const oneVsoneWinRate = document.getElementById('1v1-winrate-cobete-public');
    const userName = localStorage.getItem('profile-friend-username');
    document.getElementById('friendName-cobete-game-public').innerHTML = userName;
    document.getElementById('friendName-cobete-game-public-history').innerHTML = userName;
    fetchStats().then(displayStats);
    fetchMatches().then(displayMatches);

    async function fetchStats() 
    {   
        const token = localStorage.getItem("accessToken");
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const userId = localStorage.getItem('profile-friend-id');
        try {
            const response = await fetch(`${baseUrl}/multiplayer_cobete/game/matches/stats_view/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching matches:', error);
            return [];
        }
    }

    function displayStats(stats) 
    {
        oneVsonePlayed.innerHTML = stats.individual_matches.played;
        oneVsoneWin.innerHTML = stats.individual_matches.won;
        oneVsoneLosses.innerHTML = stats.individual_matches.played - stats.individual_matches.won;
        if (stats.individual_matches.played > 0) {
            const winRate = (stats.individual_matches.won / stats.individual_matches.played) * 100;
            oneVsoneWinRate.innerHTML = winRate.toFixed(2) + "%";
        } else {
            oneVsoneWinRate.innerHTML = "0%";
        }
    }

    async function fetchMatches() 
    {
        const userId = localStorage.getItem('profile-friend-id');
        const token = localStorage.getItem("accessToken");
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;

        try {
            const response = await fetch(`${baseUrl}/multiplayer_cobete/game/matches/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching matches:', error);
            return [];
        }
    }

    function displayMatches(matches) 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        matchList.innerHTML = '';
        matches.forEach(match => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            const Date = formatDate(match.date);
            listItem.innerHTML = `
                <div>
                    <strong>Match ${match.id}</strong><br>
                    <small>${match.player1_display_name} ( ${match.player1_score}  ) -- ( ${match.player2_score}  ) ${match.player2_display_name}:  </small><br>
                    <small>Date: ${Date}</small>
                </div>
                <div>
                    <img src="${baseUrl}/user_management/api/users/avatar/${match.winner_id}/" height=80 width=80 class="rounded-circle" style="border: 2px solid black;">
                    
                </div>
            `;
            
            matchList.appendChild(listItem);
        });
    }
}

function formatDate(dateCreated)
{
    const date = new Date(dateCreated);
    const formattedDate = date.toLocaleString();
    return formattedDate;
}
