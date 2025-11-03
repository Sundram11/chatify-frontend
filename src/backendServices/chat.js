import api from "./axiosInstance.js";

export class ChatService {
  async findOneToOneChat(friendId) {
  try {
    const res = await api.get(`/chat/one-to-one/${friendId}`);
    return res.data.data; // ✅ only return actual chat object
  } catch (error) {
    console.error(
      "error :: findOneToOneChat :: ChatService",
      error.response?.data || error
    );
    throw error;
  }
}

async createOrGetOneToOneChat(participantId) {
  try {
    const res = await api.post("/chat/one-to-one", { participantId });
    return res.data.data; // ✅ only return actual chat object
  } catch (error) {
    console.error(
      "error :: createOrGetOneToOneChat :: ChatService",
      error.response?.data || error
    );
    throw error;
  }
}


  async createGroupChat({ name, participantIds }) {
    try {
      const res = await api.post("/chat/group", { name, participantIds });
      return res.data; // ApiResponse { data: chat }
    } catch (error) {
      console.error(
        "error :: createGroupChat :: ChatService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async findGroupChat(groupId) {
    try {
      const res = await api.get(`/chat/group/${groupId}`);
      return res.data; // ApiResponse { data: { _id: chatId } }
    } catch (error) {
      console.error(
        "error :: findGroupChat :: ChatService",
        error.response?.data || error
      );
      throw error;
    }
  }
}

const chatService = new ChatService();
export default chatService;
