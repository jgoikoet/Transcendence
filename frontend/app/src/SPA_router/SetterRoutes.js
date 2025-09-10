import { initScriptChat } from '../User_Management/Chat.js'
import { initBlockRequest } from '../User_Management/ExecuteBlockFriend.js'
import { initDeleteFriendScript } from '../User_Management/ExecuteDeleteFriend.js'
import { initScriptFriendRequest } from '../User_Management/ExecuteFriendRequest.js'
import { initUnblockedFriendScript } from '../User_Management/ExecuteUnblockedFriend.js'
import { initFriends } from '../User_Management/Friends.js'
import { initFriendsBlocked } from '../User_Management/FriendsBlocked.js'
import { initFriendsRequest } from '../User_Management/FriendsRequest.js'
import { initFriendsWait } from '../User_Management/FriendsWait.js'
import { initMatchHistory1v1_interface_public } from '../Match_history_tournament/MatchHistory1v1_interface_public.js'
import { initMatchHistory1v1_cobete } from '../Match_history_tournament/MatchHistory1v1_cobete.js'
import { initMatchHistory1v1_cobete_public } from '../Match_history_tournament/MatchHistory1v1_cobete_public.js'
import { initMatchHistory1v1 } from '../Match_history_tournament/MatchHistory1v1.js'
import { initMatchHistory1v1Public } from '../Match_history_tournament/MatchHistory1v1Public.js'
import { initMatchHistoryTournament } from '../Match_history_tournament/MatchHistoryTournament.js'
import { initMatchHistoryTournamentPublic } from '../Match_history_tournament/MatchHistoryTournamentPublic.js'
import { initializeGame, disposePongMulti } from "../PongGame/LocalMultiplayer.js"
import { initializeGameIA, disposeIAGame } from "../PongGame/SinglePlayerIA.js"
import { initializeCobeteGame, disposeCobeteGame } from "../localCobeteGame/cobeteGame.js"
import { initializeCobeteGameOnline, disposeCobeteGameOnline } from "../cobeteOnline/cobeteGameOnline.js"                                                         
import { initPublicProfile } from '../User_Management/PublicProfile.js'
import { initRegister } from '../User_Management/Register.js'
import { initListSearch } from '../User_Management/SearchUser.js'
import { initSignIn } from '../User_Management/SignIn.js'
import { initProfile } from '../User_Management/PrivateProfile.js'
import { onlineInitializeGameFriends, onlineInitializeGameIndividual, onlineInitializeGameSemifinal, disposePongOnline } from '../PongGame/game4.js';

import { doSignOut } from '../User_Management/SignOut.js'

