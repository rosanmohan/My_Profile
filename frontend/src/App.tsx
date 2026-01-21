import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Save, Plus, Trash2, Mail, Phone, Linkedin, MapPin, X, ChevronRight, Download, Lock, Camera, User, Github, CreditCard, Calendar, FileText, Upload, Eye, Printer } from 'lucide-react'
import { useReactToPrint } from 'react-to-print';
import ResumePrint from './components/ResumePrint';
import { ResumeData, Experience, Project, Education } from './types'
import { EditableText } from './components/EditableText'

const API_URL = import.meta.env.VITE_API_URL || '/api/resume';

function App() {
    const [data, setData] = useState<ResumeData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [serverWakeup, setServerWakeup] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState('');

    const [expandedExperience, setExpandedExperience] = useState<number | null>(null);
    const [expandedProject, setExpandedProject] = useState<number | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Print Ref
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Rosan_Profile_Resume',
    });

    useEffect(() => {
        fetchData();
        const session = localStorage.getItem('isAdmin');
        if (session === 'true') setIsAdmin(true);
    }, []);

    const fetchData = async () => {
        const timer = setTimeout(() => setServerWakeup(true), 3000);
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            clearTimeout(timer);
            setLoading(false);
            setServerWakeup(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAdmin(true);
            localStorage.setItem('isAdmin', 'true');
            setShowLogin(false);
            setPassword('');
        } else {
            alert('Invalid Password');
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setIsEditing(false);
        localStorage.removeItem('isAdmin');
    };

    const handleSave = async () => {
        try {
            if (data) {
                console.log("Saved Data:", data);
                setIsEditing(false);
                alert("Changes saved locally! (Backend persistence required)");
            }
        } catch (err) {
            alert("Failed to save");
        }
    };

    const updateProfile = (field: keyof typeof data.profile, value: string) => {
        if (!data) return;
        setData({ ...data, profile: { ...data.profile, [field]: value } });
    };

    const updateExperience = (index: number, field: keyof Experience, value: string) => {
        if (!data) return;
        const newExp = [...data.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        setData({ ...data, experience: newExp });
    };

    const addExperience = () => {
        if (!data) return;
        const newExp = { role: 'New Role', company: 'Company', duration: '202X - Present', description: 'Description...' };
        setData({ ...data, experience: [newExp, ...data.experience] });
    };

    const removeExperience = (index: number) => {
        if (!data) return;
        const newExp = data.experience.filter((_, i) => i !== index);
        setData({ ...data, experience: newExp });
    };

    const updateProject = (index: number, field: keyof Project, value: unknown) => {
        if (!data) return;
        const newProj = [...data.projects];
        if (field === 'technologies' && typeof value === 'string') {
            newProj[index] = { ...newProj[index], technologies: value.split(',').map(s => s.trim()) };
        } else {
            // @ts-ignore
            newProj[index] = { ...newProj[index], [field]: value };
        }
        setData({ ...data, projects: newProj });
    };

    const addProject = () => {
        if (!data) return;
        const newProj = { title: 'New Project', technologies: ['React'], description: 'Description...' };
        setData({ ...data, projects: [newProj, ...data.projects] });
    };

    const removeProject = (index: number) => {
        if (!data) return;
        const newProj = data.projects.filter((_, i) => i !== index);
        setData({ ...data, projects: newProj });
    };

    const updateSkills = (category: string, index: number, value: string) => {
        if (!data) return;
        const newSkills = { ...data.skills };
        newSkills[category][index] = value;
        setData({ ...data, skills: newSkills });
    };

    const addSkillCategory = () => {
        if (!data) return;
        const newSkills = { ...data.skills, "New Category": ["Skill 1"] };
        setData({ ...data, skills: newSkills });
    };

    const renameSkillCategory = (oldName: string, newName: string) => {
        if (!data || oldName === newName) return;
        const { [oldName]: skills, ...rest } = data.skills;
        const newSkills = { ...rest, [newName]: skills };
        setData({ ...data, skills: newSkills });
    };

    const removeSkillCategory = (category: string) => {
        if (!data) return;
        const { [category]: _, ...rest } = data.skills;
        setData({ ...data, skills: rest });
    };

    const updateEducation = (index: number, field: keyof Education, value: string) => {
        if (!data) return;
        const newEdu = [...(data.education || [])];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setData({ ...data, education: newEdu });
    };

    const addEducation = () => {
        if (!data) return;
        const newEdu = { degree: 'Degree', institution: 'University', year: '202X' };
        setData({ ...data, education: [...(data.education || []), newEdu] });
    };

    const removeEducation = (index: number) => {
        if (!data || !data.education) return;
        const newEdu = data.education.filter((_, i) => i !== index);
        setData({ ...data, education: newEdu });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && data) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData({ ...data, profile: { ...data.profile, image_url: reader.result as string } });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading Profile...</p>
            {serverWakeup && <p className="text-xs text-orange-500 mt-2 animate-pulse">Waking up server (this may take 30s)...</p>}
        </div>
    );

    if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load data</div>;

    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-800 font-sans lg:h-screen lg:overflow-hidden overflow-auto">
            <AnimatePresence>
                {showLogin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <form onSubmit={handleLogin} className="glass-card p-8 w-full max-w-sm">
                            <h3 className="text-2xl font-bold mb-4 text-center">Admin Login</h3>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                className="input-field mb-4 py-3"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowLogin(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Login</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {isAdmin && (
                <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
                    <button
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className={`p-4 rounded-full shadow-xl flex items-center gap-2 transition-all text-white ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isEditing ? <Save size={24} /> : <Edit2 size={24} />}
                        <span className="font-semibold hidden md:inline">{isEditing ? 'Save' : 'Edit'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-3 rounded-full bg-red-600/80 hover:bg-red-700 text-white shadow-lg self-end"
                        title="Logout"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )}

            <div className="fixed bottom-4 right-4 z-40 flex items-end gap-3">
                <button
                    onClick={() => handlePrint && handlePrint()}
                    className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all border border-indigo-500 flex items-center gap-2 pr-5"
                    title="Save as PDF (Print)"
                >
                    <Printer size={20} />
                    <span className="font-semibold text-sm">Save/Print PDF</span>
                </button>

                {data && (
                    <div style={{ display: 'none' }}>
                        <ResumePrint ref={componentRef} data={data} />
                    </div>
                )}

                {!isAdmin && (
                    <button
                        onClick={() => setShowLogin(true)}
                        className="p-3 rounded-full bg-white text-gray-400 shadow-lg hover:text-gray-800 hover:shadow-xl transition-all border border-gray-100"
                        title="Admin Login"
                    >
                        <Lock size={20} />
                    </button>
                )}
            </div>

            <header className="glass-card m-4 mb-0 p-6 flex flex-col md:flex-row items-center gap-6 sticky top-4 z-30 shrink-0">
                <div className="relative group shrink-0">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}>
                        <img
                            src={data.profile.image_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {isEditing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>

                <div className="text-center md:text-left flex-1">
                    <EditableText
                        value={data.profile.name}
                        onChange={(v) => updateProfile('name', v)}
                        isEditing={isEditing}
                        tag="h1"
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700"
                    />
                    <EditableText
                        value={data.profile.title}
                        onChange={(v) => updateProfile('title', v)}
                        isEditing={isEditing}
                        tag="p"
                        className="text-orange-600 font-medium"
                    />
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-4 md:mt-0 max-w-xl">
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        <Mail size={14} /> {data.profile.email}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
                <article className="max-w-7xl mx-auto flex flex-col gap-6">
                    <section className="glass-card p-5">
                        <h3 className="text-lg font-bold text-slate-700 border-l-4 border-blue-500 pl-2 mb-3">Professional Summary</h3>
                        <EditableText value={data.profile.summary} onChange={(v) => updateProfile('summary', v)} isEditing={isEditing} multiline className="text-gray-600 leading-relaxed" />
                    </section>

                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-700 border-l-4 border-indigo-500 pl-2">Technical Skills</h3>
                            {isEditing && <button onClick={addSkillCategory} className="btn-secondary text-xs py-1 px-2"><Plus size={12} /> Add Category</button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(data.skills).map(([category, skills], idx) => (
                                <div key={idx} className="bg-white/50 rounded-xl p-4 border border-indigo-50/50">
                                    <div className="flex justify-between items-center mb-3">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input className="font-bold text-indigo-700 bg-transparent border-b border-indigo-200 outline-none w-full" defaultValue={category} onBlur={(e) => renameSkillCategory(category, e.target.value)} />
                                                <button onClick={() => removeSkillCategory(category)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <h4 className="font-bold text-indigo-700">{category}</h4>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, i) => (
                                            <span key={i} className="bg-white border border-indigo-100 text-slate-600 px-2 py-1 rounded text-xs shadow-sm flex items-center gap-1 group">
                                                {isEditing ? (
                                                    <>
                                                        <input className="bg-transparent w-full min-w-[30px] outline-none" value={skill} onChange={(e) => updateSkills(category, i, e.target.value)} />
                                                        <button onClick={() => {
                                                            const newSkills = [...skills];
                                                            newSkills.splice(i, 1);
                                                            const newData = { ...data.skills, [category]: newSkills };
                                                            setData({ ...data, skills: newData });
                                                        }} className="hidden group-hover:block text-red-500"><X size={10} /></button>
                                                    </>
                                                ) : skill}
                                            </span>
                                        ))}
                                        {isEditing && <button onClick={() => {
                                            const newSkills = [...skills, "New Skill"];
                                            setData({ ...data, skills: { ...data.skills, [category]: newSkills } });
                                        }} className="text-indigo-400 hover:text-indigo-600"><Plus size={14} /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    {/* Experience */}
                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-700 border-l-4 border-purple-500 pl-2">Professional Experience</h3>
                            {isEditing && <button onClick={addExperience} className="btn-secondary text-xs py-1 px-2"><Plus size={12} /> Add</button>}
                        </div>
                        <div className="flex flex-col gap-6 relative">
                            {/* Line connecting items */}
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 hidden md:block"></div>

                            {data.experience.map((exp, index) => (
                                <div key={index} className="relative pl-0 md:pl-12 group">
                                    {/* Timeline Dot */}
                                    <div className="hidden md:flex absolute left-0 top-1.5 w-10 h-10 bg-white border-2 border-purple-100 rounded-full items-center justify-center shrink-0 z-10 group-hover:border-purple-300 transition-colors">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    </div>

                                    <div className={`glass-card p-4 transition-all hover:shadow-md ${expandedExperience === index ? 'ring-2 ring-purple-100' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <EditableText value={exp.role} onChange={(v) => updateExperience(index, 'role', v)} isEditing={isEditing} className="font-bold text-lg text-slate-800" />
                                                <EditableText value={exp.company} onChange={(v) => updateExperience(index, 'company', v)} isEditing={isEditing} className="text-purple-600 font-medium" />
                                            </div>
                                            {isEditing && <button onClick={() => removeExperience(index)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>}
                                        </div>
                                        <EditableText value={exp.duration} onChange={(v) => updateExperience(index, 'duration', v)} isEditing={isEditing} className="text-sm text-slate-500 mb-3 block" />

                                        {/* Description with Expand/Collapse for better UI */}
                                        <div className="relative">
                                            <div className={`text-slate-600 leading-relaxed ${expandedExperience === index ? '' : 'line-clamp-3'}`}>
                                                <EditableText value={exp.description} onChange={(v) => updateExperience(index, 'description', v)} isEditing={isEditing} multiline />
                                            </div>
                                            {(exp.description.length > 150 || isEditing) && (
                                                <button
                                                    onClick={() => setExpandedExperience(expandedExperience === index ? null : index)}
                                                    className="text-xs text-purple-500 hover:text-purple-700 mt-1 font-medium flex items-center gap-1"
                                                >
                                                    {expandedExperience === index ? 'Show Less' : 'Show More'} <ChevronRight size={12} className={`transition-transform ${expandedExperience === index ? 'rotate-90' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-700 border-l-4 border-orange-500 pl-2">Featured Projects</h3>
                            {isEditing && <button onClick={addProject} className="btn-secondary text-xs py-1 px-2"><Plus size={12} /> Add</button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.projects.map((proj, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-slate-100 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <EditableText value={proj.title} onChange={(v) => updateProject(index, 'title', v)} isEditing={isEditing} className="font-bold text-lg text-slate-800" />
                                        {isEditing && <button onClick={() => removeProject(index)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                                    </div>

                                    <div className="mb-3">
                                        {isEditing ? (
                                            <input
                                                className="w-full text-xs border-b border-orange-200 outline-none py-1 text-slate-500"
                                                value={proj.technologies.join(', ')}
                                                onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                                                placeholder="Tech stack (comma separated)"
                                            />
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {proj.technologies.map((tech, t) => (
                                                    <span key={t} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">{tech}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 text-sm text-slate-600 mb-4">
                                        <EditableText value={proj.description} onChange={(v) => updateProject(index, 'description', v)} isEditing={isEditing} multiline className="line-clamp-4" />
                                    </div>

                                    {/* Project Responsibilities (Hidden by default, expandable) */}
                                    <div className="mt-auto border-t border-slate-50 pt-3">
                                        <button
                                            onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                                            className="text-xs text-slate-400 hover:text-orange-500 flex items-center gap-1 w-full justify-center transition-colors"
                                        >
                                            {expandedProject === index ? 'Hide Details' : 'View Responsibilities'} <ChevronRight size={12} className={`transition-transform ${expandedProject === index ? 'rotate-90' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {expandedProject === index && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="pt-2 text-xs text-slate-500 italic">
                                                        <EditableText
                                                            value={proj.responsibilities || "Add responsibilities..."}
                                                            onChange={(v) => updateProject(index, 'responsibilities', v)}
                                                            isEditing={isEditing}
                                                            multiline
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Education */}
                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-700 border-l-4 border-green-500 pl-2">Education</h3>
                            {isEditing && <button onClick={addEducation} className="btn-secondary text-xs py-1 px-2"><Plus size={12} /> Add</button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.education && data.education.map((edu, index) => (
                                <div key={index} className="bg-green-50/50 p-4 rounded-lg border border-green-100 relative group">
                                    {isEditing && <button onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>}
                                    <EditableText value={edu.degree} onChange={(v) => updateEducation(index, 'degree', v)} isEditing={isEditing} className="font-bold text-slate-800 block mb-1" />
                                    <EditableText value={edu.institution} onChange={(v) => updateEducation(index, 'institution', v)} isEditing={isEditing} className="text-sm text-green-700 block mb-1" />
                                    <EditableText value={edu.year} onChange={(v) => updateEducation(index, 'year', v)} isEditing={isEditing} className="text-xs text-slate-500" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Personal & Documents (View Only / Admin) */}
                    <section className="glass-card p-5">
                        <h3 className="text-lg font-bold text-slate-700 border-l-4 border-gray-500 pl-2 mb-4">Personal Details & Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                    <span className="text-sm font-medium text-slate-600">Date of Birth</span>
                                    <EditableText value={data.profile.dob || ''} onChange={(v) => updateProfile('dob', v)} isEditing={isEditing} className="text-sm text-slate-800 font-bold" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                    <span className="text-sm font-medium text-slate-600">Location</span>
                                    <EditableText value={data.profile.location} onChange={(v) => updateProfile('location', v)} isEditing={isEditing} className="text-sm text-slate-800 font-bold" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {/* PAN & Aadhaar - Only visible if editing or value exists */}
                                {(isEditing || data.profile.pan) && (
                                    <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                        <span className="text-sm font-medium text-slate-600">PAN Number</span>
                                        <EditableText value={data.profile.pan || ''} onChange={(v) => updateProfile('pan', v)} isEditing={isEditing} className="text-sm text-slate-800 font-bold font-mono" />
                                    </div>
                                )}
                                {(isEditing || (data.profile.aadhaar || '')) && (
                                    <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                        <span className="text-sm font-medium text-slate-600">Aadhaar</span>
                                        <EditableText value={data.profile.aadhaar || ''} onChange={(v) => updateProfile('aadhaar', v)} isEditing={isEditing} className="text-sm text-slate-800 font-bold font-mono" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                </article>
            </main>
        </div>
    )
}

export default App
