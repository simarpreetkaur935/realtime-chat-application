import User from "../model/user.js";
import Conversation from "../model/conversation.js";
import Message from "../model/message.js";

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

// Get Current Chatters
export const getCurrentChatters = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get conversations newest first so the chat list is ordered by activity.
    const currentChatters = await Conversation.find({
      participants: currentUserId,
    }).sort({
      updatedAt: -1,
    }).lean();

    // If no conversations exist
    if (!currentChatters || currentChatters.length === 0) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const participantIds = currentChatters.map((conversation) =>
      conversation.participants.find((id) => id.toString() !== currentUserId.toString())
    ).filter(Boolean);
    const conversationIds = currentChatters.map(({ _id }) => _id);
    const [users, messages, unreadCounts] = await Promise.all([
      User.find({ _id: { $in: participantIds } }).select("-password").lean(),
      Message.find({ conversationId: { $in: conversationIds } })
        .sort({ createdAt: -1 })
        .lean(),
      Message.aggregate([
        {
          $match: {
            conversationId: { $in: conversationIds },
            receiverId: currentUserId,
            readAt: { $exists: true, $eq: null },
          },
        },
        { $group: { _id: "$conversationId", count: { $sum: 1 } } },
      ]),
    ]);

    const usersById = new Map(users.map((user) => [user._id.toString(), user]));
    const latestMessageByConversation = new Map();
    for (const message of messages) {
      const conversationId = message.conversationId.toString();
      if (!latestMessageByConversation.has(conversationId)) {
        latestMessageByConversation.set(conversationId, message);
      }
    }
    const unreadCountByConversation = new Map(
      unreadCounts.map(({ _id, count }) => [_id.toString(), count])
    );

    const chatUsers = currentChatters.flatMap((conversation, index) => {
      const participantId = participantIds[index];
      const user = usersById.get(participantId.toString());
      if (!user) return [];
      const lastMessage = latestMessageByConversation.get(conversation._id.toString());
      return [{
        ...user,
        lastMessage: lastMessage?.message || "",
        lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
        unreadCount: unreadCountByConversation.get(conversation._id.toString()) || 0,
      }];
    });

    return res.status(200).json({
      success: true,
      users: chatUsers,
    });
  } catch (error) {
    console.error("Get Current Chatters Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
