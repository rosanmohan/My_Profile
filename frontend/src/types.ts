export interface Experience {
    role: string;
    company: string;
    duration: string;
    description: string;
}

export interface Project {
    title: string;
    description: string;
    technologies: string[];
    responsibilities?: string;
}

export interface Education {
    degree: string;
    institution: string;
    year: string;
    grade?: string;
}

export interface Profile {
    name: string;
    title: string;
    summary: string;
    email: string;
    phone: string;
    linkedin: string;
    github?: string;
    pan?: string;
    dob?: string;
    location: string;
    image_url?: string;
}

export interface ResumeData {
    profile: Profile;
    experience: Experience[];
    projects: Project[];
    skills: Record<string, string[]>;
    education: Education[];
}
