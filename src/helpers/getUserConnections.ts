import User from "../models/User.js";

async function getUserConnectionIds(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const connectionIds = user.connections.map(connection => connection.toString());
      
      return connectionIds;
    } catch (error) {
      console.error('Error fetching user connection IDs:', error);
      throw error;
    }
  }

export default getUserConnectionIds