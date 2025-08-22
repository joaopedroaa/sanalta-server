import moment from "moment";

export const botName = "Vue Chatapp Admin";
export const allUsers = [];

export function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}


// Join Chat
export function userJoin(user) {
  allUsers.push(user);
  return user;
}


export function getRoomUsers(room) {
    return allUsers.filter(user => user.room === room);
}

export function userLeave(id) {
    const index = allUsers.findIndex(user => user.id === id);

    if(index !== -1){
        return allUsers.splice(index, 1)[0]
    }
}

export function getCurrentUser(id){
    return allUsers.find(user => user.id === id)
}
