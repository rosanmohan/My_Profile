import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Save, Plus, Trash2, Mail, Phone, Linkedin, MapPin, X, ChevronRight, Download, Lock, Camera, User, Github, CreditCard, Calendar } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { ResumeData, Experience, Project, Education } from './types'
import { EditableText } from './components/EditableText'

const API_URL = import.meta.env.VITE_API_URL || '/api/resume';

function App() {
    const [data, setData] = useState<ResumeData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState('');

    // State for selected item for Modal view
    const [expandedExperience, setExpandedExperience] = useState<number | null>(null);
    const [expandedProject, setExpandedProject] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
        const session = localStorage.getItem('isAdmin');
        if (session === 'true') setIsAdmin(true);
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
            alert('Invalid password');
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setIsEditing(false);
        localStorage.removeItem('isAdmin');
    };

    const handleSave = async () => {
        if (!data) return;
        try {
            await axios.post(API_URL, data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">Loading...</div>;
    if (!data) return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">Error loading data</div>;

    const updateProfile = (field: keyof typeof data.profile, value: string) => {
        setData({ ...data, profile: { ...data.profile, [field]: value } });
    };

    const updateExperience = (index: number, field: keyof Experience, value: string) => {
        const newExp = [...data.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        setData({ ...data, experience: newExp });
    };

    const addExperience = () => {
        setData({
            ...data,
            experience: [
                { role: 'Role', company: 'Company', duration: 'Duration', description: 'Description' },
                ...data.experience
            ]
        });
        setExpandedExperience(0); // Open the new item in modal
    };

    const removeExperience = (index: number) => {
        const newExp = data.experience.filter((_, i) => i !== index);
        setData({ ...data, experience: newExp });
    };

    const updateProject = (index: number, field: keyof Project, value: string) => {
        const newProj = [...data.projects];
        if (field === 'technologies') {
            const techs = value.split(',').map(t => t.trim());
            newProj[index] = { ...newProj[index], technologies: techs };
        } else {
            newProj[index] = { ...newProj[index], [field]: value };
        }
        setData({ ...data, projects: newProj });
    };

    const addProject = () => {
        const newProj: Project = {
            title: 'New Project',
            description: 'Project description...',
            technologies: ['Tech1'],
            responsibilities: '- Responsibility 1'
        };
        setData({ ...data, projects: [newProj, ...data.projects] });
        setExpandedProject(0);
    };

    const removeProject = (index: number) => {
        const newProj = data.projects.filter((_, i) => i !== index);
        setData({ ...data, projects: newProj });
    };

    const updateSkills = (category: string, value: string) => {
        const skillList = value.split(',').map(s => s.trim()).filter(s => s);
        setData({
            ...data,
            skills: {
                ...data.skills,
                [category]: skillList
            }
        });
    };

    const addSkillCategory = () => {
        const name = prompt("Enter new category name:");
        if (name && !data.skills[name]) {
            setData({ ...data, skills: { ...data.skills, [name]: [] } });
        }
    };

    const renameSkillCategory = (oldName: string, newName: string) => {
        if (oldName === newName) return;
        if (data.skills[newName]) {
            alert('Category already exists');
            return;
        }
        // Preserve order
        const entries = Object.entries(data.skills);
        const newSkillsObj: Record<string, string[]> = {};
        entries.forEach(([key, val]) => {
            if (key === oldName) {
                newSkillsObj[newName] = val;
            } else {
                newSkillsObj[key] = val;
            }
        });
        setData({ ...data, skills: newSkillsObj });
    };

    const removeSkillCategory = (category: string) => {
        if (window.confirm(`Delete category "${category}"?`)) {
            const newSkills = { ...data.skills };
            delete newSkills[category];
            setData({ ...data, skills: newSkills });
        }
    };

    const updateEducation = (index: number, field: keyof Education, value: string) => {
        const newEdu = [...data.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setData({ ...data, education: newEdu });
    };

    const addEducation = () => {
        setData({
            ...data,
            education: [...data.education, { degree: 'Degree Name', institution: 'Institution Name', year: 'Year' }]
        });
    };

    const removeEducation = (index: number) => {
        const newEdu = data.education.filter((_, i) => i !== index);
        setData({ ...data, education: newEdu });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateProfile('image_url', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownloadPDF = () => {
        if (!data) return;
        const doc = new jsPDF();

        const margin = 20;
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (margin * 2);

        const checkPageBreak = (height: number) => {
            if (yPos + height > 280) {
                doc.addPage();
                yPos = 20;
            }
        };

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text(data.profile.name, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(data.profile.title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        doc.setFontSize(10);
        doc.text(`${data.profile.email} | ${data.profile.phone} | ${data.profile.location}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        const addSectionTitle = (title: string) => {
            checkPageBreak(15);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(title.toUpperCase(), margin, yPos);
            yPos += 8;
        };

        // Summary
        if (data.profile.summary) {
            addSectionTitle("About Me");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            const lines = doc.splitTextToSize(data.profile.summary, contentWidth);
            checkPageBreak(lines.length * 5);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 10;
        }

        // Skills
        if (data.skills) {
            addSectionTitle("Technical Skills");
            Object.entries(data.skills).forEach(([category, skills]) => {
                checkPageBreak(12);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(40, 40, 40);
                doc.text(`${category}:`, margin, yPos);

                doc.setFont("helvetica", "normal");
                const skillText = skills.join(", ");
                const lines = doc.splitTextToSize(skillText, contentWidth - 40);
                doc.text(lines, margin + 40, yPos);
                yPos += lines.length * 5 + 4;
            });
            yPos += 8;
        }

        // Experience
        if (data.experience) {
            addSectionTitle("Professional Experience");
            data.experience.forEach(exp => {
                checkPageBreak(30);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(exp.role, margin, yPos);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text(exp.duration, pageWidth - margin, yPos, { align: 'right' });
                yPos += 5;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(50, 50, 150); // Blueish
                doc.text(exp.company, margin, yPos);
                yPos += 6;

                if (exp.description) {
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    const lines = doc.splitTextToSize(exp.description, contentWidth);
                    checkPageBreak(lines.length * 5);
                    doc.text(lines, margin, yPos);
                    yPos += lines.length * 5 + 8;
                } else {
                    yPos += 8;
                }
            });
        }

        // Projects
        if (data.projects) {
            addSectionTitle("Featured Projects");
            data.projects.forEach(proj => {
                checkPageBreak(30);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(proj.title, margin, yPos);
                yPos += 5;

                doc.setFont("helvetica", "italic");
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(proj.technologies.join(", "), margin, yPos);
                yPos += 6;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                const lines = doc.splitTextToSize(proj.description, contentWidth);
                checkPageBreak(lines.length * 5);
                doc.text(lines, margin, yPos);
                yPos += lines.length * 5 + 6;

                if (proj.responsibilities) {
                    checkPageBreak(10);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.setTextColor(80, 80, 80);
                    doc.text("Roles & Responsibility:", margin, yPos);
                    yPos += 5;

                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(60, 60, 60);
                    const respLines = doc.splitTextToSize(proj.responsibilities, contentWidth);
                    checkPageBreak(respLines.length * 5);
                    doc.text(respLines, margin, yPos);
                    yPos += respLines.length * 5 + 8;
                } else {
                    yPos += 6;
                }
            });
        }

        // Education
        if (data.education) {
            addSectionTitle("Education");
            data.education.forEach(edu => {
                checkPageBreak(15);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(edu.degree, margin, yPos);
                yPos += 5;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(`${edu.institution} | ${edu.year}`, margin, yPos);
                yPos += 10;
            });
        }

        doc.save("Rosan profile.pdf");
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-800 font-sans lg:h-screen lg:overflow-hidden overflow-auto">
            <AnimatePresence>
                {/* Admin Login Modal */}
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
                                autoFocus
                            />
                            <div className="flex gap-4">
                                <button type="submit" className="btn-primary w-full">Login</button>
                                <button type="button" onClick={() => setShowLogin(false)} className="btn-secondary w-full">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Experience Details Modal */}
                {expandedExperience !== null && data.experience[expandedExperience] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setExpandedExperience(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setExpandedExperience(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-6 pr-10">
                                <EditableText value={data.experience[expandedExperience].role} onChange={(v) => updateExperience(expandedExperience, 'role', v)} isEditing={isEditing} tag="h2" className="text-2xl font-bold text-gray-800" />
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                    <EditableText value={data.experience[expandedExperience].company} onChange={(v) => updateExperience(expandedExperience, 'company', v)} isEditing={isEditing} className="text-blue-600 font-semibold text-lg" />
                                    <span className="hidden sm:inline text-gray-300">•</span>
                                    <EditableText value={data.experience[expandedExperience].duration} onChange={(v) => updateExperience(expandedExperience, 'duration', v)} isEditing={isEditing} className="text-gray-500 font-mono text-sm" />
                                </div>
                            </div>

                            <div className="prose max-w-none">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</h4>
                                <EditableText
                                    value={data.experience[expandedExperience].description}
                                    onChange={(v) => updateExperience(expandedExperience, 'description', v)}
                                    isEditing={isEditing}
                                    multiline
                                    tag="p"
                                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                />
                            </div>

                            {isEditing && (
                                <div className="mt-8 border-t border-gray-100 pt-4 flex justify-end">
                                    <button onClick={() => { setExpandedExperience(null); removeExperience(expandedExperience); }} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} /> Delete Position
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Project Details Modal */}
                {expandedProject !== null && data.projects[expandedProject] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setExpandedProject(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setExpandedProject(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-6 pr-10">
                                <EditableText value={data.projects[expandedProject].title} onChange={(v) => updateProject(expandedProject, 'title', v)} isEditing={isEditing} tag="h2" className="text-2xl font-bold text-gray-800" />
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">About Project</h4>
                                <EditableText value={data.projects[expandedProject].description} onChange={(v) => updateProject(expandedProject, 'description', v)} isEditing={isEditing} multiline tag="p" className="text-gray-700 leading-relaxed whitespace-pre-wrap" />
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Tech Stack</h4>
                                {isEditing ? (
                                    <input
                                        className="input-field w-full"
                                        value={data.projects[expandedProject].technologies.join(', ')}
                                        onChange={(e) => updateProject(expandedProject, 'technologies', e.target.value)}
                                        placeholder="React, TypeScript, Node.js..."
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {data.projects[expandedProject].technologies.map((t, i) => (
                                            <span key={i} className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full">{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Roles & Responsibility</h4>
                                <EditableText
                                    value={data.projects[expandedProject].responsibilities || ''}
                                    onChange={(v) => updateProject(expandedProject, 'responsibilities', v)}
                                    isEditing={isEditing}
                                    multiline
                                    tag="div"
                                    className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap"
                                />
                            </div>

                            {isEditing && (
                                <div className="mt-8 border-t border-gray-100 pt-4 flex justify-end">
                                    <button onClick={() => { setExpandedProject(null); removeProject(expandedProject); }} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} /> Delete Project
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin Controls */}
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

            {/* Fixed Action Buttons (Download & Lock) */}
            <div className="fixed bottom-4 right-4 z-40 flex items-end gap-3">
                <button
                    onClick={handleDownloadPDF}
                    className="p-3 rounded-full bg-white text-gray-600 shadow-lg hover:text-blue-600 hover:shadow-xl transition-all border border-gray-100 flex items-center gap-2 pr-5"
                    title="Download Profile as PDF"
                >
                    <Download size={20} />
                    <span className="font-semibold text-sm">Download</span>
                </button>

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

            {/* HEADER - Fixed Top */}
            <header className="px-6 py-4 glass-card mx-4 mt-4 mb-2 flex flex-col md:flex-row justify-between items-center shadow-sm shrink-0">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Profile Photo */}
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                            {data.profile.image_url ? (
                                <img src={data.profile.image_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={20} className="text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>

                    <div className="text-center md:text-left">
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
                            className="text-gray-800 font-medium"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-4 md:mt-0 max-w-xl">
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors">
                        <Mail size={14} />
                        {isEditing ? (
                            <EditableText value={data.profile.email} onChange={(v) => updateProfile('email', v)} isEditing={true} />
                        ) : (
                            <a href={`mailto:${data.profile.email}`} className="hover:underline truncate max-w-[150px]">
                                {data.profile.email}
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors">
                        <Phone size={14} />
                        <EditableText value={data.profile.phone} onChange={(v) => updateProfile('phone', v)} isEditing={isEditing} />
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors">
                        <MapPin size={14} />
                        <EditableText value={data.profile.location} onChange={(v) => updateProfile('location', v)} isEditing={isEditing} />
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors">
                        <Linkedin size={14} />
                        {isEditing ? (
                            <EditableText value={data.profile.linkedin} onChange={(v) => updateProfile('linkedin', v)} isEditing={true} />
                        ) : (
                            <a href={data.profile.linkedin.startsWith('http') ? data.profile.linkedin : `https://${data.profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                LinkedIn
                            </a>
                        )}
                    </div>

                    {/* New Fields */}
                    {(isEditing || data.profile.github) && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors">
                            <Github size={14} />
                            {isEditing ? (
                                <EditableText value={data.profile.github || 'GitHub URL'} onChange={(v) => updateProfile('github', v)} isEditing={true} />
                            ) : (
                                <a href={data.profile.github?.startsWith('http') ? data.profile.github : `https://${data.profile.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    GitHub
                                </a>
                            )}
                        </div>
                    )}
                    {(isEditing || data.profile.pan) && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors" title="PAN No">
                            <CreditCard size={14} />
                            <EditableText value={data.profile.pan || 'PAN No'} onChange={(v) => updateProfile('pan', v)} isEditing={isEditing} />
                        </div>
                    )}
                    {(isEditing || data.profile.dob) && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors" title="Date of Birth">
                            <Calendar size={14} />
                            <EditableText value={data.profile.dob || 'DOB (YYYY-MM-DD)'} onChange={(v) => updateProfile('dob', v)} isEditing={isEditing} />
                        </div>
                    )}
                </div>
            </header>

            {/* MAIN DASHBOARD CONTENT - Scrollable Grid on Desktop, Stacked on Mobile */}
            <main className="flex-1 p-4 pt-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:overflow-hidden h-auto lg:h-full">

                {/* LEFT COLUMN: Summary, Skills, Education */}
                <aside className="lg:col-span-5 flex flex-col gap-4 lg:overflow-y-auto lg:pr-2 lg:pb-20 scrollbar-hide">
                    {/* Summary Card */}
                    <section className="glass-card p-5">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-black mb-3">About Me</h3>
                        <EditableText
                            value={data.profile.summary}
                            onChange={(v) => updateProfile('summary', v)}
                            isEditing={isEditing}
                            multiline
                            tag="p"
                            className="text-gray-700 leading-relaxed text-sm"
                        />
                    </section>

                    {/* Skills Card */}
                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-black">Technical Skills</h3>
                            {isEditing && <button onClick={addSkillCategory} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors" title="Add Category"><Plus size={14} /></button>}
                        </div>
                        <div className="space-y-4">
                            {Object.entries(data.skills).map(([category, skills]) => (
                                <div key={category} className="relative group">
                                    <div className="flex justify-between items-center mb-2">
                                        <EditableText
                                            value={category}
                                            onChange={(v) => renameSkillCategory(category, v)}
                                            isEditing={isEditing}
                                            tag="h4"
                                            className="text-xs font-semibold text-orange-600"
                                        />
                                        {isEditing && (
                                            <button onClick={() => removeSkillCategory(category)} className="text-red-300 hover:text-red-500 transition-colors p-1">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <textarea
                                            className="w-full text-xs p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[60px]"
                                            value={skills.join(", ")}
                                            onChange={(e) => updateSkills(category, e.target.value)}
                                            placeholder="Skill 1, Skill 2..."
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {skills.map((skill, idx) => (
                                                <span key={idx} className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-xs text-indigo-700">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Education Card */}
                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-black">Education</h3>
                            {isEditing && <button onClick={addEducation} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors" title="Add Education"><Plus size={14} /></button>}
                        </div>
                        <div className="space-y-3">
                            {data.education.map((edu, index) => (
                                <div key={index} className="border-l-2 border-orange-200 pl-3 relative group">
                                    <EditableText value={edu.degree} onChange={(v) => updateEducation(index, 'degree', v)} isEditing={isEditing} tag="h4" className="text-sm font-bold text-gray-800" />
                                    <EditableText value={edu.institution} onChange={(v) => updateEducation(index, 'institution', v)} isEditing={isEditing} tag="p" className="text-xs text-orange-600 font-medium" />
                                    <div className="flex justify-between items-end">
                                        <EditableText value={edu.year} onChange={(v) => updateEducation(index, 'year', v)} isEditing={isEditing} tag="span" className="text-xs text-gray-400" />
                                        {isEditing && (
                                            <button onClick={() => removeEducation(index)} className="text-red-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>

                {/* RIGHT COLUMN: Experience, Projects */}
                <article className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 lg:overflow-y-auto lg:pr-2 lg:pb-20 scrollbar-hide">

                    {/* Experience List (Click to Open Modal) */}
                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-orange-600 border-l-4 border-blue-500 pl-2">Professional Experience</h3>
                            {isEditing && <button onClick={addExperience} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"><Plus size={12} /> Add</button>}
                        </div>
                        <div className="space-y-3">
                            {data.experience.map((exp, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => setExpandedExperience(index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-base">{exp.role}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-blue-600 text-sm font-medium">{exp.company}</span>
                                                <span className="text-gray-400 text-xs">•</span>
                                                <span className="text-xs text-gray-500 font-mono">{exp.duration}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects Grid (Click to Open Modal) */}
                    <section className="glass-card p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-orange-600 border-l-4 border-emerald-500 pl-2">Featured Projects</h3>
                            {isEditing && <button onClick={addProject} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"><Plus size={12} /> Add</button>}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {data.projects.map((proj, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-100 rounded-lg p-4 bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group h-full flex flex-col justify-between"
                                    onClick={() => setExpandedProject(index)}
                                >
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-2">{proj.title}</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {proj.technologies.slice(0, 3).map((t, i) => (
                                                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
                                            ))}
                                            {proj.technologies.length > 3 && <span className="text-[10px] text-gray-400">+{proj.technologies.length - 3}</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
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
