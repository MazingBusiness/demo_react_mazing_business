import React, { useCallback, useEffect, useRef, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import ProfileChat from "../../components/user-profile/ProfileChat";
import { getTicketDetails } from "../../api/apiRequest";

const FILE_BASE_URL = "https://mazingbusiness.com/";

const TicketDetails = () => {
  const location = useLocation();
  const selectedTicket = location.state?.ticket;
  const ticketId = selectedTicket?.id;
  const ticketCode = selectedTicket?.code;

  const [ticket, setTicket] = useState(selectedTicket ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ticketStatusRef = useRef(
    String(selectedTicket?.status || "").toLowerCase(),
  );

  const refreshTicket = useCallback(async ({ showLoader = false } = {}) => {
    if (!ticketId && !ticketCode) {
      setError("Ticket information is missing.");
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);

    try {
      const response = await getTicketDetails({
        ticket_id: ticketId,
        code: ticketCode,
      });
      const latestTicket = response?.data ?? null;
      setTicket(latestTicket);
      ticketStatusRef.current = String(latestTicket?.status || "").toLowerCase();
      setError("");
      return { rateLimited: false };
    } catch (requestError) {
      if (showLoader) {
        setError(requestError?.message || "Unable to load ticket details.");
      }
      return {
        rateLimited: requestError?.status === 429,
        retryAfter: requestError?.retryAfter || 0,
      };
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [ticketId, ticketCode]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const scheduleNextRefresh = (delay) => {
      if (cancelled) return;
      timeoutId = window.setTimeout(pollTicket, delay);
    };

    const pollTicket = async () => {
      if (cancelled) return;
      if (document.hidden) {
        scheduleNextRefresh(15000);
        return;
      }

      const result = await refreshTicket();
      if (cancelled) return;

      if (result?.rateLimited) {
        scheduleNextRefresh(
          result.retryAfter ? result.retryAfter * 1000 : 30000,
        );
        return;
      }

      scheduleNextRefresh(ticketStatusRef.current === "pending" ? 15000 : 3000);
    };

    const startPolling = async () => {
      const result = await refreshTicket({ showLoader: true });
      if (cancelled) return;
      if (result?.rateLimited) {
        scheduleNextRefresh(
          result.retryAfter ? result.retryAfter * 1000 : 30000,
        );
        return;
      }
      scheduleNextRefresh(ticketStatusRef.current === "pending" ? 15000 : 3000);
    };

    startPolling();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [refreshTicket]);

  const uploadedFileUrl = ticket?.files
    ? /^https?:\/\//i.test(ticket.files)
      ? ticket.files
      : `${FILE_BASE_URL}mazing_business_react/${String(ticket.files).replace(
          /^\/+/,
          "",
        )}`
    : "";
  const uploadedFileIsImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
    String(ticket?.files || "").split("?")[0],
  );

  return (
    <UserProfileLayout>
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <div className="breadcrumb">
              <Link to="/support-tickets">
                <IoIosArrowBack />
                Ticket Details
              </Link>
              {ticket?.status && (
                <span
                  className={`ticket-details-status ticket-details-status-${String(
                    ticket.status,
                  ).toLowerCase()}`}
                >
                  Status :{" "}
                  {String(ticket.status).charAt(0).toUpperCase() +
                    String(ticket.status).slice(1).toLowerCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {loading && <div className="loader">Loading ticket details…</div>}
        {!loading && error && <div className="Nofound">{error}</div>}
        {!loading && !error && ticket && (
          <>
            <section
              className={`ticket-details-summary${
                uploadedFileUrl ? " has-attachment" : ""
              }`}
            >
              <div className="ticket-details-main">
                <div className="ticket-details-heading">
                  <div className="ticket-details-code">
                    <small>Ticket Code</small>
                    <strong>#{ticket.code || ticket.id}</strong>
                  </div>
                  <div className="ticket-details-subject">
                    <small>Subject</small>
                    <h2>{ticket.subject || "-"}</h2>
                  </div>
                </div>

                <div className="ticket-details-description">
                  <small>Details</small>
                  <p>{ticket.details || "-"}</p>
                </div>
              </div>

              {uploadedFileUrl && (
                <div className="ticket-details-attachment">
                  {/* <small>Uploaded File</small> */}
                  {uploadedFileIsImage ? (
                    <a
                      href={uploadedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ticket-details-image-link"
                    >
                      <img
                        src={uploadedFileUrl}
                        alt="Ticket attachment"
                        className="ticket-details-image"
                      />
                      <span>Click to view full image</span>
                    </a>
                  ) : (
                    <a
                      href={uploadedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ticket-details-file-link"
                    >
                      View uploaded file
                    </a>
                  )}
                </div>
              )}
            </section>

            {String(ticket.status || "").toLowerCase() !== "pending" && (
              <div className="chat-section">
                <ProfileChat ticket={ticket} onTicketUpdate={setTicket} />
              </div>
            )}
          </>
        )}
      </div>
    </UserProfileLayout>
  );
};

export default TicketDetails;
