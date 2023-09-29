import User from "../models/User.js";

async function updateUserLastActivity(userId: string) {
    try {
      // Find the user by their ID (you can use any criteria to find the user)
      const user = await User.findById(userId);
  
      if (!user) {
        console.log('User not found');
        return;
      }
  
      // Call the updateLastActivity method to update the last activity timestamp
    //   @ts-ignore
      await user.updateLastActivity();
  
      // console.log('User last activity updated successfully');
    } catch (error) {
      console.error('Error updating user last activity:', error);
    }
  }
  
  export default updateUserLastActivity;