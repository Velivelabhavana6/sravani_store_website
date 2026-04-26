import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "../services/whatsappService";

const FloatingWhatsApp = () => {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
};

export default FloatingWhatsApp;
