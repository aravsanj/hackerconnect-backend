import { io } from "../index.js";
import User from "../models/User.js";

async function markInactiveUsersOffline() {
  const inactiveThreshold = new Date(Date.now() - 5 * 60 * 1000);
  console.log("called inactive function");

  try {
    const inactiveUsers = await User.find({
      isOnline: true,
      lastActivity: { $lt: inactiveThreshold },
    });
    
    if (inactiveUsers.length > 0) {
      for (const user of inactiveUsers) {
        user.isOnline = false;

        await user.save();
  
        for (const connection of user.connections) {
          io.to(connection.toString()).emit("update-online-status", inactiveUsers);
        }
      }

      console.log(`Marked ${inactiveUsers.length} users as offline.`);
    }
  } catch (error) {
    console.error("Error marking inactive users as offline:", error);
  }
}

export default markInactiveUsersOffline;
