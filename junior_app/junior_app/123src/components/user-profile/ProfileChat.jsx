import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Send from "../../assets/icons/SendBtn.svg";
import Attachment from "../../assets/icons/AttachmentIcon.svg";

const ProfileChat = () => {
  const navigate = useNavigate();
  const chatBodyRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Lorem Ipsum is simply dummy text.",
      timestamp: "2024-11-24 01:09:12",
      sender: "admin",
    },
    {
      id: 2,
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      timestamp: "2024-11-24 01:09:24",
      sender: "user",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        text: newMessage,
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        sender: "user",
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");

    const fileMessage = {
      id: messages.length + 1,
      fileUrl: url,
      fileName: file.name,
      isImage,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      sender: "user",
    };

    setMessages((prev) => [...prev, fileMessage]);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="ticket-chat" ref={chatBodyRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`ticket-message ${
              msg.sender === "user" ? "user-msg" : "admin-msg"
            }`}
          >
            <div className="msg-bubble">
              {msg.text && <p>{msg.text}</p>}

              {msg.isImage && (
                <img
                  src={msg.fileUrl}
                  alt={msg.fileName}
                  className="chat-image"
                />
              )}

              {!msg.isImage && msg.fileUrl && (
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                  {msg.fileName}
                </a>
              )}
            </div>
            <div className="msg-time">{msg.timestamp}</div>
          </div>
        ))}
      </div>

      <div className="ticket-input-box">
        <input
          type="text"
          placeholder="Type here .."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <div className="ticket-input-boxLft">
          <label htmlFor="attachment" className="attachment-icon">
            <img src={Attachment} alt="Attachment" />
          </label>
          <input
            type="file"
            id="attachment"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button className="send-btn" onClick={handleSend}>
            <img src={Send} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileChat;
