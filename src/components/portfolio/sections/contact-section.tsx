"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Section } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { Input, Textarea, FormField } from "@/components/shared/form-elements";
import { Button } from "@/components/shared/button";
import { Mail, Github, Linkedin, Twitter, Globe } from "lucide-react";
import toast from "react-hot-toast";

interface Props { section: Section; settings: Record<string, unknown>; }

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactSection({ section, settings }: Props) {
  const content = section.content as Record<string, unknown>;
  const social = (settings.social_links as Record<string, string>) ?? {};
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      setSending(false);
      if (!response.ok || resData.error) {
        toast.error(resData.error || "Failed to send message. Please try again.");
        return;
      }
      setSent(true);
      reset();
    } catch (err) {
      setSending(false);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const SOCIAL_LINKS = [
    { key: "github", icon: Github, label: "GitHub" },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "twitter", icon: Twitter, label: "Twitter" },
    { key: "website", icon: Globe, label: "Website" },
  ].filter(({ key }) => social[key]);

  const showEmail = !!content.show_email && !!settings.email;
  const showSocial = !!content.show_social && SOCIAL_LINKS.length > 0;
  const showForm = !!content.show_form;

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="grid md:grid-cols-2 gap-12 items-start">

        {/* Left: Info */}
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Have a project in mind, a question, or just want to say hi? My inbox is always open.
          </p>
          {showEmail && (
            <a href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors group">
              <div className="p-2.5 rounded-lg border border-border group-hover:border-primary/50 transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              {settings.email as string}
            </a>
          )}
          {showSocial && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Find me on</p>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map(({ key, icon: Icon, label }) => (
                  <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Form */}
        {showForm && (
          <div>
            {sent ? (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Message sent!</h3>
                <p className="text-sm text-muted-foreground mb-4">Thanks for reaching out. I&apos;ll get back to you soon.</p>
                <button onClick={() => setSent(false)} className="text-sm text-primary hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Name" required error={errors.name?.message}>
                    <Input {...register("name", { required: "Required" })} placeholder="Your Name" />
                  </FormField>
                  <FormField label="Email" required error={errors.email?.message}>
                    <Input {...register("email", { required: "Required" })} type="email" placeholder="you@example.com" />
                  </FormField>
                </div>
                <FormField label="Subject">
                  <Input {...register("subject")} placeholder="Project inquiry" />
                </FormField>
                <FormField label="Message" required error={errors.message?.message}>
                  <Textarea {...register("message", { required: "Required" })} rows={5} placeholder="Tell me about your project..." />
                </FormField>
                <Button type="submit" loading={sending} className="w-full">Send Message</Button>
              </form>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
