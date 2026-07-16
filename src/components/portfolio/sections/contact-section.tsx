"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Section } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { Input, Textarea } from "@/components/shared/form-elements";
import { Button } from "@/components/shared/button";
import { Mail, Github, Linkedin, Twitter, Globe, ArrowUpRight } from "lucide-react";
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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Left Column: Comms & Signals */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-background rounded-pill border border-border p-8 hover:border-verge-link transition-colors">
            <h3 className="font-manuka text-4xl md:text-[50px] font-black uppercase text-foreground leading-[0.8] tracking-hero mb-4">
              GET IN TOUCH
            </h3>
            <p className="font-sans text-[16px] font-medium leading-relaxed text-foreground/80">
              Have a project in mind, a question, or just want to say hi? My inbox is always open. Let&apos;s build something.
            </p>
          </div>

          {showEmail && (
            <a 
              href={`mailto:${settings.email}`}
              className="group bg-background rounded-pill border border-border p-6 md:p-8 hover:bg-verge-mint hover:border-verge-mint transition-colors flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] uppercase tracking-mono-wide text-muted-foreground group-hover:text-black/60">
                  DIRECT EMAIL
                </span>
                <Mail className="h-5 w-5 text-foreground group-hover:text-black" />
              </div>
              <span className="font-sans text-[20px] md:text-[24px] font-bold text-foreground group-hover:text-black transition-colors break-all">
                {settings.email as string}
              </span>
            </a>
          )}

          {showSocial && (
            <div className="grid grid-cols-2 gap-4">
              {SOCIAL_LINKS.map(({ key, icon: Icon, label }) => (
                <a 
                  key={key} 
                  href={social[key]} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={label}
                  className="group flex flex-col justify-between p-6 bg-background rounded-pill border border-border hover:border-verge-link transition-colors aspect-square md:aspect-auto md:h-32"
                >
                  <div className="flex justify-between items-center">
                    <Icon className="h-5 w-5 text-foreground group-hover:text-verge-link transition-colors" />
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-verge-link transition-colors" />
                  </div>
                  <span className="font-sans text-[16px] font-bold text-foreground uppercase mt-auto">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Form Panel */}
        <div className="col-span-1 lg:col-span-7 flex flex-col">
          {showForm && (
            <div className="bg-background rounded-pill border border-border p-8 md:p-12 h-full flex flex-col">
              {sent ? (
                <div className="bg-verge-mint/10 border border-verge-mint rounded-pill p-8 md:p-12 text-center my-auto">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-verge-mint text-black mb-6">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="font-sans text-[24px] md:text-[32px] font-bold text-foreground mb-4">
                    MESSAGE SENT
                  </h3>
                  <p className="font-sans text-[16px] text-foreground/80 mb-8 max-w-md mx-auto">
                    Thanks for reaching out! I&apos;ll get back to you as soon as I can.
                  </p>
                  <button 
                    onClick={() => setSent(false)} 
                    className="font-mono text-[12px] font-semibold uppercase tracking-mono-norm text-foreground hover:text-verge-link transition-colors"
                  >
                    SEND ANOTHER MESSAGE ↗
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full space-y-6">
                  <h3 className="font-mono text-[12px] uppercase tracking-mono-wide text-verge-mint mb-2">
                    SEND A MESSAGE
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-sans text-[14px] font-bold text-foreground uppercase">
                        NAME <span className="text-verge-uv">*</span>
                      </label>
                      <Input 
                        {...register("name", { required: "Required" })} 
                        placeholder="Your Name" 
                        className="rounded-[10px] border-border/50 bg-accent/5 h-14 px-4 font-sans text-[16px] focus-visible:ring-1 focus-visible:ring-verge-uv focus-visible:border-verge-uv transition-all"
                      />
                      {errors.name && (
                        <p className="font-mono text-[10px] text-verge-uv uppercase mt-1">Required</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-sans text-[14px] font-bold text-foreground uppercase">
                        EMAIL <span className="text-verge-uv">*</span>
                      </label>
                      <Input 
                        {...register("email", { required: "Required" })} 
                        type="email" 
                        placeholder="you@example.com" 
                        className="rounded-[10px] border-border/50 bg-accent/5 h-14 px-4 font-sans text-[16px] focus-visible:ring-1 focus-visible:ring-verge-uv focus-visible:border-verge-uv transition-all"
                      />
                      {errors.email && (
                        <p className="font-mono text-[10px] text-verge-uv uppercase mt-1">Required</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-sans text-[14px] font-bold text-foreground uppercase">
                      SUBJECT
                    </label>
                    <Input 
                      {...register("subject")} 
                      placeholder="What's this about?" 
                      className="rounded-[10px] border-border/50 bg-accent/5 h-14 px-4 font-sans text-[16px] focus-visible:ring-1 focus-visible:ring-verge-uv focus-visible:border-verge-uv transition-all"
                    />
                  </div>

                  <div className="space-y-2 flex-grow flex flex-col">
                    <label className="font-sans text-[14px] font-bold text-foreground uppercase">
                      MESSAGE <span className="text-verge-uv">*</span>
                    </label>
                    <Textarea 
                      {...register("message", { required: "Required" })} 
                      placeholder="Write your message here..." 
                      className="rounded-[10px] border-border/50 bg-accent/5 p-4 font-sans text-[16px] focus-visible:ring-1 focus-visible:ring-verge-uv focus-visible:border-verge-uv transition-all flex-grow min-h-[160px] resize-none"
                    />
                    {errors.message && (
                      <p className="font-mono text-[10px] text-verge-uv uppercase mt-1">Required</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      loading={sending} 
                      className="w-full h-[52px] rounded-btn bg-verge-mint hover:bg-white/20 text-black font-mono text-[14px] uppercase font-bold tracking-mono-norm transition-all hover:shadow-[0_0_0_1px_#c2c2c2] border-none"
                    >
                      SEND MESSAGE
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </SectionWrapper>
  );
}
