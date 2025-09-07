
import moment from "moment";

export const botName = "chatAdmin";

const chatState = {
  users: {}, // Chave: id do socket, Valor: objeto do usuário
  groups: {}  // Chave: nome da sala, Valor: { messages: [], users: [] }
};

export function formatMessage(username, text, type = "message") {
    return {
        username,
        text,
        type,
        time: moment().format('h:mm a')
    }
}

// Função para salvar uma mensagem em uma sala específica, precisa do grupo que deseja salvar a mensagem
export function saveMessage(message) {

    const { group } = message;
    if (!chatState.groups[group]) {
        chatState.groups[group] = { messages: [] };
    }

    chatState.groups[group].messages.push(message);

    console.log(message);
    console.log(chatState.groups[group]);

    return message;
}

// Função para obter as mensagens de uma sala
export function getGroupMessages(group) {
    return chatState.groups[group]?.messages || [];
}

// Função para obter a lista de usuários de uma sala
export function getGroupUsers(group) {
    return Object.values(chatState.users).filter(user => user.group=== group);
}



export function userJoinGroup({ username, group, id, type }) {
  const user = { id, username, group, type };
  chatState.users[id] = user;

  // Garante que a sala existe no estado
  if (!chatState.groups[group]) {
      chatState.groups[group] = { messages: [] };
  }

  return user;
}


// Função para obter um usuário pelo ID
export function getCurrentUser(id){
    return chatState.users[id];
}

// Função para remover um usuário
export function userLeave(id) {
    const user = chatState.users[id];
    if(user){
        delete chatState.users[id]; // Remove a propriedade do objeto
    }
    return user;
}
