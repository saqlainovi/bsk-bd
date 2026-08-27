import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle2, Upload, FileText, ArrowRight, 
  Printer, User, Phone, MapPin, GraduationCap, Briefcase, 
  Award, ShieldCheck, Sparkles, AlertCircle, Plus, Trash2,
  Calendar, Building2, HelpCircle, Download, ExternalLink, ChevronRight
} from 'lucide-react';
import { cpanelApi } from '../services/cpanelApi';
import { removeUndefinedFields } from '../cpanel-database';
import { JobApplication, Language, EducationRecord, ExperienceRecord, ReferenceRecord, RecruitmentCircular } from '../types';
import OfficialJobApplicationPrintModal from './OfficialJobApplicationPrintModal';

interface JobApplicationPageProps {
  circular?: RecruitmentCircular | null;
  language: Language;
  onNavigate: (tabId: string, extraData?: any) => void;
  onBack?: () => void;
}

export default function JobApplicationPage({
  circular: initialCircular,
  language,
  onNavigate,
  onBack
}: JobApplicationPageProps) {
  const [allCirculars, setAllCirculars] = useState<RecruitmentCircular[]>([]);
  const [selectedCircular, setSelectedCircular] = useState<RecruitmentCircular | null>(initialCircular || null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Load circulars if not passed or to support position switching
  useEffect(() => {
    // Check cache first
    try {
      const cached = localStorage.getItem('cached_recruitment_circulars');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllCirculars(parsed);
          if (!selectedCircular) {
            const activeOnly = parsed.filter((c: any) => c.status !== 'expired');
            if (activeOnly.length > 0) {
              setSelectedCircular(activeOnly[0]);
            } else if (parsed.length > 0) {
              setSelectedCircular(parsed[0]);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Cache load error in JobApplicationPage:", e);
    }

    // Fetch recruitment circulars from cPanel API
    const loadCirculars = async () => {
      try {
        const list = await cpanelApi.getCollection<RecruitmentCircular>('recruitment_circulars');
        if (list && list.length > 0) {
          setAllCirculars(list);
          if (!selectedCircular) {
            const activeOnly = list.filter(c => c.status !== 'expired');
            if (activeOnly.length > 0) {
              setSelectedCircular(activeOnly[0]);
            } else {
              setSelectedCircular(list[0]);
            }
          }
        }
      } catch (err) {
        console.warn("cPanel Database circulars load error:", err);
      }
    };
    loadCirculars();
  }, []);

  // Sync selectedCircular when initialCircular prop changes
  useEffect(() => {
    if (initialCircular) {
      setSelectedCircular(initialCircular);
    }
  }, [initialCircular]);

  // Form State
  const [formData, setFormData] = useState<{
    // 1. Personal
    name_bn: string;
    name_en: string;
    father_name_bn: string;
    father_name_en: string;
    mother_name_bn: string;
    mother_name_en: string;
    spouse_name: string;
    nid_number: string;
    birth_reg_number: string;
    dob: string;
    age_years: string;
    age_months: string;
    age_days: string;
    birth_district: string;
    nationality: string;
    religion: string;
    gender: 'male' | 'female' | 'other';
    marital_status: 'single' | 'married' | 'other';
    quota: string;

    // 2. Address & Contact
    present_village_road: string;
    present_post_office: string;
    present_post_code: string;
    present_upazila: string;
    present_district: string;

    permanent_village_road: string;
    permanent_post_office: string;
    permanent_post_code: string;
    permanent_upazila: string;
    permanent_district: string;
    same_as_present: boolean;

    phone: string;
    emergency_phone: string;
    email: string;

    // 3. Education
    educations: EducationRecord[];

    // 4. Experience & Skills
    experiences: ExperienceRecord[];
    computer_skills: string;
    language_skills: string;
    other_skills: string;
    coverLetter: string;

    // 5. References
    references: ReferenceRecord[];

    // 6. Attachments & Declaration
    photo_url: string;
    signature_url: string;
    resume_url: string;
    resume_name: string;
    resume_type: string;
    declaration_accepted: boolean;
    applicant_place: string;
  }>({
    name_bn: '',
    name_en: '',
    father_name_bn: '',
    father_name_en: '',
    mother_name_bn: '',
    mother_name_en: '',
    spouse_name: '',
    nid_number: '',
    birth_reg_number: '',
    dob: '',
    age_years: '',
    age_months: '',
    age_days: '',
    birth_district: '',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    gender: 'male',
    marital_status: 'single',
    quota: 'general',

    present_village_road: '',
    present_post_office: '',
    present_post_code: '',
    present_upazila: '',
    present_district: '',

    permanent_village_road: '',
    permanent_post_office: '',
    permanent_post_code: '',
    permanent_upazila: '',
    permanent_district: '',
    same_as_present: false,

    phone: '',
    emergency_phone: '',
    email: '',

    educations: [
      { exam: 'এসএসসি / সমমান', groupSubject: '', boardUniversity: '', passingYear: '', resultGpa: '' },
      { exam: 'এইচএসসি / সমমান', groupSubject: '', boardUniversity: '', passingYear: '', resultGpa: '' },
      { exam: 'স্নাতক / সমমান', groupSubject: '', boardUniversity: '', passingYear: '', resultGpa: '' }
    ],

    experiences: [
      { company: '', designation: '', fromYear: '', toYear: '', responsibilities: '' }
    ],
    computer_skills: 'এমএস ওয়ার্ড, এক্সেল, ইন্টারনেট ও ইমেইল পরিচালনায় দক্ষ',
    language_skills: 'বাংলা ও ইংরেজিতে সাবলীল',
    other_skills: '',
    coverLetter: '',

    references: [
      { name: '', designation: '', phone: '', email: '', relation: 'শিক্ষক / কর্মকর্তা' },
      { name: '', designation: '', phone: '', email: '', relation: 'পূর্বতন সুপারভাইজার' }
    ],

    photo_url: '',
    signature_url: '',
    resume_url: '',
    resume_name: '',
    resume_type: '',
    declaration_accepted: false,
    applicant_place: 'ঢাকা'
  });

  // Calculate age when DOB changes
  useEffect(() => {
    if (!formData.dob) return;
    try {
      const birth = new Date(formData.dob);
      const today = new Date();
      if (isNaN(birth.getTime())) return;

      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      setFormData(prev => ({
        ...prev,
        age_years: String(Math.max(0, years)),
        age_months: String(Math.max(0, months)),
        age_days: String(Math.max(0, days))
      }));
    } catch (e) {
      console.warn("Age calculate error:", e);
    }
  }, [formData.dob]);

  // Sync permanent address if same_as_present toggled
  const handleToggleSameAddress = (checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        same_as_present: true,
        permanent_village_road: prev.present_village_road,
        permanent_post_office: prev.present_post_office,
        permanent_post_code: prev.present_post_code,
        permanent_upazila: prev.present_upazila,
        permanent_district: prev.present_district
      }));
    } else {
      setFormData(prev => ({ ...prev, same_as_present: false }));
    }
  };

  // Education Helpers
  const addEducationRow = () => {
    setFormData(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        { exam: 'স্নাতকোত্তর / ডিপ্লোমা', groupSubject: '', boardUniversity: '', passingYear: '', resultGpa: '' }
      ]
    }));
  };

  const removeEducationRow = (index: number) => {
    if (formData.educations.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof EducationRecord, value: string) => {
    setFormData(prev => {
      const updated = [...prev.educations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educations: updated };
    });
  };

  // Experience Helpers
  const addExperienceRow = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { company: '', designation: '', fromYear: '', toYear: '', responsibilities: '' }
      ]
    }));
  };

  const removeExperienceRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: keyof ExperienceRecord, value: string) => {
    setFormData(prev => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  // Reference Helpers
  const updateReference = (index: number, field: keyof ReferenceRecord, value: string) => {
    setFormData(prev => {
      const updated = [...prev.references];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, references: updated };
    });
  };

  // File Upload Processors
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'photo_url' | 'signature_url' | 'resume_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'bn' ? 'ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।' : 'File size cannot exceed 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (fieldName === 'resume_url') {
        setFormData(prev => ({
          ...prev,
          resume_url: result,
          resume_name: file.name,
          resume_type: file.type
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.name_bn.trim() && !formData.name_en.trim()) {
        setErrorMessage(language === 'bn' ? 'আবেদনকারীর নাম (বাংলা বা ইংরেজি) প্রদান করা আবশ্যক।' : 'Applicant name is required.');
        return false;
      }
      if (!formData.father_name_bn.trim()) {
        setErrorMessage(language === 'bn' ? 'পিতার নাম প্রদান করা আবশ্যক।' : 'Father\'s name is required.');
        return false;
      }
      if (!formData.mother_name_bn.trim()) {
        setErrorMessage(language === 'bn' ? 'মাতার নাম প্রদান করা আবশ্যক।' : 'Mother\'s name is required.');
        return false;
      }
      if (!formData.nid_number.trim() && !formData.birth_reg_number.trim()) {
        setErrorMessage(language === 'bn' ? 'জাতীয় পরিচয়পত্র অথবা জন্ম নিবন্ধন নম্বর প্রদান করা আবশ্যক।' : 'NID or Birth Certificate number is required.');
        return false;
      }
      if (!formData.dob) {
        setErrorMessage(language === 'bn' ? 'জন্ম তারিখ নির্বাচন করুন।' : 'Date of birth is required.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.present_village_road.trim() || !formData.present_upazila.trim() || !formData.present_district.trim()) {
        setErrorMessage(language === 'bn' ? 'বর্তমান ঠিকানার গ্রাম/রাস্তা, উপজেলা ও জেলা পূরণ করুন।' : 'Present address details are required.');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMessage(language === 'bn' ? 'মোবাইল নম্বর প্রদান করা আবশ্যক।' : 'Mobile number is required.');
        return false;
      }
    } else if (step === 3) {
      const hasMinOneEdu = formData.educations.some(e => e.boardUniversity.trim() && e.resultGpa.trim());
      if (!hasMinOneEdu) {
        setErrorMessage(language === 'bn' ? 'কমপক্ষে একটি শিক্ষাগত যোগ্যতার বোর্ড/বিশ্ববিদ্যালয় ও ফলাফল পূরণ করুন।' : 'Please fill in at least one educational qualification.');
        return false;
      }
    } else if (step === 6) {
      if (!formData.declaration_accepted) {
        setErrorMessage(language === 'bn' ? 'আবেদন জমা দেওয়ার জন্য অঙ্গীকারনামায় সম্মতি দিন।' : 'Please accept the declaration to proceed.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(6, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;
    if (!selectedCircular) {
      setErrorMessage(language === 'bn' ? 'কোনো নির্দিষ্ট নিয়োগ বিজ্ঞপ্তি নির্বাচন করা হয়নি।' : 'No job circular selected.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const docId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const trackingNo = `BSK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const applicationPayload: JobApplication = {
        id: docId,
        trackingId: trackingNo,
        circularId: selectedCircular.id,
        circularRefNo: selectedCircular.circular_no || 'BSK-CIRCULAR-' + selectedCircular.id,
        position_bn: selectedCircular.position_bn || selectedCircular.title_bn,
        position_en: selectedCircular.position_en || selectedCircular.title_en,
        dept_bn: selectedCircular.dept_bn || 'প্রশাসন বিভাগ',
        dept_en: selectedCircular.dept_en || 'Administration',

        // Applicant Personal Info
        name_bn: formData.name_bn.trim(),
        name_en: formData.name_en.trim(),
        father_name_bn: formData.father_name_bn.trim(),
        father_name_en: formData.father_name_en.trim(),
        mother_name_bn: formData.mother_name_bn.trim(),
        mother_name_en: formData.mother_name_en.trim(),
        spouse_name: formData.spouse_name.trim(),
        nid_number: formData.nid_number.trim(),
        birth_reg_number: formData.birth_reg_number.trim(),
        dob: formData.dob,
        age_years: formData.age_years,
        age_months: formData.age_months,
        age_days: formData.age_days,
        birth_district: formData.birth_district.trim(),
        nationality: formData.nationality.trim(),
        religion: formData.religion.trim(),
        gender: formData.gender,
        marital_status: formData.marital_status,
        quota: formData.quota,

        // Contact Info
        present_village_road: formData.present_village_road.trim(),
        present_post_office: formData.present_post_office.trim(),
        present_post_code: formData.present_post_code.trim(),
        present_upazila: formData.present_upazila.trim(),
        present_district: formData.present_district.trim(),

        permanent_village_road: formData.permanent_village_road.trim(),
        permanent_post_office: formData.permanent_post_office.trim(),
        permanent_post_code: formData.permanent_post_code.trim(),
        permanent_upazila: formData.permanent_upazila.trim(),
        permanent_district: formData.permanent_district.trim(),
        same_as_present: formData.same_as_present,

        phone: formData.phone.trim(),
        emergency_phone: formData.emergency_phone.trim(),
        email: formData.email.trim(),

        // Education & Experience
        educations: formData.educations.filter(e => e.boardUniversity.trim() || e.resultGpa.trim()),
        experiences: formData.experiences.filter(exp => exp.company.trim() || exp.designation.trim()),
        computer_skills: formData.computer_skills.trim(),
        language_skills: formData.language_skills.trim(),
        other_skills: formData.other_skills.trim(),
        coverLetter: formData.coverLetter.trim(),

        // References
        references: formData.references.filter(r => r.name.trim() || r.phone.trim()),

        // Attachments
        photo_url: formData.photo_url,
        signature_url: formData.signature_url,
        resume_url: formData.resume_url,
        resume_name: formData.resume_name,
        resume_type: formData.resume_type,

        // Declaration
        declaration_accepted: formData.declaration_accepted,
        applicant_place: formData.applicant_place.trim() || 'ঢাকা',

        // Legacy compatibility
        name: formData.name_bn.trim() || formData.name_en.trim(),
        jobTitleBn: selectedCircular.position_bn || selectedCircular.title_bn,
        jobTitleEn: selectedCircular.position_en || selectedCircular.title_en,
        resumeUrl: formData.resume_url,
        resumeName: formData.resume_name,
        resumeType: formData.resume_type,

        // Meta
        status: 'new',
        admin_notes: '',
        createdAt: new Date().toISOString()
      };

      await cpanelApi.setDoc('job_applications', docId, removeUndefinedFields(applicationPayload));

      // Save to local cache as well
      try {
        const cached = localStorage.getItem('cached_job_applications') || '[]';
        const parsed = JSON.parse(cached);
        parsed.unshift({ ...applicationPayload, createdAt: new Date().toISOString() });
        localStorage.setItem('cached_job_applications', JSON.stringify(parsed.slice(0, 100)));
      } catch (e) {
        console.warn("Error updating local job applications cache:", e);
      }

      setSubmittedApp(applicationPayload);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Error submitting job application:", err);
      setErrorMessage(language === 'bn' ? 'দুঃখিত, ডাটাবেসে আবেদন সংরক্ষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' : 'Failed to submit application to database. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCirculars = allCirculars.filter(c => c.status !== 'expired');

  return (
    <div className="space-y-8 w-full animate-fade-in text-left font-sans py-4">
      
      {/* Top Header & Navigation Bar */}
      <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6B5135] font-serif">
            <button 
              type="button" 
              onClick={() => onNavigate('dashboard')}
              className="hover:text-[#B8862A] transition cursor-pointer"
            >
              {language === 'bn' ? 'মূল পাতা' : 'Home'}
            </button>
            <ChevronRight className="h-3 w-3 text-stone-400" />
            <button 
              type="button" 
              onClick={() => onNavigate('recruitment')}
              className="hover:text-[#B8862A] transition cursor-pointer"
            >
              {language === 'bn' ? 'নিয়োগ বিজ্ঞপ্তি' : 'Career Circulars'}
            </button>
            <ChevronRight className="h-3 w-3 text-stone-400" />
            <span className="text-[#1A1207] font-bold">
              {language === 'bn' ? 'অনলাইন আবেদন ফরম' : 'Online Application Form'}
            </span>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#1A1207] flex items-center gap-2">
            <Award className="h-7 w-7 text-[#B8862A]" />
            <span>{language === 'bn' ? 'অফিসিয়াল চাকরির আবেদন ফরম' : 'Official Employment Application Form'}</span>
          </h1>
          <p className="text-xs md:text-sm text-[#6B5135]">
            {language === 'bn' 
              ? 'বিশ্বসাহিত্য কেন্দ্রের নিয়োগ নীতি ও স্ট্যান্ডার্ড প্রাতিষ্ঠানিক ফরম্যাট অনুযায়ী আপনার তথ্য পূরণ করে অনলাইনে সরাসরি আবেদন জমা দিন।' 
              : 'Complete the standardized application form to submit your application for employment at Bishwo Shahitto Kendro.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onBack ? onBack() : onNavigate('recruitment')}
            className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#E8DDD0] text-stone-800 rounded-xl text-xs font-bold transition border border-[#E8DDD0] flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === 'bn' ? 'নিয়োগ বিজ্ঞপ্তিতে ফিরে যান' : 'Back to Circulars'}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION VIEW */}
      {submittedApp ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 md:p-10 shadow-xl text-center space-y-6 max-w-3xl mx-auto"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">
              {language === 'bn' ? 'আবেদনপত্র সফলভাবে জমা হয়েছে!' : 'Application Submitted Successfully!'}
            </h2>
            <p className="text-sm text-stone-600 max-w-lg mx-auto">
              {language === 'bn'
                ? 'আপনার চাকরির আবেদনপত্রটি বিশ্বসাহিত্য কেন্দ্রের নিয়োগ ডাটাবেজে সংরক্ষিত হয়েছে।'
                : 'Your employment application has been registered in the BSK recruitment database.'}
            </p>
          </div>

          {/* Application Tracking Slip Card */}
          <div className="bg-[#FAF7F2] border border-[#B8862A]/30 rounded-2xl p-6 text-left space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="flex justify-between items-center border-b border-[#E8DDD0] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B8862A] font-serif">
                {language === 'bn' ? 'আবেদন ট্র্যাকিং স্লিপ' : 'Application Tracking Slip'}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                ✓ RECEIVED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-500 block">{language === 'bn' ? 'ট্র্যাকিং নম্বর:' : 'Tracking No:'}</span>
                <span className="font-mono font-extrabold text-base text-[#2E5942]">{submittedApp.trackingId}</span>
              </div>
              <div>
                <span className="text-stone-500 block">{language === 'bn' ? 'আবেদনের পদ:' : 'Applied Position:'}</span>
                <span className="font-bold text-stone-900">{submittedApp.position_bn}</span>
              </div>
              <div>
                <span className="text-stone-500 block">{language === 'bn' ? 'আবেদনকারীর নাম:' : 'Applicant Name:'}</span>
                <span className="font-bold text-stone-900">{submittedApp.name_bn || submittedApp.name_en}</span>
              </div>
              <div>
                <span className="text-stone-500 block">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</span>
                <span className="font-bold text-stone-900">{submittedApp.phone}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-6 py-3 bg-[#B8862A] hover:bg-[#966B1E] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Printer className="h-4 w-4" />
              <span>{language === 'bn' ? 'আবেদন ফরম প্রিন্ট / PDF সংরক্ষণ করুন' : 'Print / Save Application Form PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmittedApp(null);
                setCurrentStep(1);
              }}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-sm transition flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'bn' ? 'নতুন আবেদন করুন' : 'Apply for Another Job'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('notice')}
              className="px-5 py-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold rounded-xl text-sm transition cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>{language === 'bn' ? 'নোটিশ বোর্ডে যান' : 'Go to Notice Board'}</span>
            </button>
          </div>

          {/* Hidden Print Modal trigger */}
          {showPrintModal && (
            <OfficialJobApplicationPrintModal
              application={submittedApp}
              language={language}
              onClose={() => setShowPrintModal(false)}
            />
          )}
        </motion.div>
      ) : (
        /* MAIN APPLICATION FORM */
        <div className="space-y-6">

          {/* Position Selector & Circular Summary Card */}
          <div className="bg-[#FAF7F2] border border-[#B8862A]/30 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DDD0] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B8862A] font-serif">
                  {language === 'bn' ? 'আবেদনকৃত পদের বিবরণ' : 'Selected Position Details'}
                </span>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
                  {selectedCircular 
                    ? (language === 'bn' ? selectedCircular.position_bn : selectedCircular.position_en)
                    : (language === 'bn' ? 'আবেদনকৃত পদ নির্বাচন করুন' : 'Select Position')}
                </h2>
              </div>

              {/* Position Switcher Dropdown */}
              {allCirculars.length > 0 && (
                <div className="shrink-0 flex items-center gap-2">
                  <label className="text-xs font-bold text-[#6B5135] whitespace-nowrap">
                    {language === 'bn' ? 'অন্য পদ বেছে নিন:' : 'Change Position:'}
                  </label>
                  <select
                    value={selectedCircular?.id || ''}
                    onChange={(e) => {
                      const found = allCirculars.find(c => c.id === e.target.value);
                      if (found) setSelectedCircular(found);
                    }}
                    className="px-3 py-1.5 bg-white border border-[#E8DDD0] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B8862A] cursor-pointer"
                  >
                    {allCirculars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'bn' ? c.position_bn : c.position_en} ({c.status === 'expired' ? 'মেয়াদোত্তীর্ণ' : 'চলমান'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedCircular && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                  {selectedCircular.dept_bn && (
                    <div className="bg-white p-3 rounded-xl border border-[#E8DDD0]">
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">{language === 'bn' ? 'বিভাগ / শাখা:' : 'Department:'}</span>
                      <span className="font-bold text-stone-900">{language === 'bn' ? selectedCircular.dept_bn : selectedCircular.dept_en}</span>
                    </div>
                  )}
                  {selectedCircular.deadline_bn && (
                    <div className="bg-white p-3 rounded-xl border border-[#E8DDD0]">
                      <span className="text-stone-500 block text-[10px] uppercase font-bold text-[#8B3A1E]">{language === 'bn' ? 'আবেদনের শেষ তারিখ:' : 'Deadline:'}</span>
                      <span className="font-bold text-[#8B3A1E]">📅 {language === 'bn' ? selectedCircular.deadline_bn : selectedCircular.deadline_en}</span>
                    </div>
                  )}
                  {selectedCircular.title_bn && (
                    <div className="bg-white p-3 rounded-xl border border-[#E8DDD0] col-span-1 sm:col-span-2">
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">{language === 'bn' ? 'বিজ্ঞপ্তি শিরোনাম:' : 'Notice Title:'}</span>
                      <span className="font-medium text-stone-800 line-clamp-1">{language === 'bn' ? selectedCircular.title_bn : selectedCircular.title_en}</span>
                    </div>
                  )}
                </div>

                {selectedCircular.desc_bn && (
                  <div className="bg-white p-4 rounded-xl border border-[#E8DDD0] space-y-2 text-left">
                    <span className="text-xs font-bold text-[#1A1207] flex items-center gap-1.5 font-serif">
                      <span className="w-2 h-2 bg-[#B8862A] inline-block" />
                      <span>{language === 'bn' ? 'বিজ্ঞপ্তির বিবরণ ও নির্দেশনাবলী:' : 'Circular Details & Instructions:'}</span>
                    </span>
                    <p className="text-xs text-stone-700 font-sans leading-relaxed whitespace-pre-wrap bg-stone-50 p-3 rounded-lg border border-stone-100 max-h-[160px] overflow-y-auto">
                      {language === 'bn' ? selectedCircular.desc_bn : selectedCircular.desc_en}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedCircular?.fileUrl && (
              <div className="pt-1 flex items-center justify-end">
                <a
                  href={selectedCircular.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#2E5942] hover:text-[#1E3B2C] flex items-center gap-1 bg-white border border-[#E8DDD0] px-3 py-1.5 rounded-xl hover:bg-stone-50 transition"
                >
                  <FileText className="h-3.5 w-3.5 text-[#B8862A]" />
                  <span>{language === 'bn' ? 'মূল নিয়োগ বিজ্ঞপ্তি ফাইল (PDF) দেখুন' : 'View Official Circular PDF'}</span>
                </a>
              </div>
            )}
          </div>

          {/* STEP PROGRESS INDICATOR */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-4 md:p-6 shadow-xs">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs select-none">
              {[
                { step: 1, title: language === 'bn' ? '১. ব্যক্তিগত তথ্য' : '1. Personal' },
                { step: 2, title: language === 'bn' ? '২. ঠিকানা ও যোগাযোগ' : '2. Contact' },
                { step: 3, title: language === 'bn' ? '৩. শিক্ষা' : '3. Education' },
                { step: 4, title: language === 'bn' ? '৪. অভিজ্ঞতা' : '4. Experience' },
                { step: 5, title: language === 'bn' ? '৫. রেফারেন্স' : '5. References' },
                { step: 6, title: language === 'bn' ? '৬. ফটো ও সম্মতি' : '6. Upload' },
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isPassed = currentStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      if (isPassed) setCurrentStep(item.step);
                    }}
                    className={`p-2.5 rounded-xl font-bold transition flex flex-col items-center justify-center gap-1 ${
                      isActive 
                        ? 'bg-[#2E5942] text-white shadow-xs' 
                        : isPassed 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer' 
                        : 'bg-stone-50 text-stone-400 border border-stone-100'
                    }`}
                  >
                    <span className="text-[10px] md:text-xs font-extrabold">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORM CONTENT BY STEP */}
          <form onSubmit={handleSubmit} className="bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            
            {/* STEP 1: PERSONAL DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8DDD0] pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                    <User className="h-5 w-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? '১. আবেদনকারীর ব্যক্তিগত ও পারিবারিক তথ্য' : '1. Applicant Personal & Family Details'}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'আবেদনকারীর নাম (বাংলায়) *' : 'Applicant Name (Bangla) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_bn}
                      onChange={e => setFormData({ ...formData, name_bn: e.target.value })}
                      placeholder="যেমন: মোহাম্মদ রফিকুল ইসলাম"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'আবেদনকারীর নাম (ইংরেজিতে বড় হাতের অক্ষর)' : 'Applicant Name (English Capital)'}
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={e => setFormData({ ...formData, name_en: e.target.value.toUpperCase() })}
                      placeholder="e.g. MOHAMMAD RAFIQUL ISLAM"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'পিতার নাম (বাংলায়) *' : 'Father\'s Name (Bangla) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.father_name_bn}
                      onChange={e => setFormData({ ...formData, father_name_bn: e.target.value })}
                      placeholder="যেমন: মো: আব্দুল জলিল"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'মাতার নাম (বাংলায়) *' : 'Mother\'s Name (Bangla) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.mother_name_bn}
                      onChange={e => setFormData({ ...formData, mother_name_bn: e.target.value })}
                      placeholder="যেমন: মোসাম্মাৎ খাদিজা বেগম"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'স্বামী / স্ত্রীর নাম (যদি থাকে)' : 'Spouse Name (if applicable)'}
                    </label>
                    <input
                      type="text"
                      value={formData.spouse_name}
                      onChange={e => setFormData({ ...formData, spouse_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'জাতীয় পরিচয়পত্র নম্বর (NID)' : 'National ID (NID) Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.nid_number}
                      onChange={e => setFormData({ ...formData, nid_number: e.target.value })}
                      placeholder="যেমন: 1995269281726"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'জন্ম নিবন্ধন নম্বর (যদি NID না থাকে)' : 'Birth Registration No (if NID not available)'}
                    </label>
                    <input
                      type="text"
                      value={formData.birth_reg_number}
                      onChange={e => setFormData({ ...formData, birth_reg_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'জন্ম তারিখ *' : 'Date of Birth *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  {formData.age_years && (
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#B8862A]/30 col-span-1 md:col-span-2 flex items-center gap-3">
                      <span className="text-stone-600 font-bold">{language === 'bn' ? 'হিসাবকৃত বয়স:' : 'Calculated Age:'}</span>
                      <span className="font-extrabold text-[#2E5942] text-sm">
                        {formData.age_years} {language === 'bn' ? 'বছর' : 'years'} {formData.age_months} {language === 'bn' ? 'মাস' : 'months'} {formData.age_days} {language === 'bn' ? 'দিন' : 'days'}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'নিজ জেলা *' : 'Home District *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.birth_district}
                      onChange={e => setFormData({ ...formData, birth_district: e.target.value })}
                      placeholder="যেমন: ঢাকা / কুমিল্লা / বগুড়া"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'লিঙ্গ *' : 'Gender *'}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    >
                      <option value="male">{language === 'bn' ? 'পুরুষ (Male)' : 'Male'}</option>
                      <option value="female">{language === 'bn' ? 'নারী (Female)' : 'Female'}</option>
                      <option value="other">{language === 'bn' ? 'অন্যান্য (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'বৈবাহিক অবস্থা *' : 'Marital Status *'}
                    </label>
                    <select
                      value={formData.marital_status}
                      onChange={e => setFormData({ ...formData, marital_status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    >
                      <option value="single">{language === 'bn' ? 'অবিবাহিত (Unmarried)' : 'Unmarried'}</option>
                      <option value="married">{language === 'bn' ? 'বিবাহিত (Married)' : 'Married'}</option>
                      <option value="other">{language === 'bn' ? 'অন্যান্য (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'কোটা / ক্যাটাগরি' : 'Quota / Category'}
                    </label>
                    <select
                      value={formData.quota}
                      onChange={e => setFormData({ ...formData, quota: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                    >
                      <option value="general">{language === 'bn' ? 'সাধারণ (General)' : 'General'}</option>
                      <option value="freedom_fighter">{language === 'bn' ? 'মুক্তিযোদ্ধা সন্তান / নাতি-নাতনি' : 'Freedom Fighter Quota'}</option>
                      <option value="ethnic">{language === 'bn' ? 'ক্ষুদ্র নৃ-গোষ্ঠী (Ethnic Minorities)' : 'Ethnic Minorities'}</option>
                      <option value="disabled">{language === 'bn' ? 'প্রতিবন্ধী কোটা (Differently Abled)' : 'Differently Abled'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ADDRESS & CONTACT */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8DDD0] pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? '২. যোগাযোগের ঠিকানা ও তথ্য' : '2. Address & Contact Information'}</span>
                  </h3>
                </div>

                <div className="space-y-6 text-xs font-sans">
                  {/* Present Address */}
                  <div className="bg-[#FAF7F2]/50 border border-[#E8DDD0] rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-[#2E5942] uppercase tracking-wider text-[11px]">
                      {language === 'bn' ? 'বর্তমান ঠিকানা (Present Address)' : 'Present Address'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'গ্রাম / রাস্তা / বাসা নম্বর *' : 'Village / Road / House No *'}</label>
                        <input
                          type="text"
                          required
                          value={formData.present_village_road}
                          onChange={e => setFormData({ ...formData, present_village_road: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'ডাকঘর *' : 'Post Office *'}</label>
                        <input
                          type="text"
                          required
                          value={formData.present_post_office}
                          onChange={e => setFormData({ ...formData, present_post_office: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'পোস্ট কোড' : 'Post Code'}</label>
                        <input
                          type="text"
                          value={formData.present_post_code}
                          onChange={e => setFormData({ ...formData, present_post_code: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'উপজেলা / থানা *' : 'Upazila / Thana *'}</label>
                        <input
                          type="text"
                          required
                          value={formData.present_upazila}
                          onChange={e => setFormData({ ...formData, present_upazila: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'জেলা *' : 'District *'}</label>
                        <input
                          type="text"
                          required
                          value={formData.present_district}
                          onChange={e => setFormData({ ...formData, present_district: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Same as present checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="same_addr"
                      checked={formData.same_as_present}
                      onChange={e => handleToggleSameAddress(e.target.checked)}
                      className="w-4 h-4 text-[#2E5942] rounded focus:ring-[#2E5942] cursor-pointer"
                    />
                    <label htmlFor="same_addr" className="font-bold text-stone-800 cursor-pointer">
                      {language === 'bn' ? 'স্থায়ী ঠিকানা বর্তমান ঠিকানার অনুরূপ' : 'Permanent address same as present address'}
                    </label>
                  </div>

                  {/* Permanent Address */}
                  {!formData.same_as_present && (
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                      <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                        {language === 'bn' ? 'স্থায়ী ঠিকানা (Permanent Address)' : 'Permanent Address'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'গ্রাম / রাস্তা / বাসা নম্বর' : 'Village / Road / House No'}</label>
                          <input
                            type="text"
                            value={formData.permanent_village_road}
                            onChange={e => setFormData({ ...formData, permanent_village_road: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'ডাকঘর' : 'Post Office'}</label>
                          <input
                            type="text"
                            value={formData.permanent_post_office}
                            onChange={e => setFormData({ ...formData, permanent_post_office: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'পোস্ট কোড' : 'Post Code'}</label>
                          <input
                            type="text"
                            value={formData.permanent_post_code}
                            onChange={e => setFormData({ ...formData, permanent_post_code: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'উপজেলা / থানা' : 'Upazila / Thana'}</label>
                          <input
                            type="text"
                            value={formData.permanent_upazila}
                            onChange={e => setFormData({ ...formData, permanent_upazila: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'জেলা' : 'District'}</label>
                          <input
                            type="text"
                            value={formData.permanent_district}
                            onChange={e => setFormData({ ...formData, permanent_district: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01711XXXXXX"
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'জরুরি মোবাইল নম্বর' : 'Emergency Contact'}</label>
                      <input
                        type="tel"
                        value={formData.emergency_phone}
                        onChange={e => setFormData({ ...formData, emergency_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@gmail.com"
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EDUCATION */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8DDD0] pb-3 flex justify-between items-center">
                  <h3 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? '৩. শিক্ষাগত যোগ্যতার বিবরণ' : '3. Educational Qualifications'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addEducationRow}
                    className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{language === 'bn' ? 'পরীক্ষা যোগ করুন' : 'Add Exam'}</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {formData.educations.map((edu, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 relative">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                        <span className="font-bold text-[#2E5942]">{idx + 1}. {edu.exam || 'শিক্ষাগত যোগ্যতা'}</span>
                        {formData.educations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducationRow(idx)}
                            className="text-rose-600 hover:text-rose-800 transition p-1 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'পরীক্ষা / ডিগ্রির নাম' : 'Exam Name'}</label>
                          <input
                            type="text"
                            value={edu.exam}
                            onChange={e => updateEducation(idx, 'exam', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'বিষয় / বিভাগ' : 'Group / Subject'}</label>
                          <input
                            type="text"
                            value={edu.groupSubject}
                            onChange={e => updateEducation(idx, 'groupSubject', e.target.value)}
                            placeholder="যেমন: মানবিক / কলা / হিসাববিজ্ঞান"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'বোর্ড / বিশ্ববিদ্যালয়' : 'Board / Varsity'}</label>
                          <input
                            type="text"
                            value={edu.boardUniversity}
                            onChange={e => updateEducation(idx, 'boardUniversity', e.target.value)}
                            placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'পাশের বছর' : 'Passing Year'}</label>
                          <input
                            type="text"
                            value={edu.passingYear}
                            onChange={e => updateEducation(idx, 'passingYear', e.target.value)}
                            placeholder="যেমন: 2020"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'ফলাফল / GPA' : 'Result / GPA'}</label>
                          <input
                            type="text"
                            value={edu.resultGpa}
                            onChange={e => updateEducation(idx, 'resultGpa', e.target.value)}
                            placeholder="যেমন: 3.85 / ১ম বিভাগ"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: EXPERIENCE & SKILLS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8DDD0] pb-3 flex justify-between items-center">
                  <h3 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? '৪. চাকরির অভিজ্ঞতা ও পেশাগত দক্ষতা' : '4. Work Experience & Skills'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addExperienceRow}
                    className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{language === 'bn' ? 'অভিজ্ঞতা যোগ করুন' : 'Add Experience'}</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {formData.experiences.map((exp, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 relative">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                        <span className="font-bold text-[#2E5942]">{idx + 1}. {exp.designation || 'পূর্বতন চাকরির বিবরণ'}</span>
                        <button
                          type="button"
                          onClick={() => removeExperienceRow(idx)}
                          className="text-rose-600 hover:text-rose-800 transition p-1 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Organization'}</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={e => updateExperience(idx, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'পদবি' : 'Designation'}</label>
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={e => updateExperience(idx, 'designation', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'শুরু ও শেষ সাল' : 'Duration'}</label>
                          <input
                            type="text"
                            value={`${exp.fromYear}${exp.toYear ? ' - ' + exp.toYear : ''}`}
                            onChange={e => updateExperience(idx, 'fromYear', e.target.value)}
                            placeholder="যেমন: 2021 - 2024"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'প্রধান দায়িত্বাবলী' : 'Responsibilities'}</label>
                          <input
                            type="text"
                            value={exp.responsibilities}
                            onChange={e => updateExperience(idx, 'responsibilities', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Additional Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'কম্পিউটার দক্ষতা' : 'Computer Skills'}</label>
                      <input
                        type="text"
                        value={formData.computer_skills}
                        onChange={e => setFormData({ ...formData, computer_skills: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'ভাষাগত দক্ষতা' : 'Language Skills'}</label>
                      <input
                        type="text"
                        value={formData.language_skills}
                        onChange={e => setFormData({ ...formData, language_skills: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'সংক্ষিপ্ত কাভার লেটার / আত্মপক্ষ বক্তব্য' : 'Short Cover Letter / Note'}</label>
                    <textarea
                      rows={3}
                      value={formData.coverLetter}
                      onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                      placeholder="কেন আপনি এই পদের জন্য নিজেকে যোগ্য মনে করছেন সংক্ষেপে লিখুন..."
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: REFERENCES */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8DDD0] pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                    <User className="h-5 w-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? '৫. দুইজন সম্মানিত ব্যক্তির রেফারেন্স (References)' : '5. Two References'}</span>
                  </h3>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {formData.references.map((ref, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                      <h4 className="font-bold text-[#2E5942] uppercase text-[11px]">{language === 'bn' ? `রেফারেন্স ${idx + 1}` : `Reference ${idx + 1}`}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'রেফারেন্স ব্যক্তির নাম' : 'Name'}</label>
                          <input
                            type="text"
                            value={ref.name}
                            onChange={e => updateReference(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'পদবি ও কর্মস্থল' : 'Designation & Workplace'}</label>
                          <input
                            type="text"
                            value={ref.designation}
                            onChange={e => updateReference(idx, 'designation', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</label>
                          <input
                            type="tel"
                            value={ref.phone}
                            onChange={e => updateReference(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">{language === 'bn' ? 'সম্পর্ক' : 'Relation'}</label>
                          <input
                            type="text"
                            value={ref.relation}
                            onChange={e => updateReference(idx, 'relation', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: ATTACHMENTS & DECLARATION */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8DDD0] pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? '৬. ফটো, স্বাক্ষর, জীবনবৃত্তান্ত ও অঙ্গীকারনামা' : '6. Photo, Signature, CV & Declaration'}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-sans">
                  {/* Photo Upload */}
                  <div className="bg-[#FAF7F2] border border-[#E8DDD0] p-4 rounded-2xl text-center space-y-3">
                    <span className="font-bold text-stone-800 block">{language === 'bn' ? 'পাসপোর্ট সাইজের ছবি' : 'Passport Size Photo'}</span>
                    {formData.photo_url ? (
                      <div className="w-28 h-32 mx-auto overflow-hidden rounded-xl border border-stone-300 shadow-xs relative bg-white">
                        <img src={formData.photo_url} alt="Photo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photo_url: '' })}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-28 h-32 mx-auto border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400 bg-white">
                        <User className="h-8 w-8 mb-1" />
                        <span className="text-[10px]">300x300 pixel</span>
                      </div>
                    )}
                    <label className="inline-block px-3 py-1.5 bg-[#2E5942] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#1E3B2C] transition">
                      <span>{formData.photo_url ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'photo_url')} className="hidden" />
                    </label>
                  </div>

                  {/* Signature Upload */}
                  <div className="bg-[#FAF7F2] border border-[#E8DDD0] p-4 rounded-2xl text-center space-y-3">
                    <span className="font-bold text-stone-800 block">{language === 'bn' ? 'ডিজিটাল স্বাক্ষর' : 'Digital Signature'}</span>
                    {formData.signature_url ? (
                      <div className="w-36 h-20 mx-auto overflow-hidden rounded-xl border border-stone-300 shadow-xs relative bg-white flex items-center justify-center p-1">
                        <img src={formData.signature_url} alt="Signature" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, signature_url: '' })}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-36 h-20 mx-auto border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400 bg-white">
                        <span className="text-[10px]">300x80 pixel</span>
                      </div>
                    )}
                    <label className="inline-block px-3 py-1.5 bg-[#2E5942] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#1E3B2C] transition">
                      <span>{formData.signature_url ? 'স্বাক্ষর পরিবর্তন করুন' : 'স্বাক্ষর আপলোড করুন'}</span>
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'signature_url')} className="hidden" />
                    </label>
                  </div>

                  {/* Resume / CV Upload */}
                  <div className="bg-[#FAF7F2] border border-[#E8DDD0] p-4 rounded-2xl text-center space-y-3">
                    <span className="font-bold text-stone-800 block">{language === 'bn' ? 'সিভি / রেজুমে (PDF/DOC)' : 'Resume / CV File'}</span>
                    {formData.resume_url ? (
                      <div className="p-3 bg-white rounded-xl border border-stone-300 space-y-1 text-left">
                        <span className="font-bold text-stone-800 block text-xs truncate">{formData.resume_name}</span>
                        <span className="text-[10px] text-emerald-700 font-bold">✓ ফাইল যুক্ত হয়েছে</span>
                      </div>
                    ) : (
                      <div className="w-full h-20 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400 bg-white">
                        <FileText className="h-6 w-6 mb-1" />
                        <span className="text-[10px]">Max 5MB (PDF/DOC)</span>
                      </div>
                    )}
                    <label className="inline-block px-3 py-1.5 bg-[#2E5942] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#1E3B2C] transition">
                      <span>{formData.resume_url ? 'ফাইল পরিবর্তন করুন' : 'সিভি ফাইল আপলোড করুন'}</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={e => handleFileUpload(e, 'resume_url')} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Declaration Box */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3 text-xs text-stone-800 leading-relaxed font-sans">
                  <h4 className="font-serif font-bold text-sm text-[#8B3A1E]">{language === 'bn' ? 'আবেদনকারীর অঙ্গীকারনামা' : 'Applicant Declaration'}</h4>
                  <p className="italic">
                    &ldquo;আমি এই মর্মে প্রত্যয়ন করছি যে, এই আবেদনপত্রে বর্ণিত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। কোনো তথ্য অসত্য, ত্রুটিপূর্ণ বা গোপন করা হয়েছে মর্মে প্রমাণিত হলে কর্তৃপক্ষ কর্তৃক যেকোনো আইনানুগ ব্যবস্থা গ্রহণ করা যাবে এবং আমার এই নিয়োগ সরাসরি বাতিল বলে গণ্য হবে।&rdquo;
                  </p>
                  
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dec_accepted"
                      checked={formData.declaration_accepted}
                      onChange={e => setFormData({ ...formData, declaration_accepted: e.target.checked })}
                      className="w-4 h-4 text-[#2E5942] rounded focus:ring-[#2E5942] cursor-pointer"
                    />
                    <label htmlFor="dec_accepted" className="font-bold text-stone-900 cursor-pointer">
                      {language === 'bn' ? 'আমি উপরোক্ত সকল অঙ্গীকারনামা সাবধানে পড়েছি এবং এতে পূর্ণ সম্মতি জ্ঞাপন করছি। *' : 'I accept the terms and declare that all provided information is true. *'}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS BAR */}
            <div className="border-t border-[#E8DDD0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{language === 'bn' ? 'পূর্ববর্তী ধাপ' : 'Previous Step'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#B8862A] hover:bg-[#966B1E] text-white rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto justify-center"
                  >
                    {isSubmitting ? (
                      <span>{language === 'bn' ? 'আবেদন জমা হচ্ছে...' : 'Submitting...'}</span>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{language === 'bn' ? 'চূড়ান্ত আবেদন জমা দিন' : 'Submit Final Application'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
