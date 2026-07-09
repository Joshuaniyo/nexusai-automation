'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Mail, Clock, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Message sent successfully! We\'ll respond within 24-48 hours.');
  }

  return (
    <div className="min-h-screen bg-[hsl(220,16%,6%)]">
      <header className="border-b border-[hsl(220,14%,16%)] sticky top-0 bg-[hsl(220,16%,8%)]/95 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[hsl(220,16%,6%)]" />
            </div>
            <span className="text-lg font-semibold text-white">NexusAI</span>
          </Link>
          <Button variant="ghost" asChild className="text-[hsl(215,16%,65%)]">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-[hsl(215,16%,60%)] max-w-2xl mx-auto">
            Have questions? We&apos;re here to help. Reach out and we&apos;ll respond within 24-48 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[hsl(215,16%,60%)] text-sm mb-2">For general inquiries:</p>
                <a href="mailto:support@nexusai-automation.com" className="text-cyan-400 hover:underline">
                  support@nexusai-automation.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[hsl(215,16%,60%)] text-sm">
                  We respond to all inquiries within <span className="text-white font-medium">24-48 hours</span> during business days.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  Priority Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[hsl(215,16%,60%)] text-sm">
                  Premium subscribers receive priority support with faster response times.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2 bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
            <CardHeader>
              <CardTitle className="text-white">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-[hsl(215,16%,60%)] mb-6">
                    We&apos;ll get back to you within 24-48 hours.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}
                    className="border-[hsl(220,14%,20%)] text-white hover:bg-[hsl(220,14%,12%)]">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-white">Name</label>
                      <Input id="name" name="name" placeholder="Your name" required
                        className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
                      <Input id="email" name="email" type="email" placeholder="your@email.com" required
                        className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-white">Subject</label>
                    <Input id="subject" name="subject" placeholder="How can we help?" required
                      className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-white">Message</label>
                    <Textarea id="message" name="message" placeholder="Tell us more about your inquiry..." rows={6} required
                      className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)] resize-none" />
                  </div>
                  <Button type="submit" disabled={isSubmitting}
                    className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-500 text-[hsl(220,16%,6%)] font-medium">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-[hsl(220,14%,16%)] py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-[hsl(215,16%,50%)] text-sm">
          © {new Date().getFullYear()} NexusAI Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
