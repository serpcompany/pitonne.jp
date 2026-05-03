"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (submitted) {
    return (
      <div className="bg-[#f5ebe0] rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4AA69D] flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
        <p className="text-muted-foreground">
          We&apos;ve received your message and will get back to you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#4AA69D] focus:border-transparent"
          placeholder="Your name"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#4AA69D] focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#4AA69D] focus:border-transparent"
            placeholder="080-XXXX-XXXX"
          />
        </div>
      </div>

      <div>
        <label htmlFor="service" className="block text-sm font-medium mb-2">
          Service Interest
        </label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#4AA69D] focus:border-transparent"
        >
          <option value="">Select a service</option>
          <option value="iv-therapy">IV Therapy</option>
          <option value="stem-cell">Stem Cell Therapy</option>
          <option value="medications">Medications</option>
          <option value="consultation">General Consultation</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#4AA69D] focus:border-transparent resize-none"
          placeholder="Tell us how we can help..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#4AA69D] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
      >
        Send Message
      </button>
    </form>
  )
}
