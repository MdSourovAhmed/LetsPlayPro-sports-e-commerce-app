import { useState } from "react";
import toast from "react-hot-toast";
import { SectionHeading } from "../components/ui/SectionHeading";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e) {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="container-page py-20">
      <SectionHeading eyebrow="Get In Touch" title="Contact Us" />
      <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-lg flex-col gap-4">
        <input
          required
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
        />
        <input
          required
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
        />
        <textarea
          required
          rows={5}
          placeholder="Your Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input-field resize-none"
        />
        <button type="submit" className="btn-primary">
          Send Message
        </button>
      </form>
    </div>
  );
}
