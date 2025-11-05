import api from "./axiosInstance.js";

export class MessageService {
  async getRecentChats() {
    try {
      const res = await api.get("/message/recent-chats");
      return res.data;
    } catch (error) {
      console.error(
        "error :: getRecentChats :: messageService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async getMessages(chatId, page = 1, limit = 15) {
    try {
      const res = await api.get(`/message/${chatId}/messages`, {
        params: { page, limit }, // ✅ send pagination query
      });
      return res.data; // contains messages + pagination
    } catch (error) {
      console.error(
        "❌ error :: getMessages :: messageService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async sendMessage(formData) {
    try {
      const res = await api.post("/message/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error(
        "error :: sendMessage :: messageService",
        error.response?.data || error
      );
      throw error;
    }
  }
  async readMessages(data) {
    try {
      const res = await api.put("/message/read", data);
      return res.data;
    } catch (error) {
      console.error(
        "error :: readMessages :: messageService",
        error.response?.data || error
      );
      throw error;
    }
  }

 async editMessage(messageId, newText) {
  try {
    const res = await api.put(`/message/edit/${messageId}`, { text: newText });
    return res.data;
  } catch (error) {
    console.error("error :: editMessage :: messageService", error.response?.data || error);
    throw error;
  }
}


  async deleteChat(chatId) {
    try {
      const res = await api.delete(`/message/${chatId}/delete`);
      return res.data;
    } catch (error) {
      console.error(
        "error :: deleteChat :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async getUnreadCounts() {
    try {
      const res = await api.get("/message/unreadCounts");
      return res.data;
    } catch (error) {
      console.error(
        "error :: getUnreadCounts :: messageService",
        error.response?.data || error
      );
      throw error;
    }
  }

  /**
   * ✅ Delete a message by ID.
   * @param {string} messageId
   */
  async deleteMessage(messageId) {
    try {
      const res = await api.delete(`/message/delete/${messageId}`);
      return res.data;
    } catch (error) {
      console.error(
        "error :: deleteMessage :: messageService",
        error.response?.data || error
      );
      throw error;
    }
  }
}

// ✅ Export a single instance for app-wide use
const messageService = new MessageService();
export default messageService;
