import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Image } from '@react-pdf/renderer';
import { Profile, Experience, Project } from '../types';

// Register standard fonts
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        paddingBottom: 30,
    },
    // HEADER SECTION
    header: {
        backgroundColor: '#1e293b', // Slate-800
        paddingVertical: 20,
        paddingHorizontal: 30,
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
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    title: {
        fontSize: 12,
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
        fontSize: 8,
        color: '#cbd5e1',
        marginRight: 10,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        objectFit: 'cover',
        borderWidth: 2,
        borderColor: 'white',
    },
    // MAIN LAYOUT
    mainContainer: {
        paddingVertical: 20,
        paddingHorizontal: 30,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e293b', // Slate-800
        textTransform: 'uppercase',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 2,
    },
    // Skills Grid
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    skillCategoryBlock: {
        width: '48%', // 2 Columns for skills to save space but keep readability
        marginBottom: 12,
        paddingRight: 4,
    },
    skillTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#ea580c', // Orange-600
        marginBottom: 4,
    },
    skillBadge: {
        fontSize: 8,
        color: '#475569',
        backgroundColor: '#f1f5f9', // Slate-100
        padding: '2 4',
        marginBottom: 3,
        marginRight: 3,
        borderRadius: 2,
    },
    // Items
    text: {
        fontSize: 9,
        color: '#334155',
        lineHeight: 1.5,
        textAlign: 'justify',
        marginBottom: 4,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    itemSubtitle: {
        fontSize: 9,
        color: '#ea580c', // Orange-600
        fontWeight: 'medium',
        marginBottom: 2,
    },
    itemDate: {
        fontSize: 8,
        color: '#64748b',
        fontStyle: 'italic',
    },
    // Personal Info Row
    personalRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
    },
    personalItem: {
        fontSize: 9,
        color: '#475569',
    }
});

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
            {/* HEADER */}
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
                        {data.profile.linkedin && <Text style={styles.contactItem}>In: {data.profile.linkedin.replace(/^https?:\/\//, '').replace('linkedin.com/in/', '').replace('www.', '')}</Text>}
                        {data.profile.github && <Text style={styles.contactItem}>Gh: {data.profile.github.replace(/^https?:\/\//, '').replace('github.com/', '')}</Text>}
                    </View>
                </View>
            </View>

            <View style={styles.mainContainer}>

                {/* SUMMARY */}
                {data.profile.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.text}>{data.profile.summary}</Text>
                    </View>
                )}

                {/* PERSONAL INFO (Compact Row) */}
                <View style={styles.personalRow}>
                    {data.profile.dob && <Text style={styles.personalItem}>DOB: {formatDOB(data.profile.dob)}</Text>}
                    {data.profile.pan && <Text style={styles.personalItem}>PAN: {data.profile.pan}</Text>}
                    {/* Add Aadhaar if needed, kept hidden or compact */}
                </View>

                {/* SKILLS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Technical Skills</Text>
                    <View style={styles.skillsGrid}>
                        {Object.entries(data.skills).map(([category, skills]) => (
                            <View key={category} style={styles.skillCategoryBlock} break={false}>
                                <Text style={styles.skillTitle}>{category}</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                    {skills.map((skill, idx) => (
                                        <Text key={idx} style={styles.skillBadge}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* EXPERIENCE */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Experience</Text>
                    {data.experience.map((exp, index) => (
                        <View key={index} style={{ marginBottom: 12 }} break={index > 0}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemTitle}>{exp.role}</Text>
                                <Text style={styles.itemDate}>{exp.duration}</Text>
                            </View>
                            <Text style={styles.itemSubtitle}>{exp.company}</Text>
                            <Text style={styles.text}>{exp.description}</Text>
                        </View>
                    ))}
                </View>

                {/* PROJECTS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Featured Projects</Text>
                    {data.projects.map((proj, index) => (
                        <View key={index} style={{ marginBottom: 12 }} break={index > 0}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemTitle}>{proj.title}</Text>
                            </View>
                            <Text style={{ fontSize: 8, color: '#64748b', fontStyle: 'italic', marginBottom: 2 }}>
                                Tech: {proj.technologies.join(' • ')}
                            </Text>
                            <Text style={styles.text}>{proj.description}</Text>
                            {proj.responsibilities && (
                                <Text style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>
                                    • {proj.responsibilities}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* EDUCATION */}
                {data.education && (
                    <View style={styles.section} break={false}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((edu, idx) => (
                            <View key={idx} style={{ marginBottom: 8 }}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                                    <Text style={styles.itemDate}>{edu.year}</Text>
                                </View>
                                <Text style={{ fontSize: 9, color: '#64748b' }}>{edu.institution}</Text>
                            </View>
                        ))}
                    </View>
                )}

            </View>
        </Page>
    </Document>
);

export default ResumePDF;
