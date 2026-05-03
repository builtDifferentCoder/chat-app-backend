import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Content and chatId required" });
    }

    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    message = await message.populate("sender", "name email avatar");
    message = await message.populate("chat");
    message = await message.populate("chat.users", "name email avatar");

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name email avatar")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
