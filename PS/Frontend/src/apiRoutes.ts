const Backend = 'https://localhost:7232';

export const apiRoutes = {
    login: {
        url: `${Backend}/gestify/login`,
        method: 'POST',
    },
    signalR: {
        url: `${Backend}/chathub`
    },
    //Clients
    getClients: {
        url: `${Backend}/gestify/getclients`,
        method: 'GET',
    },
    //Chats
    getChats: {
        url: `${Backend}/gestify/getchats`,
        method: 'GET'
    },
    //Telegram
    messageTelegram: {
        url: `${Backend}/gestify/telegram/message`,
        method: 'POST'
    },
    getMessageTelegram: {
        url: `${Backend}/gestify/telegram/getmessage`,
        method: 'GET'
    },
    //Calendar
    newCalendar: {
        url: `${Backend}/gestify/newCalendar`,
        method: 'POST'
    },
    getCalendar: {
        url: `${Backend}/gestify/getCalendar`,
        method: 'GET'
    },
    deleteCalendar: {
        url: `${Backend}/gestify/deleteCalendar/{id}`,
        method: 'DELETE'
    },
    editCalendar: {
        url: `${Backend}/gestify/editCalendar/{id}`,
        method: 'PATCH'
    }
}
