'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Thank you! Your message has been sent successfully.');
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="max-w-2xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Get in Touch</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">We are here to assist you</h1>
        <p className="text-muted-foreground leading-relaxed">
          Have a question about an order, styling advice, or custom inquiries? Reach out to our customer care team and we will respond within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-card border border-border p-6 md:p-8 rounded-sm">
          {submitted ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-14 w-14 text-success mx-auto mb-4" />
              <h2 className="font-display text-2xl md:text-3xl mb-2">Message Sent</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
                Thank you for contacting Noreh.pk. Our team will review your message and reply via email or phone shortly.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider block mb-2">
                    Your Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Fatima Ali"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider block mb-2">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. fatima@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider block mb-2">
                    Phone / WhatsApp Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. +92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider block mb-2">
                    Subject
                  </label>
                  <Input
                    placeholder="e.g. Delivery Update / Product Query"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider block mb-2">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  required
                  rows={5}
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-border p-6 rounded-sm bg-secondary/30">
            <h3 className="font-display text-xl mb-4">Customer Care Support</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Phone & WhatsApp</p>
                  <p className="text-muted-foreground">+92 300 1234567</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Instant WhatsApp support available</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Email Inquiries</p>
                  <p className="text-muted-foreground">support@noreh.pk</p>
                  <p className="text-xs text-muted-foreground mt-0.5">We reply within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Support Hours</p>
                  <p className="text-muted-foreground">Monday – Saturday: 10:00 AM – 8:00 PM (PKT)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sunday: Closed (Inquiries answered Monday)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Head Office</p>
                  <p className="text-muted-foreground">Gulberg III, Lahore, Punjab, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border p-6 rounded-sm bg-accent/20">
            <div className="flex items-center gap-2 mb-2 text-accent-foreground font-medium">
              <MessageSquare className="h-4 w-4" />
              <span>Need Quick Answers?</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Find answers about delivery timelines, return procedures, delivery questions, and fabric care.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/faq">Visit FAQs</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/shipping">Shipping Policy</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/returns">Return Policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