const DEFAULT_PAGE_TITLE = "JS SPA Router";
export const ROUTES = {
    404: {
        template: "../../templates/Error_Pages/404.html",
        title: "404 | " + DEFAULT_PAGE_TITLE,
        description: "Page not found",
    },
    "/Chat": {
        template: "../../templates/User_Management/Chat.html",
        title: "Chat | " + DEFAULT_PAGE_TITLE,
        description: "This is the Chat page for the Pong Game",
		init: initScriptChat
    },
    "/cobeteGame": {
		template: "../../templates/Cobete_Game/cobeteGame.html",
		title: "Cobete Game | " + DEFAULT_PAGE_TITLE,
		description: "This is the Amazing Cobete Game",
		init: initializeCobeteGame,
        dispose: disposeCobeteGame         
	},
    "/CobeteHome": {
        template: "../../templates/Home/CobeteHome.html",
        title: "Cobete Home | " + DEFAULT_PAGE_TITLE,
        description: "This is the Cobete Home page",
    },    
    "/cobeteOnline": {
		template: "../../templates/Cobete_Game/cobeteGame.html",
		title: "Cobete Game Online | " + DEFAULT_PAGE_TITLE,
		description: "This is the Amazing Cobete Game Online",
		init: initializeCobeteGameOnline,
		dispose: disposeCobeteGameOnline    
	},    
    "/ExecuteBlockFriend": {
        template: "../../templates/User_Management/ExecuteBlockFriend.html",
        title: "Execute Block Friend | " + DEFAULT_PAGE_TITLE,
        description: "This is the Execute Block Friend page ",
		init: initBlockRequest
    },
    "/ExecuteDeleteFriend": {
        template: "../../templates/User_Management/ExecuteDeleteFriend.html",
        title: "Execute Delete Friend | " + DEFAULT_PAGE_TITLE,
        description: "This is the Execute Delete Friend page for the Pong Game",
		init: initDeleteFriendScript
    },
    "/ExecuteFriendRequest": {
        template: "../../templates/User_Management/ExecuteFriendRequest.html",
        title: "Execute Friend Request | " + DEFAULT_PAGE_TITLE,
        description: "This is the Execute Friend Request page for the Pong Game",
		init: initScriptFriendRequest
    },
    "/ExecuteUnblockedFriend": {
        template: "../../templates/User_Management/ExecuteUnblockedFriend.html",
        title: "Execute Unblocked Friend | " + DEFAULT_PAGE_TITLE,
        description: "This is the Execute Unblocked Friend page ",
		init: initUnblockedFriendScript
    },
    "/Friends": {
        template: "../../templates/User_Management/Friends.html",
        title: "Friends | " + DEFAULT_PAGE_TITLE,
        description: "This is the Friends page for the Pong Game",
		init: initFriends
    },
    "/FriendsBlocked": {
        template: "../../templates/User_Management/FriendsBlocked.html",
        title: "Blocked Friends | " + DEFAULT_PAGE_TITLE,
        description: "This is the Blocked Friends page for the Pong Game",
		init: initFriendsBlocked
    },    
    "/FriendsRequest": {
        template: "../../templates/User_Management/FriendsRequest.html",
        title: "Friend Requests | " + DEFAULT_PAGE_TITLE,
        description: "This is the Friend Requests page for the Pong Game",
		init: initFriendsRequest
    },    
    "/FriendsWait": {
        template: "../../templates/User_Management/FriendsWait.html",
        title: "Waiting Friends | " + DEFAULT_PAGE_TITLE,
        description: "This is the Waiting Friends page for the Pong Game",
		init: initFriendsWait
    },    
    "/Home": {
        template: "../../templates/Home/Home.html",
        title: "Home | " + DEFAULT_PAGE_TITLE,
        description: "This is the Home page",
    },
    "/SinglePlayerIA": {
        template: "../../templates/Pong_Game/LocalGame.html",
        title: "Single Player Game | " + DEFAULT_PAGE_TITLE,
        description: "This is the Single Player Game page for the Pong Game",
		init: initializeGameIA,
        dispose: disposeIAGame   
    },
    "/LocalMultiplayer": {
        template: "../../templates/Pong_Game/LocalGame.html",
        title: "Local Multiplayer Game | " + DEFAULT_PAGE_TITLE,
        description: "This is the Local Multiplayer Game page for the Pong Game",
		init: initializeGame,
        dispose: disposePongMulti  
    },
    "/Login": {
        template: "../../templates/User_Management/Login.html",
        title: "Sign In | " + DEFAULT_PAGE_TITLE,
        description: "This is the Sign In page",
		init: initSignIn
    },
    "/MatchHistory1v1": {
        template: "../../templates/Pong_Game/MatchHistory1v1.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the 1v1 Match History page for the Pong Game",
		init: initMatchHistory1v1
    },
    "/MatchHistory1v1_cobete": {
        template: "../../templates/Cobete_Game/MatchHistory1v1_cobete.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the 1v1 History page for the Cobete Game",
		init: initMatchHistory1v1_cobete
    },
    "/MatchHistory1v1_cobete_public": {
        template: "../../templates/Cobete_Game/MatchHistory1v1_cobete_public.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the 1v1 public History page for the Cobete Game",
		init: initMatchHistory1v1_cobete_public
    },
    "/MatchHistory1v1_interface": {
        template: "../../templates/Pong_Game/MatchHistory1v1_interface.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the 1v1 History Choose page",
    },
    "/MatchHistory1v1_interface_public": {
        template: "../../templates/Pong_Game/MatchHistory1v1_interface_public.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the 1v1 pUBLIC History Choose page",
		init: initMatchHistory1v1_interface_public
    },
    "/MatchHistory1v1Public": {
        template: "../../templates/Pong_Game/MatchHistory1v1Public.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the Public 1v1 History page for the Pong Game",
		init: initMatchHistory1v1Public
    },
    "/MatchHistoryTournament": {
        template: "../../templates/Pong_Game/MatchHistoryTournament.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the Match History page for the Pong Game",
		init: initMatchHistoryTournament
    },
    "/MatchHistoryTournamentPublic": {
        template: "../../templates/Pong_Game/MatchHistoryTournamentPublic.html",
        title: "Match History | " + DEFAULT_PAGE_TITLE,
        description: "This is the Public Tournament History page for the Pong Game",
		init: initMatchHistoryTournamentPublic
    },
    "/": {
        template: "../../templates/Home/NoLogHome.html",
        title: "Home | " + DEFAULT_PAGE_TITLE,
        description: "This is the home page",
    },
    "/PrivateProfile": {
        template: "../../templates/User_Management/PrivateProfile.html",
        title: "PrivateProfile | " + DEFAULT_PAGE_TITLE,
        description: "This is the PrivateProfile page",
		init: initProfile
    },
    "/OnlineFriends": {
        template: "../../templates/Pong_Game/Game4.html",
        title: "1 Vs 1 | " + DEFAULT_PAGE_TITLE,
        description: "This is the 1 Vs 1",
		init: onlineInitializeGameFriends,
        dispose: disposePongOnline
    },
    "/OnlineMultiplayer": {
        template: "../../templates/Pong_Game/Game4.html",
        title: "1 Vs 1 | " + DEFAULT_PAGE_TITLE,
        description: "This is the 1 Vs 1",
		init: onlineInitializeGameIndividual,
        dispose: disposePongOnline
    },
    "/OnlineMultiplayer4": {
        template: "../../templates/Pong_Game/Game4.html",
        title: "OnlineMultiplayer 4 players | " + DEFAULT_PAGE_TITLE,
        description: "This is the OnlineMultiplayer 4 page",
		init: onlineInitializeGameSemifinal,
        dispose: disposePongOnline
    },
    "/PongHome": {
        template: "../../templates/Home/PongHome.html",
        title: "PongHome | " + DEFAULT_PAGE_TITLE,
        description: "This is the PongHome page",
    },    
    "/PublicProfile": {
        template: "../../templates/User_Management/PublicProfile.html",
        title: "PublicProfile | " + DEFAULT_PAGE_TITLE,
        description: "This is the PublicProfile page",
		init: initPublicProfile
    },
    "/Register": {
        template: "../../templates/User_Management/Register.html",
        title: "Sign Up | " + DEFAULT_PAGE_TITLE,
        description: "This is the Sign Up page",
		init: initRegister
    },
    "/SignOut": {
        template: "../../templates/User_Management/SignOut.html",
        title: "Sign Out | " + DEFAULT_PAGE_TITLE,
        description: "This is the Sign Out page",
		init: doSignOut
    },
    "/SearchUser": {
        template: "../../templates/User_Management/SearchUser.html",
        title: "SearchUser | " + DEFAULT_PAGE_TITLE,
        description: "This is the SearchUser page for the Pong Game",
		init: initListSearch
    },
    "/TournamentInterface": {
        template: "../../templates/Pong_Game/TournamentInterface.html",
        title: "Tournaments | " + DEFAULT_PAGE_TITLE,
        description: "This is the Tournaments page for the Pong Game",
    },
};
