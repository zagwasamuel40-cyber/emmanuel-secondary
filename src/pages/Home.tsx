import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNews } from "../data/newsData";
import { useInquiries } from "../data/inquiriesData";
import { usePortalSettings } from "../data/portalSettingsData";
import { useComments } from "../data/commentsData";
import { useTeachers } from "../data/teachersData";
import { ParentCommentForm } from "../components/ParentCommentForm";
import { MessageSquare, Star } from "lucide-react";

import { ArrowRight, BookOpen, Users, Trophy, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "@/src/components/ui";
import { TeamGallery } from "../components/TeamGallery";

function InquiryForm() {
  const [inquiries, setInquiries] = useInquiries();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInquiry = {
      id: `INQ-${Math.floor(Math.random() * 10000)}`,
      name,
      email,
      subject,
      message,
      date: new Date().toISOString(),
      status: "Unread" as const,
    };
    setInquiries([newInquiry, ...inquiries]);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  if (success) {
    return (
      <div className="bg-emerald-900/40 border border-emerald-500/30 p-8 rounded-2xl text-center flex flex-col items-center">
        <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Inquiry Submitted Successfully</h3>
        <p className="text-emerald-200">Thank you for reaching out! Our Admission Office will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-white">Full Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-slate-400" placeholder="e.g. Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white">Email Address</Label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-slate-400" placeholder="e.g. jane@example.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white">Subject</Label>
            <Input required value={subject} onChange={e => setSubject(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-slate-400" placeholder="e.g. Admission Deadline" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white">Message</Label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" placeholder="How can we help you?"></textarea>
          </div>
          <Button type="submit" variant="brand" className="w-full gap-2">
            Send Message <Send size={16} />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [news] = useNews();
  const [portalSettings] = usePortalSettings();
  const [comments] = useComments();
  const [teachers] = useTeachers();
  const approvedComments = comments.filter(c => c.status === "Approved");
  const activeTeachers = teachers.filter(t => t.status === "Active" && t.passportUrl);
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-brand-950 text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/50 border border-brand-800 text-brand-100 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Admissions Open for 2026/2027 Session
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold max-w-2xl leading-tight mb-6">
            Empowering the Next Generation of <span className="text-accent-500">Leaders</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mb-10 leading-relaxed">
            {portalSettings.schoolName} provides a world-class educational experience combining academic rigor, moral discipline, and technological innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/admissions">
              <Button variant="brand" size="lg" className="gap-2 w-full sm:w-auto">
                Apply Now <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/academics">
              <Button variant="outline" size="lg" className="text-white border-slate-700 hover:bg-slate-800 w-full sm:w-auto">
                Explore Curriculum
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="text-center px-4">
              <p className="text-4xl font-heading font-bold text-slate-900 mb-2">2,500+</p>
              <p className="text-sm text-slate-500 font-medium">Active Students</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-heading font-bold text-slate-900 mb-2">150+</p>
              <p className="text-sm text-slate-500 font-medium">Expert Teachers</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-heading font-bold text-slate-900 mb-2">98%</p>
              <p className="text-sm text-slate-500 font-medium">WAEC Pass Rate</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-heading font-bold text-slate-900 mb-2">15+</p>
              <p className="text-sm text-slate-500 font-medium">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values / Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Choose {portalSettings.schoolName}?</h2>
            <p className="text-slate-600">We are committed to providing an environment where students can thrive academically, socially, and morally.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Academic Excellence</h3>
                <p className="text-slate-600 leading-relaxed">Rigorous curriculum covering JSS and SSS subjects, preparing students for BECE, WAEC, and NECO with outstanding results.</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-600 mb-6">
                  <Trophy size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Holistic Development</h3>
                <p className="text-slate-600 leading-relaxed">Beyond academics, we focus on sports, arts, and character building to develop well-rounded global citizens.</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <Users size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Modern Facilities</h3>
                <p className="text-slate-600 leading-relaxed">State-of-the-art CBT centers, science laboratories, a well-stocked library, and secure boarding hostels.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

            {/* News Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Latest News & Updates</h2>
              <p className="text-slate-600">Stay informed about what's happening at {portalSettings.schoolName}.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.slice(0, 3).map(item => (
              <Card key={item.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-sm font-semibold text-brand-600 mb-3 uppercase tracking-wider">{new Date(item.date).toLocaleDateString()}</div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 line-clamp-3">{item.content}</p>
                </CardContent>
              </Card>
            ))}
            {news.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-500">No recent news available.</div>
            )}
          </div>
        </div>
      </section>

      
      {/* Staff Gallery Section */}
      {activeTeachers.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Our Dedicated Team</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Meet the exceptional educators and staff who make our school a center of excellence.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {activeTeachers.slice(0, 10).map((teacher) => (
                <div key={teacher.id} className="flex flex-col items-center group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-100 shadow-md mb-4 group-hover:border-brand-500 transition-colors duration-300">
                    <img 
                      src={teacher.passportUrl} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 text-center line-clamp-1">{teacher.name}</h4>
                  <p className="text-xs text-brand-600 font-medium text-center line-clamp-1 mt-1">{teacher.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">What Parents Are Saying</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Hear from our community of parents and guardians about their experience with {portalSettings.schoolName}.</p>
          </div>
          
          {approvedComments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {approvedComments.slice(0, 3).map(comment => (
                <Card key={comment.id} className="border-0 shadow-lg shadow-slate-200/50 bg-white">
                  <CardContent className="p-8">
                    <div className="flex text-amber-400 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <p className="text-slate-700 italic mb-6">"{comment.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                        {comment.parentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{comment.parentName}</h4>
                        <p className="text-xs text-slate-500">{comment.relation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 mb-16">
              No comments available yet. Be the first to share your experience!
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <ParentCommentForm />
          </div>
        </div>
      </section>

      {/* Contact & Inquiries Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-white mb-4">Have Questions about Admissions?</h2>
            <p className="text-slate-300">Send an inquiry directly to our Admissions Office.</p>
          </div>
          
          <InquiryForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Ready to Join Our Community?</h2>
          <p className="text-lg text-slate-600 mb-10">Access the portal to manage your academic journey or start a new application.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <Button variant="brand" size="lg" className="w-full sm:w-auto">
                Login to Portal
              </Button>
            </Link>
            <Link to="/admissions">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                Admission Guidelines <ChevronRight size={18} />
              </Button>
            </Link>
            <Link to="/entrance-exam">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-brand-600 border-brand-200 bg-brand-50 hover:bg-brand-100">
                Take Entrance Exam <ChevronRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
