import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle2, Upload, FileText, ArrowRight, ArrowLeft, 
  Printer, User, Phone, MapPin, GraduationCap, Briefcase, 
  Award, ShieldCheck, Sparkles, AlertCircle, Plus, Trash2, HelpCircle
} from 'lucide-react';
import { cpanelApi } from '../services/cpanelApi';
import { removeUndefinedFields } from '../cpanel-database';
import { JobApplication, Language, EducationRecord, ExperienceRecord, ReferenceRecord } from '../types';
import OfficialJobApplicationPrintModal from './OfficialJobApplicationPrintModal';

interface OfficialJobApplicationModalProps {
  circular: any;
  language: Language;
  onClose: () => void;
}

export default function OfficialJobApplicationModal({
  circular,
  language,
  onClose
}: OfficialJobApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

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

  // Sync permanent address if "same_as_present" is toggled
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

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.name_bn.trim() && !formData.name_en.trim()) {
        setErrorMessage(language === 'bn' ? 'প্রার্থীর নাম প্রদান করা আবশ্যক।' : 'Candidate name is required.');
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
        setErrorMessage(language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) অথবা জন্ম নিবন্ধন নম্বর প্রদান করুন।' : 'NID or Birth Certificate number is required.');
        return false;
      }
      if (!formData.dob) {
        setErrorMessage(language === 'bn' ? 'জন্ম তারিখ নির্বাচন করুন।' : 'Date of birth is required.');
        return false;
      }
      if (!formData.birth_district.trim()) {
        setErrorMessage(language === 'bn' ? 'নিজ জেলা / জন্মস্থান নির্বাচন করুন।' : 'District is required.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.present_village_road.trim() || !formData.present_district.trim()) {
        setErrorMessage(language === 'bn' ? 'বর্তমান ঠিকানার গ্রাম/সড়ক ও জেলা প্রদান করুন।' : 'Present address road and district are required.');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMessage(language === 'bn' ? 'মোবাইল নম্বর প্রদান করা বাধ্যতামূলক।' : 'Mobile phone number is required.');
        return false;
      }
      if (!formData.email.trim()) {
        setErrorMessage(language === 'bn' ? 'সঠিক ইমেইল এড্রেস প্রদান করুন।' : 'Email address is required.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      const hasValidEdu = formData.educations.some(e => e.boardUniversity.trim() && e.resultGpa.trim());
      if (!hasValidEdu) {
        setErrorMessage(language === 'bn' ? 'অন্তত একটি শিক্ষাগত যোগ্যতার বিবরণ (বোর্ড/প্রতিষ্ঠান ও ফলাফল) প্রদান করুন।' : 'Please enter at least one educational qualification.');
        return false;
      }
      return true;
    }

    if (step === 5) {
      if (!formData.photo_url) {
        setErrorMessage(language === 'bn' ? 'প্রার্থীর রঙিন পাসপোর্ট ছবি আপলোড করা আবশ্যক।' : 'Passport size photo is required.');
        return false;
      }
      if (!formData.declaration_accepted) {
        setErrorMessage(language === 'bn' ? 'আবেদন জমা দেওয়ার জন্য অঙ্গীকারনামায় সম্মতি দিন।' : 'Please accept the declaration to proceed.');
        return false;
      }
      return true;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Generate clean BSK tracking number
      const randomFour = Math.floor(1000 + Math.random() * 9000);
      const trackingCode = `BSK-JOB-${new Date().getFullYear()}-${randomFour}`;
      const docId = `app_${Date.now()}_${randomFour}`;

      const applicationPayload: JobApplication = {
        id: docId,
        trackingId: trackingCode,
        circularId: circular.id || 'general',
        position_bn: circular.position_bn || circular.title_bn || 'নিয়োগ বিজ্ঞপ্তি',
        position_en: circular.position_en || circular.title_en || 'Recruitment Notice',
        circularRefNo: circular.circular_no || '',

        // Personal
        name_bn: formData.name_bn.trim() || formData.name_en.trim(),
        name_en: formData.name_en.trim().toUpperCase() || formData.name_bn.trim(),
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
        nationality: formData.nationality.trim() || 'বাংলাদেশী',
        religion: formData.religion,
        gender: formData.gender,
        marital_status: formData.marital_status,
        quota: formData.quota,

        // Contact
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
        jobTitleBn: circular.position_bn || circular.title_bn,
        jobTitleEn: circular.position_en || circular.title_en,
        resumeUrl: formData.resume_url,
        resumeName: formData.resume_name,
        resumeType: formData.resume_type,

        // Meta
        status: 'new',
        admin_notes: '',
        createdAt: new Date().toISOString()
      };

      await cpanelApi.setDoc('job_applications', docId, removeUndefinedFields(applicationPayload));

      setSubmittedApp(applicationPayload);
    } catch (err: any) {
      console.error("Error submitting job application:", err);
      setErrorMessage(language === 'bn' ? 'দুঃখিত, ডাটাবেসে আবেদন সংরক্ষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' : 'Failed to submit application to database. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-[99999] overflow-y-auto cursor-pointer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-auto cursor-default text-left font-sans"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#1E3B2C] text-white p-5 relative select-none">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-stone-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#B8862A] text-stone-950 text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider">
                {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র নিয়োগ পোর্টাল' : 'BSK Career Portal'}
              </span>
              {circular.deadline_bn && (
                <span className="bg-white/10 text-stone-300 text-[10px] px-2.5 py-0.5 rounded-full">
                  📅 {language === 'bn' ? 'শেষ তারিখ: ' : 'Deadline: '}{language === 'bn' ? circular.deadline_bn : circular.deadline_en}
                </span>
              )}
            </div>

            <h3 className="font-serif font-bold text-lg sm:text-xl text-white mt-1.5 leading-snug">
              {language === 'bn' ? (circular.position_bn || circular.title_bn) : (circular.position_en || circular.title_en)}
            </h3>
            <p className="text-xs text-stone-300 font-sans mt-0.5">
              {language === 'bn' ? 'সরকারি ও প্রাতিষ্ঠানিক ফরম্যাট অনুযায়ী পূর্ণাঙ্গ চাকরির আবেদন ফরম' : 'Official standardized employment application format'}
            </p>
          </div>

          {/* Stepper Navigation (Only shown before submission) */}
          {!submittedApp && (
            <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 overflow-x-auto flex items-center justify-between gap-1 text-[11px] font-bold text-stone-600">
              {[
                { step: 1, label_bn: '১. ব্যক্তিগত তথ্য', label_en: '1. Personal' },
                { step: 2, label_bn: '২. ঠিকানা ও যোগাযোগ', label_en: '2. Contact' },
                { step: 3, label_bn: '৩. শিক্ষা', label_en: '3. Education' },
                { step: 4, label_bn: '৪. অভিজ্ঞতা ও দক্ষতা', label_en: '4. Experience' },
                { step: 5, label_bn: '৫. ছবি ও ঘোষণা', label_en: '5. Declaration' }
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step < currentStep || validateStep(currentStep)) {
                      setCurrentStep(item.step);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    currentStep === item.step
                      ? 'bg-[#2E5942] text-white shadow-xs'
                      : item.step < currentStep
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'hover:bg-stone-200 text-stone-500'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    currentStep === item.step ? 'bg-white text-[#2E5942]' : (item.step < currentStep ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-700')
                  }`}>
                    {item.step < currentStep ? '✓' : item.step}
                  </span>
                  <span>{language === 'bn' ? item.label_bn : item.label_en}</span>
                </button>
              ))}
            </div>
          )}

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto max-h-[68vh] space-y-5">
            {submittedApp ? (
              /* Success View */
              <div className="text-center py-8 space-y-5 font-sans">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border-2 border-emerald-300 shadow-sm animate-bounce">
                  ✓
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h4 className="font-serif font-extrabold text-xl text-[#1A1207]">
                    {language === 'bn' ? 'আবেদনপত্র সফলভাবে জমা হয়েছে!' : 'Application Submitted Successfully!'}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'bn'
                      ? 'আপনার চাকরির আবেদনপত্রটি বিশ্বসাহিত্য কেন্দ্রের নিয়োগ ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে।'
                      : 'Your job application has been securely saved to Bishwo Shahitto Kendro career database.'}
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-[#FAF7F2] border-2 border-[#B8862A]/40 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-[#E8DDD0] pb-2">
                    <span className="text-[10px] font-bold text-[#8C6212] uppercase tracking-wider">
                      {language === 'bn' ? 'আবেদন ট্র্যাকিং স্লিপ' : 'Application Tracking Slip'}
                    </span>
                    <span className="text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      STATUS: SUBMITTED
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-700 font-sans">
                    <p className="flex justify-between">
                      <span className="text-stone-500">{language === 'bn' ? 'ট্র্যাকিং নম্বর:' : 'Tracking ID:'}</span>
                      <span className="font-mono font-black text-stone-900 text-sm bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                        {submittedApp.trackingId}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-stone-500">{language === 'bn' ? 'প্রার্থীর নাম:' : 'Candidate Name:'}</span>
                      <span className="font-bold text-stone-900">{submittedApp.name_bn || submittedApp.name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-stone-500">{language === 'bn' ? 'পদের নাম:' : 'Position:'}</span>
                      <span className="font-bold text-stone-900">{submittedApp.position_bn}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-stone-500">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Phone:'}</span>
                      <span className="font-mono font-bold">{submittedApp.phone}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-stone-500">{language === 'bn' ? 'ইমেইল:' : 'Email:'}</span>
                      <span className="font-mono">{submittedApp.email}</span>
                    </p>
                  </div>
                </div>

                {/* Success Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>{language === 'bn' ? 'আবেদন ফরম প্রিন্ট / PDF সংরক্ষণ করুন' : 'Print / Save Application Form PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    {language === 'bn' ? 'পোর্টাল বন্ধ করুন' : 'Close Portal'}
                  </button>
                </div>
              </div>
            ) : (
              /* Multi-step Form Content */
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                
                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-bold animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* STEP 1: Personal Details */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="border-b border-stone-200 pb-2">
                      <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#2E5942]" />
                        <span>{language === 'bn' ? '১. প্রার্থীর মৌলিক ও ব্যক্তিগত তথ্য' : '1. Candidate Personal Particulars'}</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {language === 'bn' ? 'জাতীয় পরিচয়পত্র অথবা জন্ম নিবন্ধন সনদ অনুযায়ী সঠিক তথ্য প্রদান করুন।' : 'Provide details accurately as per National ID or Birth Certificate.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'প্রার্থীর নাম (বাংলায়) *' : 'Name in Bengali *'}
                        </label>
                        <input
                          type="text"
                          value={formData.name_bn}
                          onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                          placeholder="যেমন: হাসিবুর রহমান"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'প্রার্থীর নাম (ইংরেজিতে CAPITAL LETTERS) *' : 'Name in English (CAPITAL LETTERS) *'}
                        </label>
                        <input
                          type="text"
                          value={formData.name_en}
                          onChange={(e) => setFormData({ ...formData, name_en: e.target.value.toUpperCase() })}
                          placeholder="e.g. MD. HASIBUR RAHMAN"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none font-mono uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'পিতার নাম (বাংলায়) *' : 'Father\'s Name (Bengali) *'}
                        </label>
                        <input
                          type="text"
                          value={formData.father_name_bn}
                          onChange={(e) => setFormData({ ...formData, father_name_bn: e.target.value })}
                          placeholder="পিতার নাম"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'মাতার নাম (বাংলায়) *' : 'Mother\'s Name (Bengali) *'}
                        </label>
                        <input
                          type="text"
                          value={formData.mother_name_bn}
                          onChange={(e) => setFormData({ ...formData, mother_name_bn: e.target.value })}
                          placeholder="মাতার নাম"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) নম্বর *' : 'National ID (NID) Number *'}
                        </label>
                        <input
                          type="text"
                          value={formData.nid_number}
                          onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                          placeholder="10 / 13 / 17 digit NID"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'জন্ম তারিখ *' : 'Date of Birth *'}
                        </label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'বয়স (স্বয়ংক্রিয় গণনাকৃত)' : 'Calculated Age'}
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formData.age_years ? `${formData.age_years} বছর ${formData.age_months || '০'} মাস` : 'জন্ম তারিখ দিন'}
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-100 text-stone-700 font-bold outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'নিজ জেলা / জন্মস্থান *' : 'Birth District *'}
                        </label>
                        <input
                          type="text"
                          value={formData.birth_district}
                          onChange={(e) => setFormData({ ...formData, birth_district: e.target.value })}
                          placeholder="যেমন: ঢাকা"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'লিঙ্গ *' : 'Gender *'}
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                        >
                          <option value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                          <option value="female">{language === 'bn' ? 'মহিলা' : 'Female'}</option>
                          <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'ধর্ম *' : 'Religion *'}
                        </label>
                        <select
                          value={formData.religion}
                          onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                        >
                          <option value="ইসলাম">ইসলাম</option>
                          <option value="হিন্দু">হিন্দু</option>
                          <option value="বৌদ্ধ">বৌদ্ধ</option>
                          <option value="খ্রিস্টান">খ্রিস্টান</option>
                          <option value="অন্যান্য">অন্যান্য</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">
                          {language === 'bn' ? 'কোটা (যদি থাকে)' : 'Quota (if any)'}
                        </label>
                        <select
                          value={formData.quota}
                          onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                        >
                          <option value="general">সাধারণ (কোনো কোটা নেই)</option>
                          <option value="freedom_fighter">বীর মুক্তিযোদ্ধা কোটা</option>
                          <option value="disabled">শারীরিক প্রতিবন্ধী কোটা</option>
                          <option value="ethnic">ক্ষুদ্র নৃ-গোষ্ঠী কোটা</option>
                          <option value="orphan">এতিম ও আনসার কোটা</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 block">
                        {language === 'bn' ? 'স্বামী/স্ত্রীর নাম (বিবাহিত হলে)' : 'Spouse Name (if married)'}
                      </label>
                      <input
                        type="text"
                        value={formData.spouse_name}
                        onChange={(e) => setFormData({ ...formData, spouse_name: e.target.value })}
                        placeholder="প্রযোজ্য ক্ষেত্রে লিখুন"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Address & Contact */}
                {currentStep === 2 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="border-b border-stone-200 pb-2">
                      <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#2E5942]" />
                        <span>{language === 'bn' ? '২. যোগাযোগের ঠিকানা ও নম্বর' : '2. Address & Contact Information'}</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {language === 'bn' ? 'চিঠি ও প্রবেশপত্র প্রেরণের সুবিধার্থে সঠিক ঠিকানা দিন।' : 'Provide exact present and permanent addresses for official correspondence.'}
                      </p>
                    </div>

                    {/* Present Address */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <span className="font-bold text-stone-800 text-xs block">
                        📍 {language === 'bn' ? 'বর্তমান ঠিকানা (Present Address):' : 'Present Address:'}
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-stone-600 block">{language === 'bn' ? 'গ্রাম / বাড়ি / সড়ক নং *' : 'Village / House / Road *'}</label>
                          <input
                            type="text"
                            value={formData.present_village_road}
                            onChange={(e) => setFormData({ ...formData, present_village_road: e.target.value })}
                            placeholder="বাড়ি নং, রোড নং, এলাকা/মহল্লা"
                            className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-stone-600 block">{language === 'bn' ? 'ডাকঘর (Post Office)' : 'Post Office'}</label>
                          <input
                            type="text"
                            value={formData.present_post_office}
                            onChange={(e) => setFormData({ ...formData, present_post_office: e.target.value })}
                            placeholder="ডাকঘর"
                            className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-stone-600 block">{language === 'bn' ? 'পোস্ট কোড (Post Code)' : 'Post Code'}</label>
                          <input
                            type="text"
                            value={formData.present_post_code}
                            onChange={(e) => setFormData({ ...formData, present_post_code: e.target.value })}
                            placeholder="১২০৫"
                            className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942] font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-stone-600 block">{language === 'bn' ? 'উপজেলা / থানা' : 'Upazila / Thana'}</label>
                          <input
                            type="text"
                            value={formData.present_upazila}
                            onChange={(e) => setFormData({ ...formData, present_upazila: e.target.value })}
                            placeholder="উপজেলা/থানা"
                            className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-stone-600 block">{language === 'bn' ? 'জেলা *' : 'District *'}</label>
                          <input
                            type="text"
                            value={formData.present_district}
                            onChange={(e) => setFormData({ ...formData, present_district: e.target.value })}
                            placeholder="জেলা"
                            className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permanent Address */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-stone-800 text-xs block">
                          🏡 {language === 'bn' ? 'স্থায়ী ঠিকানা (Permanent Address):' : 'Permanent Address:'}
                        </span>

                        <label className="flex items-center gap-1.5 text-xs text-stone-700 font-bold cursor-pointer select-none bg-white px-3 py-1 rounded-lg border border-stone-200">
                          <input
                            type="checkbox"
                            checked={formData.same_as_present}
                            onChange={(e) => handleToggleSameAddress(e.target.checked)}
                            className="rounded text-[#2E5942] focus:ring-[#2E5942] h-3.5 w-3.5"
                          />
                          <span>{language === 'bn' ? 'বর্তমান ঠিকানার অনুরূপ' : 'Same as present address'}</span>
                        </label>
                      </div>

                      {!formData.same_as_present && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="font-bold text-stone-600 block">{language === 'bn' ? 'গ্রাম / বাড়ি / সড়ক নং *' : 'Village / House / Road *'}</label>
                            <input
                              type="text"
                              value={formData.permanent_village_road}
                              onChange={(e) => setFormData({ ...formData, permanent_village_road: e.target.value })}
                              placeholder="বাড়ি নং, রোড নং, গ্রাম/মহল্লা"
                              className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-600 block">{language === 'bn' ? 'ডাকঘর' : 'Post Office'}</label>
                            <input
                              type="text"
                              value={formData.permanent_post_office}
                              onChange={(e) => setFormData({ ...formData, permanent_post_office: e.target.value })}
                              placeholder="ডাকঘর"
                              className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-600 block">{language === 'bn' ? 'পোস্ট কোড' : 'Post Code'}</label>
                            <input
                              type="text"
                              value={formData.permanent_post_code}
                              onChange={(e) => setFormData({ ...formData, permanent_post_code: e.target.value })}
                              placeholder="পোস্ট কোড"
                              className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942] font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-600 block">{language === 'bn' ? 'উপজেলা / থানা' : 'Upazila / Thana'}</label>
                            <input
                              type="text"
                              value={formData.permanent_upazila}
                              onChange={(e) => setFormData({ ...formData, permanent_upazila: e.target.value })}
                              placeholder="উপজেলা"
                              className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-600 block">{language === 'bn' ? 'জেলা' : 'District'}</label>
                            <input
                              type="text"
                              value={formData.permanent_district}
                              onChange={(e) => setFormData({ ...formData, permanent_district: e.target.value })}
                              placeholder="জেলা"
                              className="w-full p-2 border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#2E5942]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phones and Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">{language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Phone *'}</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="017xxxxxxxx"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">{language === 'bn' ? 'জরুরি যোগাযোগ নম্বর' : 'Emergency Contact'}</label>
                        <input
                          type="tel"
                          value={formData.emergency_phone}
                          onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                          placeholder="018xxxxxxxx"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ইমেইল এড্রেস *' : 'Email Address *'}</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="candidate@example.com"
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#2E5942] font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Educational Qualifications */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="border-b border-stone-200 pb-2 flex justify-between items-center">
                      <div>
                        <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-[#2E5942]" />
                          <span>{language === 'bn' ? '৩. শিক্ষাগত যোগ্যতার বিবরণ' : '3. Educational Qualifications'}</span>
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {language === 'bn' ? 'এসএসসি, এইচএসসি, স্নাতক ও স্নাতকোত্তর সমমানের সকল তথ্য অন্তর্ভুক্ত করুন।' : 'Add SSC, HSC, Graduation, and Post-graduation details.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addEducationRow}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{language === 'bn' ? 'ডিগ্রি যোগ করুন' : 'Add Degree'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.educations.map((edu, idx) => (
                        <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5 relative">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#2E5942] text-xs">
                              🎓 {language === 'bn' ? `ডিগ্রি / স্তর ${idx + 1}:` : `Degree / Level ${idx + 1}:`}
                            </span>
                            {formData.educations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEducationRow(idx)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'পরীক্ষার নাম' : 'Exam'}</label>
                              <input
                                type="text"
                                value={edu.exam}
                                onChange={(e) => updateEducation(idx, 'exam', e.target.value)}
                                placeholder="এসএসসি / স্নাতক"
                                className="w-full p-2 border border-stone-200 rounded-xl bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'বিষয় / বিভাগ' : 'Group / Subject'}</label>
                              <input
                                type="text"
                                value={edu.groupSubject}
                                onChange={(e) => updateEducation(idx, 'groupSubject', e.target.value)}
                                placeholder="বিজ্ঞান / মানবিক / বাংলা"
                                className="w-full p-2 border border-stone-200 rounded-xl bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'বোর্ড / বিশ্ববিদ্যালয়' : 'Board / University'}</label>
                              <input
                                type="text"
                                value={edu.boardUniversity}
                                onChange={(e) => updateEducation(idx, 'boardUniversity', e.target.value)}
                                placeholder="ঢাকা বোর্ড / ঢাবি"
                                className="w-full p-2 border border-stone-200 rounded-xl bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'পাসের সন' : 'Year'}</label>
                              <input
                                type="text"
                                value={edu.passingYear}
                                onChange={(e) => updateEducation(idx, 'passingYear', e.target.value)}
                                placeholder="২০২০"
                                className="w-full p-2 border border-stone-200 rounded-xl bg-white font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'ফলাফল / GPA' : 'Result / CGPA'}</label>
                              <input
                                type="text"
                                value={edu.resultGpa}
                                onChange={(e) => updateEducation(idx, 'resultGpa', e.target.value)}
                                placeholder="৫.০০ / ৩.৮০"
                                className="w-full p-2 border border-stone-200 rounded-xl bg-white font-mono font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: Experience & Skills */}
                {currentStep === 4 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="border-b border-stone-200 pb-2 flex justify-between items-center">
                      <div>
                        <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-[#2E5942]" />
                          <span>{language === 'bn' ? '৪. পূর্ব অভিজ্ঞতা ও বিশেষ দক্ষতা' : '4. Work Experience & Skills'}</span>
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {language === 'bn' ? 'পূর্ববর্তী চাকরির বিবরণ ও প্রযুক্তিগত দক্ষতা উল্লেখ করুন (ঐচ্ছিক)।' : 'Add details of previous relevant work experience and skills.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addExperienceRow}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{language === 'bn' ? 'অভিজ্ঞতা যোগ' : 'Add Experience'}</span>
                      </button>
                    </div>

                    {/* Experiences */}
                    <div className="space-y-3">
                      {formData.experiences.map((exp, idx) => (
                        <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-700 text-xs">
                              💼 {language === 'bn' ? `প্রতিষ্ঠান / অভিজ্ঞতা ${idx + 1}:` : `Company / Experience ${idx + 1}:`}
                            </span>
                            {formData.experiences.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperienceRow(idx)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Company Name'}</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                placeholder="প্রতিষ্ঠানের নাম ও ঠিকানা"
                                className="w-full p-2 border border-stone-200 rounded-xl bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'পদবি' : 'Designation'}</label>
                              <input
                                type="text"
                                value={exp.designation}
                                onChange={(e) => updateExperience(idx, 'designation', e.target.value)}
                                placeholder="পদবি"
                                className="w-full p-2 border border-stone-200 rounded-xl bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'হতে' : 'From'}</label>
                                <input
                                  type="text"
                                  value={exp.fromYear}
                                  onChange={(e) => updateExperience(idx, 'fromYear', e.target.value)}
                                  placeholder="২০২২"
                                  className="w-full p-2 border border-stone-200 rounded-xl bg-white font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'পর্যন্ত' : 'To'}</label>
                                <input
                                  type="text"
                                  value={exp.toYear}
                                  onChange={(e) => updateExperience(idx, 'toYear', e.target.value)}
                                  placeholder="বর্তমান"
                                  className="w-full p-2 border border-stone-200 rounded-xl bg-white font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Special skills & Cover letter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কম্পিউটার ও প্রযুক্তিগত দক্ষতা' : 'Computer & Technical Skills'}</label>
                        <input
                          type="text"
                          value={formData.computer_skills}
                          onChange={(e) => setFormData({ ...formData, computer_skills: e.target.value })}
                          placeholder="এমএস ওয়ার্ড, এক্সেল, টাইপিং..."
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ভাষা ও অন্যান্য দক্ষতা' : 'Language & Other Skills'}</label>
                        <input
                          type="text"
                          value={formData.language_skills}
                          onChange={(e) => setFormData({ ...formData, language_skills: e.target.value })}
                          placeholder="বাংলা, ইংরেজি..."
                          className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত বক্তব্য / কভার লেটার' : 'Brief Statement / Cover Letter'}</label>
                      <textarea
                        rows={3}
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        placeholder={language === 'bn' ? 'এই পদে কাজের আগ্রহ এবং আপনার উপযুক্ততা সম্পর্কে সংক্ষেপে লিখুন।' : 'Write brief remarks about your interest in this role.'}
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-50 leading-relaxed"
                      />
                    </div>

                    {/* Two References */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <span className="font-bold text-stone-800 text-xs block">
                        👥 {language === 'bn' ? 'প্রত্যয়নকারী / রেফারেন্স (২ জন বিশিষ্ট ব্যক্তি):' : 'Two References (Non-relatives):'}
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.references.map((ref, rIdx) => (
                          <div key={rIdx} className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                            <span className="text-[11px] font-bold text-stone-700 block">
                              রেফারেন্স {rIdx + 1}:
                            </span>
                            <input
                              type="text"
                              value={ref.name}
                              onChange={(e) => updateReference(rIdx, 'name', e.target.value)}
                              placeholder="নাম"
                              className="w-full p-1.5 border border-stone-200 rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              value={ref.designation}
                              onChange={(e) => updateReference(rIdx, 'designation', e.target.value)}
                              placeholder="পদবি ও প্রতিষ্ঠান"
                              className="w-full p-1.5 border border-stone-200 rounded-lg text-xs"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="tel"
                                value={ref.phone}
                                onChange={(e) => updateReference(rIdx, 'phone', e.target.value)}
                                placeholder="মোবাইল নম্বর"
                                className="w-full p-1.5 border border-stone-200 rounded-lg text-xs font-mono"
                              />
                              <input
                                type="text"
                                value={ref.relation}
                                onChange={(e) => updateReference(rIdx, 'relation', e.target.value)}
                                placeholder="সম্পর্ক"
                                className="w-full p-1.5 border border-stone-200 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Attachments, Photo & Declaration */}
                {currentStep === 5 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="border-b border-stone-200 pb-2">
                      <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#2E5942]" />
                        <span>{language === 'bn' ? '৫. ছবি, স্বাক্ষর ও সত্যতা ঘোষণা' : '5. Photograph, Signature & Declaration'}</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {language === 'bn' ? 'প্রার্থীর সাম্প্রতিক ছবি ও জীবনবৃত্তান্ত ফাইল সংযুক্ত করুন।' : 'Upload recent photograph, signature, and CV attachment.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo Upload */}
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                        <label className="font-bold text-stone-800 block text-xs">
                          📷 {language === 'bn' ? 'পাসপোর্ট সাইজের রঙিন ছবি *' : 'Passport Size Photo *'}
                        </label>

                        <div className="flex items-center gap-4">
                          <div className="w-20 h-24 border-2 border-dashed border-stone-300 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0">
                            {formData.photo_url ? (
                              <img src={formData.photo_url} alt="Photo" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-stone-400 text-center p-1 font-sans">ছবি নেই</span>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <label className="inline-block px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 800 * 1024) {
                                      alert(language === 'bn' ? 'ছবির সাইজ ৮০০ কেবির কম হতে হবে।' : 'Photo must be under 800 KB.');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <span>{formData.photo_url ? (language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Photo') : (language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo')}</span>
                            </label>
                            <p className="text-[10px] text-stone-500">
                              {language === 'bn' ? 'সর্বোচ্চ ৮০০ KB (JPG/PNG)' : 'Max 800 KB (JPG/PNG)'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Signature Upload */}
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                        <label className="font-bold text-stone-800 block text-xs">
                          ✍️ {language === 'bn' ? 'প্রার্থীর স্বাক্ষর ফাইল (Signature)' : 'Candidate Signature'}
                        </label>

                        <div className="flex items-center gap-4">
                          <div className="w-24 h-16 border-2 border-dashed border-stone-300 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 p-1">
                            {formData.signature_url ? (
                              <img src={formData.signature_url} alt="Signature" className="max-h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-stone-400 text-center font-sans">স্বাক্ষর নেই</span>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <label className="inline-block px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 500 * 1024) {
                                      alert(language === 'bn' ? 'স্বাক্ষর ফাইলের সাইজ ৫০০ কেবির কম হতে হবে।' : 'Signature must be under 500 KB.');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      setFormData(prev => ({ ...prev, signature_url: reader.result as string }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <span>{formData.signature_url ? (language === 'bn' ? 'স্বাক্ষর পরিবর্তন' : 'Change') : (language === 'bn' ? 'স্বাক্ষর আপলোড' : 'Upload Signature')}</span>
                            </label>
                            <p className="text-[10px] text-stone-500">
                              {language === 'bn' ? 'সর্বোচ্চ ৫০০ KB' : 'Max 500 KB'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resume Attachment */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <label className="font-bold text-stone-800 block text-xs">
                        📄 {language === 'bn' ? 'জীবনবৃত্তান্ত ফাইল সংযুক্তি (CV / Resume PDF) *' : 'Attach CV / Resume Document (PDF) *'}
                      </label>

                      <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white hover:bg-stone-50 transition text-center">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 950 * 1024) {
                                alert(language === 'bn' ? 'ফাইল সাইজ অবশ্যই ৯৫০ কেবির কম হতে হবে।' : 'File size must be under 950 KB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                setFormData(prev => ({
                                  ...prev,
                                  resume_url: reader.result as string,
                                  resume_type: file.type.startsWith('image/') ? 'image' : 'pdf',
                                  resume_name: file.name
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Upload className="h-6 w-6 text-stone-400 mb-1 pointer-events-none" />
                        <p className="text-xs text-stone-700 font-bold pointer-events-none">
                          {formData.resume_name ? formData.resume_name : (language === 'bn' ? 'পিডিএফ অথবা ইমেজ সিভি আপলোড করুন' : 'Click to select CV Document')}
                        </p>
                        <p className="text-[10px] text-stone-400 pointer-events-none">
                          {language === 'bn' ? 'সর্বোচ্চ ৯৫০ KB' : 'Max 950 KB'}
                        </p>
                      </div>
                    </div>

                    {/* Declaration Section */}
                    <div className="p-4 bg-[#FAF7F2] border border-[#B8862A]/40 rounded-2xl space-y-3 font-sans">
                      <span className="font-bold text-[#8C6212] text-xs block">
                        ⚖️ {language === 'bn' ? 'প্রার্থীর অঙ্গীকারনামা ও সত্যতা ঘোষণা:' : 'Applicant Declaration of Truth:'}
                      </span>
                      
                      <p className="text-stone-700 leading-relaxed text-[11px] text-justify">
                        &ldquo;আমি এই মর্মে প্রত্যয়ন করছি যে, এই আবেদনপত্রে বর্ণিত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। কোনো তথ্য অসত্য, ত্রুটিপূর্ণ বা গোপন করা হয়েছে মর্মে প্রমাণিত হলে কর্তৃপক্ষ কর্তৃক যেকোনো আইনানুগ ব্যবস্থা গ্রহণ করা যাবে।&rdquo;
                      </p>

                      <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.declaration_accepted}
                          onChange={(e) => setFormData({ ...formData, declaration_accepted: e.target.checked })}
                          className="mt-0.5 rounded text-[#2E5942] focus:ring-[#2E5942] h-4 w-4"
                          required
                        />
                        <span className="text-xs font-bold text-stone-900">
                          {language === 'bn' ? 'আমি উপরোক্ত অঙ্গীকারনামা পড়েছি এবং সম্পূর্ণ সম্মতি জ্ঞাপন করছি।' : 'I have read and fully agree to the declaration statement.'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Stepper Bottom Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200 select-none">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>{language === 'bn' ? 'পূর্ববর্তী ধাপ' : 'Previous Step'}</span>
                    </button>
                  ) : <div />}

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep(currentStep)) {
                          setCurrentStep(prev => prev + 1);
                        }
                      }}
                      className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.declaration_accepted}
                      className={`px-7 py-2.5 rounded-xl text-white font-bold transition shadow-md flex items-center gap-2 ${
                        isSubmitting || !formData.declaration_accepted
                          ? 'bg-stone-300 cursor-not-allowed opacity-60'
                          : 'bg-[#2E5942] hover:bg-[#1E3B2C] cursor-pointer'
                      }`}
                    >
                      <span>{isSubmitting ? (language === 'bn' ? 'আবেদন জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'চূড়ান্ত আবেদন জমা দিন' : 'Submit Final Application')}</span>
                    </button>
                  )}
                </div>

              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* Official Print View Modal */}
      {showPrintModal && submittedApp && (
        <OfficialJobApplicationPrintModal
          application={submittedApp}
          language={language}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </>
  );
}
