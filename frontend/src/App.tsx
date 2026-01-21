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
                </article>
            </main>
        </div>
    )
}

export default App
