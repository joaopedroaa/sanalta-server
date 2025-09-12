import moment from "moment";

const state = {
  users: {}, // Chave: id do socket, Valor: objeto do usuário
  queue: [], // Chave: id do socket, Valor: objeto do usuário
};

export function addUserToRoom({ id, username, type }) {
  const user = { id, username, type };
  state.users[id] = user;

  state.queue.push({
    userId: id,
    time: moment(),
  });

  console.log("User added to queue:", state);

  return user;
}
