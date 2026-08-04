import React, { useEffect, useRef, useState } from "react";
import Send from "../../assets/icons/SendBtn.svg";
import Attachment from "../../assets/icons/AttachmentIcon.svg";
import { addTicketReply } from "../../api/apiRequest";

const FILE_BASE_URL = "https://mazingbusiness.com/";

const ProfileChat = ({ ticket, onTicketUpdate }) => {
  const chatBodyRef = useRef(null);
  const fileInputRef = useRef(null);

  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const replies = Array.isArray(ticket?.replies) ? ticket.replies : [];
  const ticketStatus = String(ticket?.status || "").toLowerCase();
  const canReply = ticketStatus === "open";

  const getFileUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${FILE_BASE_URL}mazing_business_react/${String(path).replace(/^\/+/, "")}`;
  };

  const isImageFile = (path) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(String(path || "").split("?")[0]);

  const formatReplyDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const datePart = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart.replace(/(\d{1,2}) ([A-Za-z]+) (\d{4})/, "$1 $2, $3")} at ${timePart}`;
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await addTicketReply({
        ticket_id: ticket.id,
        reply: newMessage,
        file: selectedFile,
      });

      if (response?.data) onTicketUpdate(response.data);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setSubmitError(error?.message || "Unable to submit ticket reply.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [replies.length]);

  if (ticketStatus === "pending") return null;

  return (
    <div className="chat-container">
      <div className="ticket-chat" ref={chatBodyRef}>
        {replies.length === 0 && (
          <div className="Nofound">No replies yet.</div>
        )}

        {replies.map((reply) => {
          const isUserReply = Number(reply.user_id) === Number(ticket.user_id);
          const fileUrl = getFileUrl(reply.files);

          return (
            <div
              key={reply.id}
              className={`ticket-message ${isUserReply ? "user-msg" : "admin-msg"}`}
            >
              <div className="msg-bubble">
                {reply.reply && <p>{reply.reply}</p>}

                {fileUrl && isImageFile(reply.files) && (
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={fileUrl}
                      alt="Ticket attachment"
                      className="chat-image"
                    />
                  </a>
                )}

                {fileUrl && !isImageFile(reply.files) && (
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    View attachment
                  </a>
                )}
              </div>
              <div className="msg-time">{formatReplyDate(reply.created_at)}</div>
            </div>
          );
        })}
      </div>

      {canReply && (
        <>
      {selectedFile && (
        <div className="ticket-selected-file">
          <div className="ticket-selected-file-icon" aria-hidden="true">
            {selectedFile.type?.startsWith("image/") ? "IMG" : "FILE"}
          </div>
          <div className="ticket-selected-file-info">
            <span title={selectedFile.name}>{selectedFile.name}</span>
            <small>Ready to send</small>
          </div>
          <button
            type="button"
            aria-label="Remove selected attachment"
            title="Remove attachment"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            ×
          </button>
        </div>
      )}

      {submitError && <p className="form-error">{submitError}</p>}

      <div className="ticket-input-box">
        <input
          type="text"
          placeholder="Type here..."
          value={newMessage}
          disabled={submitting}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
        />

        <div className="ticket-input-boxLft">
          <label htmlFor="ticket-reply-attachment" className="attachment-icon">
            <img src={Attachment} alt="Attachment" />
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="ticket-reply-attachment"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            disabled={submitting}
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="send-btn"
            disabled={submitting || (!newMessage.trim() && !selectedFile)}
            onClick={handleSend}
          >
            <img src={Send} alt="Send" />
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ProfileChat;
