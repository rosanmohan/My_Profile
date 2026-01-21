import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Image } from '@react-pdf/renderer';
import { Profile, Experience, Project } from '../types';

// Register standard fonts
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        paddingBottom: 30, // Footer space
    },
    // HEADER SECTION
    header: {
        backgroundColor: '#1e293b', // Slate-800
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        color: 'white',
        borderBottomWidth: 4,
        borderBottomColor: '#f97316', // Orange-500
    },
    headerContent: {
        marginLeft: 20,
        flex: 1,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        color: '#fdba74', // Orange-300
        marginBottom: 8,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    contactItem: {
        fontSize: 9,
        color: '#cbd5e1',
        marginRight: 10,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        objectFit: 'cover',
        borderWidth: 2,
        borderColor: 'white',
    },
    // MAIN LAYOUT
    columnsContainer: {
        flexDirection: 'row',
        padding: 24,
        flex: 1,
    },
    // LEFT COLUMN (Small)
    leftColumn: {
        width: '32%',
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    // RIGHT COLUMN (Large)
    rightColumn: {
        width: '68%',
        paddingLeft: 16,
    },
    // SECTIONS
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#334155', // Slate-700
        textTransform: 'uppercase',
        marginBottom: 8,
        marginTop: 16, // Spacing before section
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 2,
    },
    // Left Col Items
    skillCategory: {
        marginBottom: 10,
    },
    skillTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ea580c', // Orange-600
        marginBottom: 4,
    },
    skillBadge: {
        fontSize: 9,
        color: '#475569',
        backgroundColor: '#f1f5f9',
        padding: '2 4',
        marginBottom: 2,
        borderRadius: 2,
    },
    educationItem: {
        marginBottom: 10,
    },
    // Right Col Items
    text: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.5,
        textAlign: 'justify',
        marginBottom: 8,
    },
    expItem: {
        marginBottom: 14,
    },
    expHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    expRole: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    expDate: {
        fontSize: 9,
        color: '#64748b',
        fontStyle: 'italic',
    },
    expCompany: {
        fontSize: 10,
        color: '#ea580c', // Orange-600
        fontWeight: 'medium',
        marginBottom: 4,
    },
    // Project
    projectItem: {
        marginBottom: 12,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    projectTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    projectTech: {
        fontSize: 9,
        color: '#64748b',
        fontStyle: 'italic',
        marginBottom: 4,
    }
});

const formatDate = (raw: string | undefined) => {
    if (!raw) return "";
    const dateMatch = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[month - 1]} ${year}`; // Simpler date format for clean look
    }
    return raw;
};

// FULL DATE for DOB
const formatDOB = (raw: string | undefined) => {
    if (!raw) return "";
    const dateMatch = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const getSuffix = (d: number) => { if (d > 3 && d < 21) return 'th'; switch (d % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; } };
        return `${day}${getSuffix(day)} ${months[month - 1]} ${year}`;
    }
    return raw;
};

interface ResumePDFProps {
    data: {
        profile: Profile;
        skills: Record<string, string[]>;
        experience: Experience[];
        projects: Project[];
        education?: { degree: string; institution: string; year: string }[];
    };
}

const ResumePDF: React.FC<ResumePDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* HEADER (Full Width) */}
            <View style={styles.header}>
                {data.profile.image_url && data.profile.image_url.startsWith('data:') && (
                    <Image src={data.profile.image_url} style={styles.profileImage} />
                )}
                <View style={styles.headerContent}>
                    <Text style={styles.name}>{data.profile.name}</Text>
                    <Text style={styles.title}>{data.profile.title}</Text>
                    <View style={styles.contactRow}>
                        <Text style={styles.contactItem}>{data.profile.email}</Text>
                        <Text style={styles.contactItem}>{data.profile.phone}</Text>
                        <Text style={styles.contactItem}>{data.profile.location}</Text>
                        {data.profile.github && <Text style={styles.contactItem}>github.com/{data.profile.github.replace(/^https?:\/\//, '').replace('github.com/', '')}</Text>}
                        {data.profile.linkedin && <Text style={styles.contactItem}>linkedin.com/in/{data.profile.linkedin.replace(/^https?:\/\//, '').replace('linkedin.com/in/', '').replace('www.', '')}</Text>}
                    </View>
                </View>
            </View>

            <View style={styles.columnsContainer}>
                {/* LEFT COLUMN: Skills, Education, Personal */}
                <View style={styles.leftColumn}>
                    {/* SKILLS */}
                    <Text style={{ ...styles.sectionTitle, marginTop: 0 }}>Technical Skills</Text>
                    {Object.entries(data.skills).map(([category, skills]) => (
                        <View key={category} style={styles.skillCategory}>
                            <Text style={styles.skillTitle}>{category}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                {skills.map((skill, idx) => (
                                    <Text key={idx} style={styles.skillBadge}>{skill}</Text>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* EDUCATION */}
                    {data.education && (
                        <>
                            <Text style={styles.sectionTitle}>Education</Text>
                            {data.education.map((edu, idx) => (
                                <View key={idx} style={styles.educationItem}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{edu.degree}</Text>
                                    <Text style={{ fontSize: 9, color: '#64748b' }}>{edu.institution}</Text>
                                    <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#94a3b8' }}>{edu.year}</Text>
                                </View>
                            ))}
                        </>
                    )}

                    {/* PERSONAL */}
                    <Text style={styles.sectionTitle}>Personal</Text>
                    {data.profile.dob && <Text style={{ fontSize: 9, marginBottom: 2 }}>DOB: {formatDOB(data.profile.dob)}</Text>}
                    {data.profile.pan && <Text style={{ fontSize: 9, marginBottom: 2 }}>PAN: {data.profile.pan}</Text>}
                </View>

                {/* RIGHT COLUMN: Experience, Projects */}
                <View style={styles.rightColumn}>
                    {/* SUMMARY */}
                    <Text style={{ ...styles.sectionTitle, marginTop: 0 }}>Professional Summary</Text>
                    <Text style={styles.text}>{data.profile.summary}</Text>

                    {/* EXPERIENCE */}
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {data.experience.map((exp, index) => (
                        <View key={index} style={styles.expItem} break={index > 0}>
                            <View style={styles.expHeader}>
                                <Text style={styles.expRole}>{exp.role}</Text>
                                <Text style={styles.expDate}>{exp.duration}</Text>
                            </View>
                            <Text style={styles.expCompany}>{exp.company}</Text>
                            <Text style={styles.text}>{exp.description}</Text>
                        </View>
                    ))}

                    {/* PROJECTS */}
                    <Text style={styles.sectionTitle}>Projects</Text>
                    {data.projects.map((proj, index) => (
                        <View key={index} style={styles.projectItem} break={index > 0}>
                            <View style={styles.projectHeader}>
                                <Text style={styles.projectTitle}>{proj.title}</Text>
                            </View>
                            <Text style={styles.projectTech}>{proj.technologies.join(' • ')}</Text>
                            <Text style={styles.text}>{proj.description}</Text>
                            {proj.responsibilities && (
                                <Text style={{ fontSize: 9, color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>• {proj.responsibilities}</Text>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    </Document>
);

export default ResumePDF;
