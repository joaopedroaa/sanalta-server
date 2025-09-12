import moment from "moment";

export const systemBotName = "chatSystem";

const state = {
  users: {}, // Chave: id do socket, Valor: objeto do usuário
  groups: {}, // Chave: nome da sala, Valor: { messages: [], users: [] }
};

export function createMessage(text, username = systemBotName, type = "message") {
  return {
    text,
    username,
    type,
    time: moment().format("h:mm a"),
  };
}

// Função para salvar uma mensagem em uma sala específica, precisa do grupo que deseja salvar a mensagem
export function addMessageToGroup(message, group) {
  if (!state.groups[group]) {
    state.groups[group] = { messages: [] };
  }

  state.groups[group].messages.push(message);

  console.log(message);
  console.log(group);
  console.log(state.groups[group]);
  return message;
}

// Função para obter as mensagens de uma sala
export function getMessagesFromGroup(group) {
  return state.groups[group]?.messages || [];
}

// Função para obter a lista de usuários de uma sala
export function getUsersInGroup(group) {
  return Object.values(state.users).filter((user) => user.group === group);
}



// Função para obter um usuário pelo ID
export function getUserById(id) {
  return state.users[id];
}


export function addUser({ id, username, group, type }) {
  const user = { id, username, group, type };
  state.users[id] = user;

  // Garante que a sala existe no estado
  if (!state.groups[group]) {
    state.groups[group] = { messages: [] };
  }

  return user;
}

// Função para remover um usuário
export function removeUser(id) {
  const user = state.users[id];
  if (user) {
    delete state.users[id]; // Remove a propriedade do objeto
  }
  return user;
}
