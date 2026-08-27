import React from 'react';
import { JobApplication, Language } from '../types';
import { Printer, X, Download, CheckCircle2, Building2, User, Phone, Mail, FileText } from 'lucide-react';

interface OfficialJobApplicationPrintModalProps {
  application: JobApplication | null;
  language: Language;
  onClose: () => void;
}

export default function OfficialJobApplicationPrintModal({
  application,
  language,
  onClose
}: OfficialJobApplicationPrintModalProps) {
  if (!application) return null;

  const handlePrint = () => {
    window.print();
  };

  const ssc = application.educations?.find(e => e.exam.toLowerCase().includes('ssc') || e.exam.includes('এসএসসি') || e.exam.includes('দাখিল'));
  const hsc = application.educations?.find(e => e.exam.toLowerCase().includes('hsc') || e.exam.includes('এইচএসসি') || e.exam.includes('আলিম'));
  const grad = application.educations?.find(e => e.exam.toLowerCase().includes('honours') || e.exam.toLowerCase().includes('degree') || e.exam.toLowerCase().includes('bba') || e.exam.toLowerCase().includes('bsc') || e.exam.toLowerCase().includes('ba') || e.exam.includes('স্নাতক'));
  const masters = application.educations?.find(e => e.exam.toLowerCase().includes('masters') || e.exam.toLowerCase().includes('mba') || e.exam.toLowerCase().includes('msc') || e.exam.toLowerCase().includes('ma') || e.exam.includes('স্নাতকোত্তর'));

  const otherEdu = application.educations?.filter(e => e !== ssc && e !== hsc && e !== grad && e !== masters) || [];

  const dateStr = application.createdAt?.seconds
    ? new Date(application.createdAt.seconds * 1000).toLocaleDateString('bn-BD')
    : (application.createdAt ? new Date(application.createdAt).toLocaleDateString('bn-BD') : 'আজ');

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-[100000] overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto border border-stone-200 print:max-w-none print:w-full print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Action Header (Hidden in Print) */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between sticky top-0 z-20 print:hidden border-b border-stone-800">
          <div className="flex items-center gap-3">
            <span className="bg-[#B8862A] text-stone-950 font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              {language === 'bn' ? 'অফিসিয়াল চাকরির আবেদন ফরম' : 'Official Application Form'}
            </span>
            <span className="text-stone-300 text-xs font-mono">
              ID: {application.trackingId || application.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{language === 'bn' ? 'প্রিন্ট / PDF সংরক্ষণ' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Form Body */}
        <div id="official-job-print-area" className="p-6 sm:p-10 font-serif text-stone-900 text-xs sm:text-sm leading-relaxed space-y-6 print:p-4 print:text-black">
          
          {/* Organization Header */}
          <div className="text-center space-y-1.5 border-b-2 border-stone-800 pb-4 relative">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#1A1207] font-serif">
              বিশ্বসাহিত্য কেন্দ্র
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-700 font-sans">
              ১৪ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা-১০০০ | ফোন: ০২-২২২২৬৩৮০৫ | ইমেইল: info@bskbd.org | ওয়েব: www.bskbd.org
            </p>
            <div className="pt-2">
              <span className="inline-block bg-stone-100 print:bg-transparent border-2 border-stone-900 px-6 py-1 font-bold text-sm sm:text-base uppercase tracking-wider rounded-sm">
                চাকরির আবেদন ফরম
              </span>
            </div>
            
            {/* Top Right Meta Box */}
            <div className="mt-3 flex justify-between items-end text-left text-[11px] font-sans border-t border-stone-200 pt-2">
              <div className="space-y-0.5">
                <p><span className="font-bold">ট্র্যাকিং নম্বর (Tracking ID):</span> <span className="font-mono font-bold text-stone-900">{application.trackingId || application.id}</span></p>
                <p><span className="font-bold">আবেদনের তারিখ:</span> {dateStr}</p>
                {application.circularRefNo && <p><span className="font-bold">স্মারক নং:</span> {application.circularRefNo}</p>}
              </div>

              {/* Passport Photo Box */}
              <div className="w-24 h-28 border-2 border-dashed border-stone-800 flex flex-col items-center justify-center bg-stone-50 overflow-hidden text-center shrink-0">
                {application.photo_url ? (
                  <img 
                    src={application.photo_url} 
                    alt="Applicant Photo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-1 text-[9px] text-stone-400 font-sans">
                    <span>পাসপোর্ট সাইজের রঙিন ছবি</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Structured Table */}
          <div className="border border-stone-800 font-sans text-xs divide-y divide-stone-300">
            
            {/* 1. Post Applied For */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">১</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">আবেদনকৃত পদের নাম:</div>
              <div className="col-span-7 p-2 font-bold font-serif text-sm text-stone-950">
                {application.position_bn || application.jobTitleBn || 'N/A'} {application.position_en ? `(${application.position_en})` : ''}
              </div>
            </div>

            {/* 2. Applicant Name */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">২</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">প্রার্থীর নাম:</div>
              <div className="col-span-7 p-2 space-y-1">
                <p><span className="text-stone-500 font-normal">বাংলায়: </span><span className="font-bold text-stone-900">{application.name_bn || application.name || 'N/A'}</span></p>
                <p><span className="text-stone-500 font-normal">ইংরেজিতে (CAPITAL): </span><span className="font-bold font-mono uppercase text-stone-900">{application.name_en || 'N/A'}</span></p>
              </div>
            </div>

            {/* 3. NID & Birth Certificate */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">৩</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নং:</div>
              <div className="col-span-7 p-2 font-mono font-bold">
                {application.nid_number || application.birth_reg_number || 'N/A'}
              </div>
            </div>

            {/* 4. DOB & Age */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">৪</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">জন্ম তারিখ ও বয়স:</div>
              <div className="col-span-7 p-2">
                <span className="font-bold">জন্ম তারিখ: </span>{application.dob || 'N/A'} | 
                <span className="font-bold ml-2">বয়স: </span>
                {application.age_years ? `${application.age_years} বছর, ${application.age_months || '০'} মাস, ${application.age_days || '০'} দিন` : 'N/A'}
              </div>
            </div>

            {/* 5. Birth District */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">৫</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">জন্মস্থান (নিজ জেলা):</div>
              <div className="col-span-7 p-2 font-bold">
                {application.birth_district || 'N/A'}
              </div>
            </div>

            {/* 6. Parents Name */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">৬</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">পিতা ও মাতার নাম:</div>
              <div className="col-span-7 p-2 space-y-1">
                <p><span className="text-stone-500 font-normal">পিতার নাম: </span><span className="font-bold">{application.father_name_bn || 'N/A'}</span> {application.father_name_en ? `(${application.father_name_en})` : ''}</p>
                <p><span className="text-stone-500 font-normal">মাতার নাম: </span><span className="font-bold">{application.mother_name_bn || 'N/A'}</span> {application.mother_name_en ? `(${application.mother_name_en})` : ''}</p>
              </div>
            </div>

            {/* 7. Spouse */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">৭</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">স্বামী/স্ত্রীর নাম (প্রযোজ্য ক্ষেত্রে):</div>
              <div className="col-span-7 p-2">
                {application.spouse_name || 'প্রযোজ্য নয় / অবিবাহিত'}
              </div>
            </div>

            {/* 8. Addresses */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">৮</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">যোগাযোগের ঠিকানা:</div>
              <div className="col-span-7 p-2 space-y-2">
                <div>
                  <p className="font-bold text-stone-700 underline text-[11px]">বর্তমান ঠিকানা (Present Address):</p>
                  <p className="leading-normal">
                    {application.present_village_road ? `${application.present_village_road}, ` : ''}
                    {application.present_post_office ? `ডাকঘর: ${application.present_post_office}-${application.present_post_code || ''}, ` : ''}
                    {application.present_upazila ? `উপজেলা: ${application.present_upazila}, ` : ''}
                    {application.present_district ? `জেলা: ${application.present_district}` : ''}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-stone-700 underline text-[11px]">স্থায়ী ঠিকানা (Permanent Address):</p>
                  <p className="leading-normal">
                    {application.permanent_village_road ? `${application.permanent_village_road}, ` : ''}
                    {application.permanent_post_office ? `ডাকঘর: ${application.permanent_post_office}-${application.permanent_post_code || ''}, ` : ''}
                    {application.permanent_upazila ? `উপজেলা: ${application.permanent_upazila}, ` : ''}
                    {application.permanent_district ? `জেলা: ${application.permanent_district}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Contact Info */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">৯</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">ফোন ও ইমেইল:</div>
              <div className="col-span-7 p-2 space-y-0.5">
                <p><span className="font-bold">মোবাইল নম্বর: </span><span className="font-mono font-bold">{application.phone}</span> {application.emergency_phone ? `(জরুরি: ${application.emergency_phone})` : ''}</p>
                <p><span className="font-bold">ইমেইল: </span><span className="font-mono">{application.email}</span></p>
              </div>
            </div>

            {/* 10. General particulars */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">১০</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">জাতীয়তা, ধর্ম, লিঙ্গ ও কোটা:</div>
              <div className="col-span-7 p-2 grid grid-cols-2 gap-1 text-[11px]">
                <p><span className="font-bold">জাতীয়তা: </span>{application.nationality || 'বাংলাদেশী'}</p>
                <p><span className="font-bold">ধর্ম: </span>{application.religion || 'N/A'}</p>
                <p><span className="font-bold">লিঙ্গ: </span>{application.gender === 'female' ? 'মহিলা' : (application.gender === 'male' ? 'পুরুষ' : 'অন্যান্য')}</p>
                <p><span className="font-bold">কোটা: </span>{application.quota === 'freedom_fighter' ? 'বীর মুক্তিযোদ্ধা কোটা' : (application.quota === 'disabled' ? 'শারীরিক প্রতিবন্ধী' : (application.quota === 'ethnic' ? 'ক্ষুদ্র নৃ-গোষ্ঠী' : 'সাধারণ'))}</p>
              </div>
            </div>

            {/* 11. Educational Qualifications Table */}
            <div className="p-0">
              <div className="bg-stone-100 p-2 font-bold border-b border-stone-300 flex items-center justify-between">
                <span>১১. শিক্ষাগত যোগ্যতার বিবরণ (Educational Qualifications):</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left divide-y divide-stone-300 text-[11px]">
                  <thead className="bg-stone-50 font-bold">
                    <tr className="divide-x divide-stone-300">
                      <th className="p-1.5 text-center w-10">ক্রমিক</th>
                      <th className="p-1.5">পরীক্ষার নাম</th>
                      <th className="p-1.5">বিষয় / গ্রুপ</th>
                      <th className="p-1.5">বোর্ড / বিশ্ববিদ্যালয়</th>
                      <th className="p-1.5 text-center">পাসের সন</th>
                      <th className="p-1.5 text-center">প্রাপ্ত শ্রেণি / জিপিএ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {application.educations && application.educations.length > 0 ? (
                      application.educations.map((edu, idx) => (
                        <tr key={idx} className="divide-x divide-stone-300">
                          <td className="p-1.5 text-center font-bold">{idx + 1}</td>
                          <td className="p-1.5 font-bold">{edu.exam || 'N/A'}</td>
                          <td className="p-1.5">{edu.groupSubject || 'N/A'}</td>
                          <td className="p-1.5">{edu.boardUniversity || 'N/A'}</td>
                          <td className="p-1.5 text-center font-mono">{edu.passingYear || 'N/A'}</td>
                          <td className="p-1.5 text-center font-mono font-bold">{edu.resultGpa || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-3 text-center text-stone-400">কোনো শিক্ষাগত তথ্য নেই</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 12. Experience Details Table */}
            {application.experiences && application.experiences.length > 0 && (
              <div className="p-0">
                <div className="bg-stone-100 p-2 font-bold border-b border-stone-300">
                  <span>১২. পূর্ববর্তী কর্মঅভিজ্ঞতার বিবরণ (Work Experience):</span>
                </div>
                <table className="w-full text-left divide-y divide-stone-300 text-[11px]">
                  <thead className="bg-stone-50 font-bold">
                    <tr className="divide-x divide-stone-300">
                      <th className="p-1.5 text-center w-10">ক্রমিক</th>
                      <th className="p-1.5">প্রতিষ্ঠানের নাম ও ঠিকানা</th>
                      <th className="p-1.5">পদবি</th>
                      <th className="p-1.5 text-center">সময়কাল (হতে - পর্যন্ত)</th>
                      <th className="p-1.5">প্রধান দায়িত্বসমূহ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {application.experiences.map((exp, idx) => (
                      <tr key={idx} className="divide-x divide-stone-300">
                        <td className="p-1.5 text-center font-bold">{idx + 1}</td>
                        <td className="p-1.5 font-bold">{exp.company || 'N/A'}</td>
                        <td className="p-1.5">{exp.designation || 'N/A'}</td>
                        <td className="p-1.5 text-center font-mono">{exp.fromYear} - {exp.toYear}</td>
                        <td className="p-1.5">{exp.responsibilities || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 13. Special Skills */}
            <div className="grid grid-cols-12 divide-x divide-stone-300">
              <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">১৩</div>
              <div className="col-span-4 p-2 font-bold bg-stone-50">বিশেষ দক্ষতা ও প্রশিক্ষণ:</div>
              <div className="col-span-7 p-2 space-y-1">
                <p><span className="font-bold">কম্পিউটার ও টাইপিং দক্ষতা: </span>{application.computer_skills || 'N/A'}</p>
                {application.language_skills && <p><span className="font-bold">ভাষা দক্ষতা: </span>{application.language_skills}</p>}
                {application.other_skills && <p><span className="font-bold">অন্যান্য দক্ষতা: </span>{application.other_skills}</p>}
              </div>
            </div>

            {/* 14. References */}
            <div className="p-0">
              <div className="bg-stone-100 p-2 font-bold border-b border-stone-300">
                <span>১৪. প্রত্যয়নকারী / রেফারেন্স (References of Two Non-Relatives):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 p-2 gap-2 text-[11px]">
                {application.references && application.references.length > 0 ? (
                  application.references.map((ref, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-stone-800">রেফারেন্স {idx + 1}: {ref.name || 'N/A'}</p>
                      <p><span className="text-stone-500">পদবি ও প্রতিষ্ঠান:</span> {ref.designation || 'N/A'}</p>
                      <p><span className="text-stone-500">মোবাইল:</span> <span className="font-mono font-bold">{ref.phone || 'N/A'}</span> {ref.email ? `| ইমেইল: ${ref.email}` : ''}</p>
                      <p><span className="text-stone-500">সম্পর্ক:</span> {ref.relation || 'N/A'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-400 p-2">কোনো রেফারেন্স পাওয়া যায়নি</p>
                )}
              </div>
            </div>

            {/* 15. Remarks / Cover letter if any */}
            {application.coverLetter && (
              <div className="grid grid-cols-12 divide-x divide-stone-300">
                <div className="col-span-1 p-2 font-bold bg-stone-100 text-center">১৫</div>
                <div className="col-span-4 p-2 font-bold bg-stone-50">সংক্ষিপ্ত বক্তব্য / কভার লেটার:</div>
                <div className="col-span-7 p-2 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {application.coverLetter}
                </div>
              </div>
            )}

          </div>

          {/* Declaration Section */}
          <div className="border border-stone-800 p-4 space-y-3 bg-stone-50 print:bg-transparent font-sans text-xs">
            <h4 className="font-bold text-center text-sm border-b border-stone-300 pb-1">
              প্রার্থীর অঙ্গীকারনামা ও ঘোষণা (Applicant Declaration)
            </h4>
            <p className="text-justify leading-relaxed text-[11px]">
              &ldquo;আমি এই মর্মে অঙ্গীকার করছি যে, উপরে বর্ণিত সকল তথ্য সম্পূর্ণ সত্য ও নির্ভুল। নিয়োগের পূর্ববর্তী বা পরবর্তী যেকোনো সময়ে কোনো তথ্য অসত্য, ত্রুটিপূর্ণ বা বিভ্রান্তিকর প্রমাণিত হলে আমার এই আবেদনপত্র অথবা নিয়োগপত্র সরাসরি বাতিল বলে গণ্য হবে এবং আমার বিরুদ্ধে প্রতিষ্ঠান বা আইনের বিধান অনুযায়ী যেকোনো শাস্তিমূলক ব্যবস্থা গ্রহণ করা যাবে।&rdquo;
            </p>

            <div className="pt-8 flex justify-between items-end text-[11px]">
              <div>
                <p><span className="font-bold">স্থান:</span> {application.applicant_place || application.birth_district || 'ঢাকা'}</p>
                <p><span className="font-bold">তারিখ:</span> {dateStr}</p>
              </div>

              <div className="text-center space-y-1">
                {application.signature_url ? (
                  <div className="h-10 max-w-[140px] mx-auto flex items-center justify-center">
                    <img src={application.signature_url} alt="Signature" className="max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="h-8 border-b border-stone-400 w-36 mx-auto"></div>
                )}
                <p className="border-t border-stone-800 pt-1 font-bold">
                  প্রার্থীর স্বাক্ষর
                </p>
              </div>
            </div>
          </div>

          {/* Official Verification Box (For Office Use Only) */}
          <div className="border-2 border-stone-800 p-3 space-y-2 text-[10px] font-sans bg-stone-100/50 print:bg-transparent">
            <div className="flex justify-between items-center border-b border-stone-400 pb-1">
              <span className="font-bold uppercase tracking-wider">কেবলমাত্র কর্তৃপক্ষের ব্যবহারের জন্য (For Official Scrutiny Only)</span>
              <span className="font-mono">যাচাই স্থিতি: {application.status?.toUpperCase() || 'RECEIVED'}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="border border-stone-300 p-2 min-h-[60px] flex flex-col justify-between">
                <span className="text-stone-500">আবেদন যাচাইকারী কর্মকর্তার স্বাক্ষর</span>
                <span className="border-t border-dashed border-stone-400 pt-1">স্বাক্ষর ও সীল</span>
              </div>
              <div className="border border-stone-300 p-2 min-h-[60px] flex flex-col justify-between">
                <span className="text-stone-500">প্রাথমিক বাছাই কমিটির মন্তব্য</span>
                <span className="font-bold">{application.admin_notes || 'যোগ্য / বিবেচনাধীন'}</span>
              </div>
              <div className="border border-stone-300 p-2 min-h-[60px] flex flex-col justify-between">
                <span className="text-stone-500">অনুমোদনকারী কর্তৃপক্ষের স্বাক্ষর</span>
                <span className="border-t border-dashed border-stone-400 pt-1">স্বাক্ষর ও তারিখ</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center sticky bottom-0 z-20 print:hidden font-sans">
          <p className="text-xs text-stone-500">
            {language === 'bn' ? 'A4 সাইজে প্রিন্ট নেওয়ার জন্য উপযুক্ত মার্জিন কনফিগার করা আছে।' : 'Formatted for standard A4 document printing.'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{language === 'bn' ? 'প্রিন্ট / PDF হিসেবে সংরক্ষণ করুন' : 'Print / Save as PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
