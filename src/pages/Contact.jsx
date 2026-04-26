import React from "react";

const Contact = () => {
  return (
    <div className="contact-container">

      {/* TOP SECTION */}
      <div className="contact-top">

        {/* LEFT SIDE */}
        <div className="contact-left">
          <h1>CONTACT US</h1>

          <p className="contact-desc">
            We are here to help you with jewellery & craft needs 💌
          </p>

          <hr />

          <p><strong>Phone:</strong> +91 9100758185</p>
          <p><strong>Email:</strong> srirenukasogasulu@gmail.com</p>
          <p>
            <strong>Instagram:</strong>{" "}
            <a
              href="https://www.instagram.com/srirenukasogasulu?igsh=aGU1d3B3ZHNpZHd6"
              target="_blank"
            >
              Visit Page
            </a>
          </p>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <img
         src="/images/contact.jpeg"
         alt="Contact"
         className="contact-img"
        />
      </div>

      {/* BOTTOM CARDS */}
      <div className="contact-cards">

        <div className="contact-card">
          <h3> CALL US</h3>
          <p>+91 9100758185</p>
        </div>

        <div className="contact-card">
          <h3> LOCATION</h3>
          <p>Mopidevi,krishna district,Andhrapradesh</p>
        </div>

        <div className="contact-card">
          <h3>BUSINESS HOURS</h3>
          <p>Mon - Sun: 9am - 8pm</p>
        </div>

      </div>
    </div>
  );
};

export default Contact;
