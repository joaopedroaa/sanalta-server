
import moment from "moment";

export const botName = "chatAdmin";

// NOVO: Objeto único para armazenar o estado do chat
const chatState = {
  users: {}, // Chave: id do socket, Valor: objeto do usuário
  groups: {}  // Chave: nome da sala, Valor: { messages: [], users: [] }
};

export function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

// MODIFICADO: Função para salvar uma mensagem em uma sala específica
export function saveMessage(message) {
    const { group } = message;
    if (!chatState.groups[group]) {
        chatState.groups[group] = { messages: [] };
    }
    chatState.groups[group].messages.push(message);
    return message;
}

// MODIFICADO: Função para obter as mensagens de uma sala
export function getGroupMessages(group) {
    return chatState.groups[group]?.messages || [];
}


// * Grupo
export function userJoinGroup({ username, group, id, type }) {
  const user = { id, username, group, type };
  chatState.users[id] = user;

  // Garante que a sala existe no estado
  if (!chatState.groups[group]) {
      chatState.groups[group] = { messages: [] };
  }

  return user;
}

// MODIFICADO: Função para obter a lista de usuários de uma sala
export function getGroupUsers(group) {
    // Itera sobre os valores do objeto de usuários e filtra pela sala
    return Object.values(chatState.users).filter(user => user.group=== group);
}

// MODIFICADO: Função para obter um usuário pelo ID
export function getCurrentUser(id){
    return chatState.users[id];
}

// MODIFICADO: Função para remover um usuário
export function userLeave(id) {
    const user = chatState.users[id];
    if(user){
        delete chatState.users[id]; // Remove a propriedade do objeto
    }
    return user;
}
