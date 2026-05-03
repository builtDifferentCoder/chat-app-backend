import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (chat) {
      return res.status(200).json(chat);
    }

    chat = await Chat.create({
      chatName: "private chat",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(chat._id).populate(
      "users",
      "-password",
    );

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: "Failed to access chat" });
  }
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $in: [req.user._id] },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { chatName, users } = req.body;

    if (!chatName || !users || users.length < 2) {
      return res.status(400).json({
        message: "Group needs name and at least 2 users",
      });
    }

    const groupUsers = [...users, req.user._id];

    const group = await Chat.create({
      chatName,
      users: groupUsers,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroup = await Chat.findById(group._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroup);
  } catch (error) {
    res.status(500).json({ message: "Failed to create group" });
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to rename group" });
  }
};

export const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to add user" });
  }
};

export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove user" });
  }
};
