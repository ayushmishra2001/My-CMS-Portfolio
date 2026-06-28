"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Section } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { Input, Textarea } from "@/components/shared/form-elements";
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-border bg-background transition-colors duration-300 w-full">
        
        {/* Left Column: Comms & Signals */}
        <div className="col-span-1 md:col-span-5 border-b md:border-b-0 md:border-r border-border p-6 md:p-10 flex flex-col justify-between space-y-8">
          <div>
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block mb-2 select-none">
              [ COMMS_CHANNELS // INBOX ]
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground leading-tight mb-4 select-none">
              GET IN TOUCH.
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed font-light">
              Have a project in mind, a question, or just want to say hi? My inbox is always open. Let&apos;s build something stark.
            </p>
          </div>

          <div className="space-y-6">
            {showEmail && (
              <div className="pt-6 border-t border-border/40">
                <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest block mb-2 select-none">
                  [ DIRECT_EMAIL ]
                </span>
                <a 
                  href={`mailto:${settings.email}`}
                  className="group flex items-center justify-between p-4 border border-border bg-background hover:bg-accent transition-colors duration-200"
                >
                  <span className="font-mono text-xs sm:text-sm text-foreground select-all font-semibold">
                    {settings.email as string}
                  </span>
                  <Mail className="h-4 w-4 text-muted-foreground group-hover:text-foreground transform group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            )}

            {showSocial && (
              <div className="pt-6 border-t border-border/40">
                <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest block mb-3 select-none">
                  [ EXTERNAL_SIGNALS ]
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-border border border-border overflow-hidden">
                  {SOCIAL_LINKS.map(({ key, icon: Icon, label }) => (
                    <a 
                      key={key} 
                      href={social[key]} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={label}
                      className="flex flex-col items-center justify-center p-4 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors duration-200 gap-1.5 text-center"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-mono text-[8px] uppercase tracking-wider">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div className="col-span-1 md:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-card/10">
          {showForm && (
            <div>
              {sent ? (
                /* Monospace Console Success Block */
                <div className="border border-green-500/30 bg-green-500/[0.02] p-6 md:p-8 font-mono text-left">
                  <div className="flex items-center justify-between border-b border-green-500/20 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold text-green-500/90 tracking-widest">
                        SYSTEM_COMMS // ESTABLISHED
                      </span>
                    </div>
                    <span className="text-[9px] text-green-500/60 uppercase">
                      [ STACK_OK ]
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-green-500/90 leading-relaxed">
                    <p className="font-bold">&gt;&gt;&gt; MESSAGE_TRANSMISSION: SUCCESSFUL</p>
                    <p className="text-green-500/70">
                      Your transmission packet has been serialized, signed, and saved into the portfolio datastore.
                    </p>
                    <p className="text-green-500/70">
                      Our gateway will review the payload. Expect a callback route soon.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-green-500/20">
                    <button 
                      onClick={() => setSent(false)} 
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-green-400 hover:text-green-300 hover:underline transition-colors"
                    >
                      <span>&lt;&lt; RESET_TERMINAL // NEW_PACKET</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Industrial Print / Terminal Form */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[10px] uppercase font-bold text-foreground tracking-wider block">
                        NAME_SPEC <span className="text-primary">*</span>
                      </label>
                      <Input 
                        {...register("name", { required: "Required" })} 
                        placeholder="ENTER YOUR NAME" 
                        className="rounded-none border-border bg-background h-12 px-4 text-sm font-mono tracking-tight focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                      />
                      {errors.name && (
                        <p className="font-mono text-[9px] text-destructive uppercase tracking-widest mt-1">
                          [ ERROR // {errors.name.message} ]
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[10px] uppercase font-bold text-foreground tracking-wider block">
                        EMAIL_SPEC <span className="text-primary">*</span>
                      </label>
                      <Input 
                        {...register("email", { required: "Required" })} 
                        type="email" 
                        placeholder="YOU@EXAMPLE.COM" 
                        className="rounded-none border-border bg-background h-12 px-4 text-sm font-mono tracking-tight focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                      />
                      {errors.email && (
                        <p className="font-mono text-[9px] text-destructive uppercase tracking-widest mt-1">
                          [ ERROR // {errors.email.message} ]
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase font-bold text-foreground tracking-wider block">
                      SUBJECT_LINE
                    </label>
                    <Input 
                      {...register("subject")} 
                      placeholder="PROJECT INQUIRY / COLLABORATION" 
                      className="rounded-none border-border bg-background h-12 px-4 text-sm font-mono tracking-tight focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase font-bold text-foreground tracking-wider block">
                      MESSAGE_BODY <span className="text-primary">*</span>
                    </label>
                    <Textarea 
                      {...register("message", { required: "Required" })} 
                      rows={5} 
                      placeholder="TELL ME ABOUT YOUR PROJECT DETAILS..." 
                      className="rounded-none border-border bg-background p-4 text-sm font-mono tracking-tight focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 min-h-[140px]"
                    />
                    {errors.message && (
                      <p className="font-mono text-[9px] text-destructive uppercase tracking-widest mt-1">
                        [ ERROR // {errors.message.message} ]
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    loading={sending} 
                    className="w-full h-14 rounded-none bg-primary text-primary-foreground font-mono text-xs uppercase font-black tracking-widest hover:bg-primary/90 transition-colors duration-200 border-none flex items-center justify-center gap-2"
                  >
                    <span>TRANSMIT_MESSAGE // SEND</span>
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </SectionWrapper>
  );
}
