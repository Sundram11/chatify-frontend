import api from "./axiosInstance.js";

export class AuthService {
  async registor(data) {
    try {
      const res = await api.post("/auth/signup", data);
      return res.data;
    } catch (err) {
      console.error(
        "error :: register :: authService",
        err.response?.data || err
      );
      throw err;
    }
  }

  async login(data) {
    try {
      const res = await api.post("/auth/login", data);
      return res.data;
    } catch (error) {
      console.error(
        "error :: login :: authService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async goolgeLogin(data) {
    try {
      const res = await api.post("/auth/google-login", data);
      return res.data;
    } catch (error) {
      console.error(
        "error :: goolgeLogin :: authService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async googleSignup(data) {
    try {
      const res = await api.post("/auth/google-signup", data);
      return res.data;
    } catch (error) {
      console.error(
        "error :: googleSignup :: authService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "error :: logout :: authService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async updateProfile(data) {
    try {
      const res = await api.put("/auth/update-profile", data);
      return res.data;
    } catch (error) {
      console.error(
        "error :: updateProfile :: authService",
        error.response?.data || error
      );
      throw error;
    }
  }

  async searchUsers(query, page = 1, limit = 10) {
    try {
      const res = await api.get("/auth/users/search", {
        params: { q: query, page, limit },
      });
      return res.data;
    } catch (err) {
      console.error(
        "error :: searchUsers :: userService",
        err.response?.data || err
      );
      throw err;
    }
  }
}

const authService = new AuthService();
export default authService;
