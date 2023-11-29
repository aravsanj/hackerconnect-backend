import User from "../models/User.js";

async function updateUserLastActivity(userId: string) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found");
      return;
    }

    //   @ts-ignore
    await user.updateLastActivity();
  } catch (error) {
    console.error("Error updating user last activity:", error);
  }
}

export default updateUserLastActivity;
