export function initMatchHistory1v1Public() 
{
    const matchList = document.getElementById('matchList');
    const oneVsonePlayed = document.getElementById('public-1v1-total');
    const oneVsoneWin = document.getElementById('public-1v1-wins');
    const oneVsoneLosses = document.getElementById('public-1v1-losses');
    const oneVsoneWinRate = document.getElementById('public-1v1-winrate');
    const userName = localStorage.getItem('profile-friend-username');
    document.getElementById('stats-1v1-name').innerHTML = userName;
    document.getElementById('history-1v1-name').innerHTML = userName;
    fetchStats().then(displayStats);
    fetchMatches().then(displayMatches);

    async function fetchStats() 
    {
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem('profile-friend-id');
        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:49998/match_history/api/matches2/stats_view/${userId}/`, {
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
        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:49998/match_history/api/matches/${userId}/`, {
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
        matchList.innerHTML = '';
        matches.forEach(match => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            const Date = formatDate(match.date);
            listItem.innerHTML = `
                <div>
                    <strong>Match ${match.id}</strong><br>
                    <small>Tournament: ${match.match_type_display}</small><br>
                    <small>${match.player1_display_name} ( ${match.player1_score}  ) -- ( ${match.player2_score}  ) ${match.player2_display_name}:  </small><br>
                    <small>Date: ${Date}</small>
                </div>
                <div>
                    <img src="${window.location.protocol}//${window.location.hostname}:49998/user_management/api/users/avatar/${match.winner_id}/" height=80 width=80 class="rounded-circle" style="border: 2px solid black;">
                    
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
