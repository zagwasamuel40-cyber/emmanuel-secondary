import React, { useState } from "react";
import { TeamMember } from "../data/portalSettingsData";
import { X, Award, Briefcase, BookOpen } from "lucide-react";
import { Button } from "./ui";

export function TeamGallery({ team }: { team: TeamMember[] }) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const publishedTeam = (team || [])
    .filter(member => member.published !== false) // default to true if undefined
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (publishedTeam.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {publishedTeam.map((member) => (
          <div key={member.id} className="flex flex-col items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner mb-5 group-hover:border-brand-100 transition-colors duration-300">
              <img 
                src={member.photoUrl || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80"} 
                alt={member.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h4 className="font-heading font-bold text-lg text-slate-900 text-center line-clamp-1">{member.name}</h4>
            <p className="text-brand-600 font-bold text-sm text-center mt-1">{member.role}</p>
            {member.department && (
              <p className="text-xs text-slate-500 font-medium text-center uppercase tracking-wider mt-2 bg-slate-50 px-2 py-1 rounded-md">{member.department}</p>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-6 w-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setSelectedMember(member)}
            >
              View Profile
            </Button>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-10"
              onClick={() => setSelectedMember(null)}
            >
              <X size={20} />
            </button>
            
            <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-40 h-40 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-md">
                <img 
                  src={selectedMember.photoUrl || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80"} 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-heading text-3xl font-bold text-slate-900">{selectedMember.name}</h3>
                <p className="text-lg text-brand-600 font-bold mt-1 mb-6">{selectedMember.role}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
                  {selectedMember.department && (
                    <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                      <Briefcase className="text-slate-400 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Department</p>
                        <p className="text-sm text-slate-900 font-medium">{selectedMember.department}</p>
                      </div>
                    </div>
                  )}
                  {selectedMember.qualification && (
                    <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                      <Award className="text-slate-400 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Qualification</p>
                        <p className="text-sm text-slate-900 font-medium">{selectedMember.qualification}</p>
                      </div>
                    </div>
                  )}
                  {selectedMember.experienceYears && (
                    <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3 sm:col-span-2">
                      <BookOpen className="text-slate-400 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Experience</p>
                        <p className="text-sm text-slate-900 font-medium">{selectedMember.experienceYears}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedMember.bio && (
                  <div className="text-left">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">Biography</p>
                    <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{selectedMember.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
