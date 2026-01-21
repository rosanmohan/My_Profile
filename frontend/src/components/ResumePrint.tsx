import React, { forwardRef } from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

interface ResumePrintProps {
    data: ResumeData;
}

const FormatDate = (raw: string | undefined): string => {
    if (!raw) return "";
    const dateMatch = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[month - 1]} ${year}`;
    }
    return raw;
};

// Use forwardRef to allow react-to-print to reference this component
export const ResumePrint = forwardRef<HTMLDivElement, ResumePrintProps>(({ data }, ref) => {
    return (
        <div className="hidden">
            <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans print-container mx-auto">
                <style type="text/css" media="print">
                    {`
                        @page { size: A4; margin: 0mm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .print-container { width: 100%; height: 100%; display: block; }
                    `}
                </style>

                <div className="flex flex-row min-h-screen">
                    {/* LEFT SIDEBAR - Dark Blue/Slate */}
                    <div className="w-[32%] bg-slate-900 text-white p-8 flex flex-col gap-6">

                        {/* PROFILE PHOTO */}
                        {data.profile.image_url && (
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-700 shadow-xl mb-4">
                                <img src={data.profile.image_url} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* CONTACT INFO */}
                        <div className="flex flex-col gap-3 text-sm text-slate-300">
                            <div className="border-b border-slate-700 pb-2 mb-2 uppercase tracking-widest text-xs font-bold text-orange-400">Contact</div>
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-orange-400 shrink-0" />
                                <span className="break-all">{data.profile.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-orange-400 shrink-0" />
                                <span>{data.profile.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-orange-400 shrink-0" />
                                <span>{data.profile.location}</span>
                            </div>
                            {data.profile.linkedin && (
                                <div className="flex items-center gap-2">
                                    <Linkedin size={14} className="text-orange-400 shrink-0" />
                                    <span className="truncate">{data.profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                                </div>
                            )}
                            {data.profile.github && (
                                <div className="flex items-center gap-2">
                                    <Github size={14} className="text-orange-400 shrink-0" />
                                    <span className="truncate">{data.profile.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                                </div>
                            )}

                            {/* PERSONAL DETAILS (New) */}
                            <div className="border-t border-slate-700 pt-3 mt-1"></div>
                            {data.profile.dob && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Date of Birth</span>
                                    <span className="text-slate-300">{data.profile.dob}</span>
                                </div>
                            )}
                            {data.profile.pan && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">PAN</span>
                                    <span className="text-slate-300 font-mono text-xs">{data.profile.pan}</span>
                                </div>
                            )}
                            {data.profile.aadhaar && (
                                <div className="flex flex-col mt-1">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Aadhaar</span>
                                    <span className="text-slate-300 font-mono text-xs">{data.profile.aadhaar}</span>
                                </div>
                            )}
                        </div>

                        {/* EDUCATION */}
                        {data.education && (
                            <div className="flex flex-col gap-4">
                                <div className="border-b border-slate-700 pb-2 uppercase tracking-widest text-xs font-bold text-orange-400">Education</div>
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <div className="font-bold text-white text-sm">{edu.degree}</div>
                                        <div className="text-xs text-slate-400">{edu.institution}</div>
                                        <div className="text-xs text-slate-500 italic">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SKILLS */}
                        <div className="flex flex-col gap-4">
                            <div className="border-b border-slate-700 pb-2 uppercase tracking-widest text-xs font-bold text-orange-400">Skills</div>
                            {Object.entries(data.skills).map(([category, skills]) => (
                                <div key={category} className="mb-2">
                                    <div className="text-xs font-bold text-indigo-300 mb-1">{category}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, i) => (
                                            <span key={i} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT CONTENT - White */}
                    <div className="w-[68%] bg-white p-8 flex flex-col gap-6">

                        {/* HEADER NAME */}
                        <div className="border-l-4 border-orange-500 pl-4 mb-4">
                            <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">
                                {data.profile.name}
                            </h1>
                            <h2 className="text-lg font-medium text-orange-600 tracking-wide uppercase">
                                {data.profile.title}
                            </h2>
                        </div>

                        {/* SUMMARY */}
                        {data.profile.summary && (
                            <div className="text-sm text-slate-600 leading-relaxed text-justify">
                                {data.profile.summary}
                            </div>
                        )}

                        {/* EXPERIENCE */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> Experience
                            </h3>
                            <div className="flex flex-col gap-6">
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} className="relative pl-4 border-l-2 border-slate-100">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-slate-800">{exp.role}</h4>
                                            <span className="text-xs text-slate-500 font-mono whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">{exp.duration}</span>
                                        </div>
                                        <div className="text-sm text-indigo-600 font-medium mb-2">{exp.company}</div>
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap text-justify">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PROJECTS */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Featured Projects
                            </h3>
                            <div className="flex flex-col gap-5">
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100/50">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h4 className="font-bold text-slate-800">{proj.title}</h4>
                                        </div>
                                        <div className="text-[10px] text-slate-500 italic mb-2">
                                            {proj.technologies.join(" • ")}
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed mb-2 text-justify">
                                            {proj.description}
                                        </p>
                                        {proj.responsibilities && (
                                            <div className="text-[10px] text-slate-500 pl-2 border-l-2 border-orange-200 mt-1">
                                                {proj.responsibilities}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
});

export default ResumePrint;
