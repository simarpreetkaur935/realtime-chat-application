import Conversation from "../model/conversation.js";
import Message from "../model/message.js";
import { io, getReceiverSocketId } from "../Socket/Socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Find Conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

    // Create Conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create New Message
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      conversationId: conversation._id,
    });

    // Save Message ID in Conversation
    conversation.messages.push(newMessage._id);

    // Save Both
    await Promise.all([
      conversation.save(),
      newMessage.save(),
    ]);
//socket io implementation
    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",newMessage);
      }



    return res.status(201).json({
      success: true,
      newMessage,
    });

  } catch (error) {
    console.error("Send Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
///get messages
export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Find conversation between sender and receiver
    const conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    }).populate("messages");

    // If no conversation exists
   if (!conversation) {
  return res.status(200).json({
    success: true,
    messages: [],
  });
}

    // Return all messages
    return res.status(200).json({
      success: true,
      messages: conversation.messages,
    });

  } catch (error) {
    console.error("Get Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};