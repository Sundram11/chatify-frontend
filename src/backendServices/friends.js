import api from "./axiosInstance.js";

export class FriendService {
  // ✅ Send Friend Request
  async sendFriendRequest(receiverId) {
    try {
      const res = await api.post("/friend/send", { receiverId });
      return res.data;
    } catch (error) {
      console.error(
        "error :: sendFriendRequest :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }

  // ✅ Accept Friend Request
  async acceptFriendRequest(requestId) {
    try {
      const res = await api.post("/friend/accept", { requestId });
      return res.data;
    } catch (error) {
      console.error(
        "error :: acceptFriendRequest :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }

  // ✅ Reject Friend Request
  async rejectFriendRequest(requestId) {
    try {
      const res = await api.post("/friend/reject", { requestId });
      return res.data;
    } catch (error) {
      console.error(
        "error :: rejectFriendRequest :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }

  // ✅ Get Pending Requests
  async getPendingRequest() {
    try {
      const res = await api.get("/friend/pending");
      return res.data;
    } catch (error) {
      console.error(
        "error :: getPendingRequests :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async getSentRequests() {
    try {
      const res = await api.get("/friend/sentRequest");
      return res.data;
    } catch (error) {
      console.error(
        "error :: getSentRequests :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }

   async getAllActiveFriends() {
    try {
      const res = await api.get("/friend/allActiveFriends");
      return res.data;
    } catch (error) {
      console.error(
        "error :: getAllActiveFriends :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }
  // ✅ Unfollow Friend (mark inactive, keep chat data)
  async unfollowFriend(friendId) {
    try {
      const res = await api.post("/friend/unfollow", { friendId });
      return res.data;
    } catch (error) {
      console.error(
        "error :: unfollowFriend :: friendService",
        error.response?.data || error
      );
      throw error;
    }
  }
}

// ✅ Export ready-to-use instance
const friendService = new FriendService();
export default friendService;
