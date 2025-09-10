async function Call_to_Back_messages_historic(user_id, recipient) {
    if (!user_id || !recipient) 
        return;
    try {
        const token = localStorage.getItem("accessToken");
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/chat/chat/messages/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user1: user_id, user2: recipient })
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const messages = await response.json();
        messages.sort((a, b) => a.id - b.id).forEach(msg => {
            if (msg.user_sender === user_id) {
                displayHistorySentMessage(msg); 
            } else {
                displayHistoryReceivedMessage(msg);
            }
        });
    } catch (error) {
        alert('Error fetching message history. Please try again');
    }
}

function displayHistorySentMessage(msg)
{
    const chatTable = document.getElementById('chat');
    if (msg.message_type === 1)
        chatTable.innerHTML += `<div class="sended-message"><div>${msg.message} sent</div>`;
    else
        chatTable.innerHTML += `<div class="sended-message">${msg.message}</div>`;
    scrollToBottom();
}

function displayHistoryReceivedMessage(msg)
{
    if (msg.message_type === 1)
    {
        displayMatchRequestOptions(msg.message);
        return;
    }
    const chatTable = document.getElementById('chat');
    chatTable.innerHTML += `<div class="received-message">${msg.message}</div>`;
    scrollToBottom();
}

export async function initScriptChat() 
{
    const recipient = Number(localStorage.getItem('ChatFriendId'));
    const recipientName = localStorage.getItem('ChatFriendName');
    const user_id = Number(localStorage.getItem('id-online'));
    document.getElementById('user-chat-recipient').innerHTML = recipientName;
    if (!window.chatSocket || window.chatSocket.readyState !== WebSocket.OPEN) 
        window.chatSocket = connectWebSocket(user_id);
    Call_to_Back_messages_historic(user_id, recipient);

    document.getElementById("send_message").onclick = () => 
        handleSendMessage(window.chatSocket, recipient);

    document.getElementById('message').addEventListener('keydown', (event) => 
    {
        if (event.key === 'Enter') 
        {
            handleSendMessage(window.chatSocket, recipient);
            event.preventDefault();
        }
    });
}

export function connectWebSocket(user_id) 
{
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${wsProtocol}//${window.location.hostname}:49998/chat/ws/chat/`);

    socket.onopen = () => handleConnect(socket, user_id);
    socket.onmessage = handleMessage;
    socket.onclose = handleClose;
    socket.onerror = (error) => {};
    return socket;
}

function handleConnect(socket, user_id) 
{
    if (socket.readyState === WebSocket.OPEN) 
        socket.send(JSON.stringify({ 
            type: "connect", user_id,
            token: localStorage.getItem('accessToken')
	}));
}

function handleSendMessage(socket, recipient) 
{
    const message = document.getElementById('message').value;
    if (socket.readyState === WebSocket.OPEN && message.trim() !== '') 
    {
        socket.send(JSON.stringify({ type: "send_message", message, recipient }));
        displaySentMessage(message);
        document.getElementById('message').value = '';
    }
}

export function handleSendMatchRequest(socket, recipient) 
{
    const message = "Match request";
    if (socket.readyState === WebSocket.OPEN && message.trim() !== '') 
    {
        socket.send(JSON.stringify({ type: "match_message", message, recipient }));
    }
}

function handleAcceptMatchRequest(socket, recipient) 
{
    const message = "Match accepted";
    if (socket.readyState === WebSocket.OPEN && message.trim() !== '') 
    {
        socket.send(JSON.stringify({ type: "accept_match", message, recipient }));
    }
}

function acceptMatch()
{
    const recipient = Number(localStorage.getItem('ChatFriendId'));
    const user_id = Number(localStorage.getItem('id-online'));
    var tournamentId = String(recipient) + "_" + String(user_id);
    handleAcceptMatchRequest(window.chatSocket, recipient);
    localStorage.setItem('tournament_id', tournamentId);
    window.history.pushState({}, "", "OnlineFriends");
    window.dispatchEvent(new PopStateEvent('popstate'));
}

