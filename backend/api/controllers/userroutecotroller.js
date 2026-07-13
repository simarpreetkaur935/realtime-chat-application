import User from "../model/user.js";
import Conversation from "../model/conversation.js";

export const getUserBySearch = async (req, res) => {
  try {
    const search = req.query.search || "";
    const currentUserId = req.user._id;

    const users = await User.find({
      $and: [
        {
          $or: [
            {
              username: {
                $regex: search,
                $options: "i",
              },
            },
            {
              fullname: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
        {
          _id: {
            $ne: currentUserId,
          },
        },
      ],
    }).select("-password");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
//sorting
export const getCurrentChatters = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all conversations of the logged-in user
    const currentChatters = await Conversation.find({
      participants: currentUserId,
    }).sort({
      updatedAt: -1,
    });

    // If no conversations exist
    if (!currentChatters || currentChatters.length === 0) {
      return res.status(200).json([]);
    }

    // Get all participant IDs except the logged-in user
    const participantsIDs = currentChatters.reduce(
      (ids, conversation) => {
        const otherParticipants = conversation.participants.filter(
          (id) => id.toString() !== currentUserId.toString()
        );

        return [...ids, ...otherParticipants];
      },
      []
    );

    // Remove duplicate IDs
    const uniqueParticipantIDs = [...new Set(participantsIDs.map(id => id.toString()))];

    // Fetch users
    const users = await User.find({
      _id: { $in: uniqueParticipantIDs },
    }).select("-password");

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("Get Current Chatters Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};