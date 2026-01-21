import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Image } from '@react-pdf/renderer';
import { Profile, Experience, Project } from '../types';

// Register a nice font (optional, using standard Helvetica for reliability first)
// Font.register({ family: 'Open Sans', src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    sidebar: {
        width: '30%',
        backgroundColor: '#2d3748', // Dark gray/blue like slate-800
        color: 'white',
        padding: 20,
        height: '100%',
    },
    main: {
        width: '70%',
        padding: 24,
        paddingTop: 30,
    },
    // Sidebar items
    sidebarTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fb923c', // Orange-400
        textTransform: 'uppercase',
        borderBottom: '1 solid #4a5568',
        paddingBottom: 4,
    },
    sidebarText: {
        fontSize: 9,
        marginBottom: 4,
        lineHeight: 1.4,
        color: '#e2e8f0',
    },
    sidebarSection: {
        marginBottom: 20,
    },
    skillBadge: {
        backgroundColor: '#4a5568',
        padding: '3 6',
        marginBottom: 4,
        marginRight: 4,
        borderRadius: 4,
        fontSize: 8,
    },
    // Main Content Items
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1a202c',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 14,
        color: '#dd6b20', // Orange-600
        marginBottom: 16,
        fontWeight: 'medium',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        color: '#2d3748',
        textTransform: 'uppercase',
        borderBottom: '2 solid #e2e8f0',
        paddingBottom: 4,
    },
    text: {
        fontSize: 10,
        marginBottom: 6,
        lineHeight: 1.4,
        color: '#4a5568',
        textAlign: 'justify'
    },
    // Experience Item
    expItem: {
        marginBottom: 12,
    },
    expRole: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1a202c',
    },
    expCompany: {
        fontSize: 10,
        color: '#dd6b20',
        marginBottom: 2,
    },
    expDate: {
        fontSize: 9,
        color: '#718096',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    // Project Item
    projItem: {
        marginBottom: 12,
    },
    projTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1a202c',
    },
    projTech: {
        fontSize: 9,
        color: '#718096',
        fontStyle: 'italic',
        marginBottom: 3,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        alignSelf: 'center',
        objectFit: 'cover',
    }
});

// Helper to format date
const formatDate = (raw: string | undefined) => {
    if (!raw) return "";
    const dateMatch = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const getSuffix = (d: number) => {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
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
    };
}

const ResumePDF: React.FC<ResumePDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* LEFT SIDEBAR */}
            <View style={styles.sidebar}>
                {/* Profile Image (if valid URL/Base64) */}
                {data.profile.image_url && data.profile.image_url.startsWith('data:') && (
                    <Image src={data.profile.image_url} style={styles.profileImage} />
                )}

                <View style={styles.sidebarSection}>
                    <Text style={styles.sidebarTitle}>Contact</Text>
                    <Text style={styles.sidebarText}>{data.profile.email}</Text>
                    <Text style={styles.sidebarText}>{data.profile.phone}</Text>
                    <Text style={styles.sidebarText}>{data.profile.location}</Text>
                    {data.profile.github && (
                        <Link src={data.profile.github} style={{ ...styles.sidebarText, textDecoration: 'none' }}>
                            {data.profile.github.replace(/^https?:\/\//, '')}
                        </Link>
                    )}
                </View>

                {/* Personal Details */}
                <View style={styles.sidebarSection}>
                    <Text style={styles.sidebarTitle}>Personal</Text>
                    {data.profile.dob && <Text style={styles.sidebarText}>DOB: {formatDate(data.profile.dob)}</Text>}
                    {/* PAN/Aadhaar usually private, maybe skip or include per preference. Including small if user wants. */}
                    {data.profile.pan && <Text style={styles.sidebarText}>PAN: {data.profile.pan}</Text>}
                    {/* Aadhaar might be too long/private for visual sidebar, keeping it minimal */}
                </View>

                {/* Skills in Sidebar */}
                <View style={styles.sidebarSection}>
                    <Text style={styles.sidebarTitle}>Skills</Text>
                    {Object.entries(data.skills).map(([category, skills]) => (
                        <View key={category} style={{ marginBottom: 10 }}>
                            <Text style={{ ...styles.sidebarText, fontWeight: 'bold', color: '#fb923c' }}>{category}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {skills.map((skill, idx) => (
                                    <Text key={idx} style={styles.skillBadge}>{skill}</Text>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* MAIN CONTENT Area */}
            <View style={styles.main}>
                <Text style={styles.name}>{data.profile.name}</Text>
                <Text style={styles.title}>{data.profile.title}</Text>

                {/* Summary */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>{data.profile.summary}</Text>
                </View>

                {/* Experience */}
                <Text style={styles.sectionTitle}>Experience</Text>
                {data.experience.map((exp, index) => (
                    <View key={index} style={styles.expItem}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Text style={styles.expRole}>{exp.role}</Text>
                            <Text style={styles.expDate}>{exp.duration}</Text>
                        </View>
                        <Text style={styles.expCompany}>{exp.company}</Text>
                        <Text style={styles.text}>{exp.description}</Text>
                    </View>
                ))}

                {/* Projects */}
                <Text style={styles.sectionTitle}>Projects</Text>
                {data.projects.map((proj, index) => (
                    <View key={index} style={styles.projItem}>
                        <Text style={styles.projTitle}>{proj.title}</Text>
                        <Text style={styles.projTech}>{proj.technologies.join(', ')}</Text>
                        <Text style={styles.text}>{proj.description}</Text>
                        {proj.responsibilities && (
                            <Text style={{ ...styles.text, fontSize: 9, color: '#718096', marginTop: 2 }}>
                                • {proj.responsibilities}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export default ResumePDF;
