import { jsPDF } from 'jspdf';
import { ResumeData } from './types';

export const generateClassicPDF = (data: ResumeData) => {
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
    let contactInfo = `${data.profile.email} | ${data.profile.phone} | ${data.profile.location}`;
    if (data.profile.linkedin) {
        const cleanLinkedin = data.profile.linkedin.replace(/^https?:\/\//, '');
        contactInfo += ` | ${cleanLinkedin}`;
    }
    if (data.profile.github) {
        const cleanGithub = data.profile.github.replace(/^https?:\/\//, '');
        contactInfo += ` | ${cleanGithub}`;
    }
    doc.text(contactInfo, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    const personalIds = [];
    if (data.profile.pan) personalIds.push(`PAN: ${data.profile.pan}`);
    if (data.profile.aadhaar) personalIds.push(`Aadhaar: ${data.profile.aadhaar}`);

    if (data.profile.dob) {
        personalIds.push(`DOB: ${data.profile.dob}`);
    }

    if (personalIds.length > 0) {
        doc.text(personalIds.join(" | "), pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
    } else {
        yPos += 5;
    }

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

    if (data.experience && data.experience.length > 0) {
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
            doc.setTextColor(50, 50, 150);
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

    if (data.projects && data.projects.length > 0) {
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

    if (data.education && data.education.length > 0) {
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

    doc.save(`${data.profile.name}_Resume_Classic.pdf`);
};

export const generateModernPDF = (data: ResumeData) => {
    const doc = new jsPDF();
    const leftMargin = 15;
    const rightMargin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Define sidebar width (left column)
    const sidebarWidth = 65;
    const mainContentStart = leftMargin + sidebarWidth + 10;
    const mainContentWidth = pageWidth - mainContentStart - rightMargin;

    let mainYPos = 20;
    let sideYPos = 20;

    const checkPageBreak = (height: number, isSidebar: boolean = false) => {
        const currentY = isSidebar ? sideYPos : mainYPos;
        if (currentY + height > pageHeight - 20) {
            doc.addPage();
            mainYPos = 20;
            sideYPos = 20;

            // Redraw sidebar background on new page
            doc.setFillColor(45, 55, 72); // Dark blue-gray
            doc.rect(0, 0, sidebarWidth + leftMargin, pageHeight, 'F');
        }
    };

    // Sidebar Background (Full height)
    doc.setFillColor(45, 55, 72); // Dark blue-gray
    doc.rect(0, 0, sidebarWidth + leftMargin, pageHeight, 'F');

    // === MAIN CONTENT (Right Side) ===
    // Header - Name and Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(data.profile.name, mainContentStart, mainYPos);
    mainYPos += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(data.profile.title, mainContentStart, mainYPos);
    mainYPos += 15;

    // About Me
    if (data.profile.summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text("ABOUT ME", mainContentStart, mainYPos);
        mainYPos += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(data.profile.summary, mainContentWidth);
        checkPageBreak(lines.length * 5);
        doc.text(lines, mainContentStart, mainYPos);
        mainYPos += lines.length * 5 + 12;
    }

    // Professional Experience
    if (data.experience && data.experience.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text("EXPERIENCE", mainContentStart, mainYPos);
        mainYPos += 7;

        data.experience.forEach(exp => {
            checkPageBreak(35);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(exp.role, mainContentStart, mainYPos);
            mainYPos += 5;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(37, 99, 235);
            doc.text(exp.company, mainContentStart, mainYPos);

            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.text(exp.duration, pageWidth - rightMargin, mainYPos, { align: 'right' });
            mainYPos += 6;

            if (exp.description) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                const lines = doc.splitTextToSize(exp.description, mainContentWidth);
                checkPageBreak(lines.length * 4);
                doc.text(lines, mainContentStart, mainYPos);
                mainYPos += lines.length * 4 + 8;
            } else {
                mainYPos += 6;
            }
        });
        mainYPos += 5;
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text("PROJECTS", mainContentStart, mainYPos);
        mainYPos += 7;

        data.projects.forEach(proj => {
            checkPageBreak(30);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(proj.title, mainContentStart, mainYPos);
            mainYPos += 5;

            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(37, 99, 235);
            doc.text(proj.technologies.join(", "), mainContentStart, mainYPos);
            mainYPos += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            const lines = doc.splitTextToSize(proj.description, mainContentWidth);
            checkPageBreak(lines.length * 4);
            doc.text(lines, mainContentStart, mainYPos);
            mainYPos += lines.length * 4;

            if (proj.responsibilities) {
                mainYPos += 3;
                const respLines = doc.splitTextToSize(proj.responsibilities, mainContentWidth);
                checkPageBreak(respLines.length * 4);
                doc.text(respLines, mainContentStart, mainYPos);
                mainYPos += respLines.length * 4 + 8;
            } else {
                mainYPos += 8;
            }
        });
    }

    // Education
    if (data.education && data.education.length > 0) {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text("EDUCATION", mainContentStart, mainYPos);
        mainYPos += 7;

        data.education.forEach(edu => {
            checkPageBreak(15);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(edu.degree, mainContentStart, mainYPos);
            mainYPos += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(edu.institution, mainContentStart, mainYPos);

            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.text(edu.year, pageWidth - rightMargin, mainYPos, { align: 'right' });
            mainYPos += 10;
        });
    }

    // === SIDEBAR CONTENT (Left Side) ===
    // Add padding to sidebar content
    const sideContentMargin = leftMargin + 5;
    const sideContentWidth = sidebarWidth - 10;

    // Contact Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("CONTACT", sideContentMargin, sideYPos);
    sideYPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(220, 220, 220);

    // Email
    const emailLines = doc.splitTextToSize(data.profile.email, sideContentWidth);
    doc.text(emailLines, sideContentMargin, sideYPos);
    sideYPos += emailLines.length * 4 + 3;

    // Phone
    doc.text(data.profile.phone, sideContentMargin, sideYPos);
    sideYPos += 7;

    // Location
    if (data.profile.location) {
        const locLines = doc.splitTextToSize(data.profile.location, sideContentWidth);
        doc.text(locLines, sideContentMargin, sideYPos);
        sideYPos += locLines.length * 4 + 10;
    }

    // LinkedIn
    if (data.profile.linkedin) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("LinkedIn", sideContentMargin, sideYPos);
        sideYPos += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(220, 220, 220);
        const linkedinClean = data.profile.linkedin.replace(/^https?:\/\//, '');
        const linkedinLines = doc.splitTextToSize(linkedinClean, sideContentWidth);
        doc.text(linkedinLines, sideContentMargin, sideYPos);
        sideYPos += linkedinLines.length * 3.5 + 8;
    }

    // GitHub
    if (data.profile.github) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("GitHub", sideContentMargin, sideYPos);
        sideYPos += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(220, 220, 220);
        const githubClean = data.profile.github.replace(/^https?:\/\//, '');
        const githubLines = doc.splitTextToSize(githubClean, sideContentWidth);
        doc.text(githubLines, sideContentMargin, sideYPos);
        sideYPos += githubLines.length * 3.5 + 8;
    }

    // Skills
    if (data.skills && Object.keys(data.skills).length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("SKILLS", sideContentMargin, sideYPos);
        sideYPos += 8;

        Object.entries(data.skills).forEach(([category, skills]) => {
            checkPageBreak(20, true);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(200, 220, 255);
            doc.text(category, sideContentMargin, sideYPos);
            sideYPos += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(220, 220, 220);

            skills.forEach(skill => {
                const skillLines = doc.splitTextToSize(`• ${skill}`, sideContentWidth);
                checkPageBreak(skillLines.length * 4, true);
                doc.text(skillLines, sideContentMargin, sideYPos);
                sideYPos += skillLines.length * 4;
            });
            sideYPos += 5;
        });
    }

    // Personal IDs
    if (data.profile.pan || data.profile.aadhaar || data.profile.dob) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("PERSONAL", sideContentMargin, sideYPos);
        sideYPos += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(220, 220, 220);

        if (data.profile.dob) {
            doc.text(`DOB: ${data.profile.dob}`, sideContentMargin, sideYPos);
            sideYPos += 5;
        }

        if (data.profile.pan) {
            const panLines = doc.splitTextToSize(`PAN: ${data.profile.pan}`, sideContentWidth);
            doc.text(panLines, sideContentMargin, sideYPos);
            sideYPos += panLines.length * 4 + 3;
        }

        if (data.profile.aadhaar) {
            doc.text(`Aadhaar: ${data.profile.aadhaar}`, sideContentMargin, sideYPos);
            sideYPos += 5;
        }
    }

    doc.save(`${data.profile.name}_Resume_Modern.pdf`);
};