function cancelMatch()
{
    const recipient = Number(localStorage.getItem('ChatFriendId'));
    const message = "Match canceled";
    if (window.chatSocket.readyState === WebSocket.OPEN && message.trim() !== '') 
        window.chatSocket.send(JSON.stringify({ type: "cancel_match", message, recipient }));
    window.history.pushState({}, "", "Chat");
    window.dispatchEvent(new PopStateEvent('popstate'));
}

function handleReadMesssage(eventData)
{
    const recipient = Number(localStorage.getItem('ChatFriendId'));
    const message = "Message read";
    if (window.chatSocket.readyState === WebSocket.OPEN && message.trim() !== '') 
        window.chatSocket.send(JSON.stringify({ type: "read_message", message, recipient, message_id: eventData.message_id }));
}

export function rejectMatch(recipient)
{
    const message = "Match rejected";
    if (window.chatSocket.readyState === WebSocket.OPEN && message.trim() !== '') 
        window.chatSocket.send(JSON.stringify({ type: "reject_match", message, recipient }));
    window.history.pushState({}, "", "Friends");
    window.dispatchEvent(new PopStateEvent('popstate'));
}

function displayMatchRequestOptions(message)
{
    const chatTable = document.getElementById('chat');
    if (chatTable != null)
    {
        chatTable.innerHTML += `
            <div class="received-match-request">
                ${message}
                <button id="acceptButton" class="btn btn-success">Accept</button>
                <button id="cancelButton" class="btn btn-danger">Cancel</button>
            </div>
        `;
        document.getElementById("acceptButton").addEventListener("click", acceptMatch);
        document.getElementById("cancelButton").addEventListener("click", cancelMatch);
        scrollToBottom();
    }
}

function handleMessage(event) 
{
    const eventData = JSON.parse(event.data);
    if (eventData.type === "incoming_message") 
    {
        const sender_id = Number(localStorage.getItem('ChatFriendId'));
        if (window.location.pathname != '/Friends' && window.location.pathname != '/Chat')
        {
            const chatIcon = document.getElementById('Chat');
            chatIcon.style.color = 'red';
        }
        else if (window.location.pathname === '/Friends')
        {
            window.history.pushState({}, "", "Friends");
            window.dispatchEvent(new PopStateEvent('popstate')); 
        }
        else if (window.location.pathname === '/Chat')
        {
            if (eventData.sender_id === sender_id)
                handleReadMesssage(eventData);
        }
        if (eventData.sender_id === sender_id)
            displayReceivedMessage(eventData.message);
    }
    else if (eventData.type === "match_request")
    {
        const sender_id = Number(localStorage.getItem('ChatFriendId'));
        if (window.location.pathname != '/Friends' && window.location.pathname != '/Chat')
        {
            const chatIcon = document.getElementById('Chat');
            chatIcon.style.color = 'red';
        }
        else if ((window.location.pathname === '/Friends'))
        {
            window.history.pushState({}, "", "Friends");
            window.dispatchEvent(new PopStateEvent('popstate')); 
        }
        else if (window.location.pathname === '/Chat')
            {
                if (eventData.sender_id === sender_id)
                    handleReadMesssage(eventData);
            }
        if (eventData.sender_id === sender_id)
            displayMatchRequestOptions(eventData.message);
    }
    else if (eventData.type === "reject_match")
    {
        if (window.location.pathname === '/Chat')
        {
            window.history.pushState({}, "", "Chat");
            window.dispatchEvent(new PopStateEvent('popstate')); 
            scrollToBottom();
        }
    }
    else if (eventData.type === "cancel_match")
    {
        window.history.pushState({}, "", "Friends");
        window.dispatchEvent(new PopStateEvent('popstate')); 
    }
    else if (eventData.status === 500)
       alert(eventData.message);
}

function handleClose(event) 
{
    if (!event.wasClean) 
        alert("You have been disconnected from the chat. Please try to connect again");

}

function displayReceivedMessage(message) 
{
    const chatTable = document.getElementById('chat');
    if (chatTable != null)
    {
        chatTable.innerHTML += `<div class="received-message">${message}</div>`;
        scrollToBottom();
    }
}

function displaySentMessage(message) 
{
    const chatTable = document.getElementById('chat');
    if (chatTable != null)
    {
        chatTable.innerHTML += `<div class="sended-message">${message}</div>`;
        scrollToBottom();
    }
}

function scrollToBottom() 
{
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight; 
}
