import * as XLSX from 'xlsx';
import { JobApplication } from '../types';

export function exportJobApplicationsToExcel(
  applications: JobApplication[],
  customFilename?: string
) {
  if (!applications || applications.length === 0) {
    alert('কোনো আবেদনপত্র ডাটা পাওয়া যায়নি!');
    return;
  }

  // Map application objects into rich, clean table rows with clear Bengali/English column titles
  const dataRows = applications.map((app, index) => {
    // Parse educations if string or array
    const edList: any[] = Array.isArray(app.educations)
      ? app.educations
      : (typeof app.educations === 'string'
          ? (() => { try { const p = JSON.parse(app.educations); return Array.isArray(p) ? p : []; } catch (_) { return []; } })()
          : []);

    const expList: any[] = Array.isArray(app.experiences)
      ? app.experiences
      : (typeof app.experiences === 'string'
          ? (() => { try { const p = JSON.parse(app.experiences); return Array.isArray(p) ? p : []; } catch (_) { return []; } })()
          : []);

    const refList: any[] = Array.isArray(app.references)
      ? app.references
      : (typeof app.references === 'string'
          ? (() => { try { const p = JSON.parse(app.references); return Array.isArray(p) ? p : []; } catch (_) { return []; } })()
          : []);

    const ssc = edList.find(e => e?.exam && (String(e.exam).toLowerCase().includes('ssc') || String(e.exam).includes('এসএসসি') || String(e.exam).includes('দাখিল'))) || edList[0];
    const hsc = edList.find(e => e?.exam && (String(e.exam).toLowerCase().includes('hsc') || String(e.exam).includes('এইচএসসি') || String(e.exam).includes('আলিম'))) || edList[1];
    const grad = edList.find(e => e?.exam && (String(e.exam).toLowerCase().includes('honours') || String(e.exam).toLowerCase().includes('degree') || String(e.exam).toLowerCase().includes('bba') || String(e.exam).toLowerCase().includes('bsc') || String(e.exam).toLowerCase().includes('ba') || String(e.exam).includes('স্নাতক'))) || edList[2];
    const masters = edList.find(e => e?.exam && (String(e.exam).toLowerCase().includes('masters') || String(e.exam).toLowerCase().includes('mba') || String(e.exam).toLowerCase().includes('msc') || String(e.exam).toLowerCase().includes('ma') || String(e.exam).includes('স্নাতকোত্তর'))) || edList[3];

    // Format experiences
    const expSummary = expList.length > 0
      ? expList.map((exp, i) => `[${i+1}] ${exp.company || ''} (${exp.designation || ''}, ${exp.fromYear || ''} - ${exp.toYear || ''})`).join(' | ')
      : 'N/A';

    // Format references
    const ref1 = refList[0] ? `${refList[0].name || ''} (${refList[0].designation || ''}, মোবা: ${refList[0].phone || ''})` : 'N/A';
    const ref2 = refList[1] ? `${refList[1].name || ''} (${refList[1].designation || ''}, মোবা: ${refList[1].phone || ''})` : 'N/A';

    // Format date
    const dateStr = app.createdAt?.seconds
      ? new Date(app.createdAt.seconds * 1000).toLocaleString('bn-BD')
      : (app.createdAt ? new Date(app.createdAt).toLocaleString('bn-BD') : 'N/A');

    // Status in Bengali
    let statusBn = 'নতুন / অমূল্যায়িত';
    if (app.status === 'shortlisted') statusBn = 'বাছাইকৃত (Shortlisted)';
    else if (app.status === 'interview') statusBn = 'মৌখিক পরীক্ষায় ডাকা হয়েছে (Interview)';
    else if (app.status === 'selected') statusBn = 'চূড়ান্ত নির্বাচিত (Selected)';
    else if (app.status === 'rejected') statusBn = 'বাতিল (Rejected)';

    return {
      'ক্রমিক নং': index + 1,
      'ট্র্যাকিং আইডি (Tracking ID)': app.trackingId || app.id,
      'পদের নাম (বাংলা)': app.position_bn || app.jobTitleBn || 'N/A',
      'পদের নাম (English)': app.position_en || app.jobTitleEn || 'N/A',
      'প্রার্থীর নাম (বাংলা)': app.name_bn || app.name || 'N/A',
      'প্রার্থীর নাম (English)': app.name_en || 'N/A',
      'পিতার নাম': app.father_name_bn || 'N/A',
      'মাতার নাম': app.mother_name_bn || 'N/A',
      'স্বামী/স্ত্রীর নাম': app.spouse_name || 'N/A',
      'জাতীয় পরিচয়পত্র (NID)': app.nid_number || 'N/A',
      'জন্ম নিবন্ধন নং': app.birth_reg_number || 'N/A',
      'জন্ম তারিখ': app.dob || 'N/A',
      'বয়স (বছর/মাস/দিন)': `${app.age_years || '০'} বছর, ${app.age_months || '০'} মাস, ${app.age_days || '০'} দিন`,
      'নিজ জেলা / জন্মস্থান': app.birth_district || 'N/A',
      'জাতীয়তা': app.nationality || 'বাংলাদেশী',
      'ধর্ম': app.religion || 'N/A',
      'লিঙ্গ': app.gender === 'female' ? 'মহিলা' : (app.gender === 'male' ? 'পুরুষ' : (app.gender || 'N/A')),
      'বৈবাহিক অবস্থা': app.marital_status === 'married' ? 'বিবাহিত' : (app.marital_status === 'single' ? 'অবিবাহিত' : (app.marital_status || 'N/A')),
      'কোটা': app.quota === 'freedom_fighter' ? 'মুক্তিযোদ্ধা কোটা' : (app.quota === 'disabled' ? 'প্রতিবন্ধী কোটা' : (app.quota === 'ethnic' ? 'ক্ষুদ্র নৃ-গোষ্ঠী' : (app.quota || 'সাধারণ'))),
      
      // Contact
      'মোবাইল নম্বর': app.phone || 'N/A',
      'জরুরি যোগাযোগ নম্বর': app.emergency_phone || 'N/A',
      'ইমেইল এড্রেস': app.email || 'N/A',
      'বর্তমান ঠিকানা': `${app.present_village_road || ''}, ডাকঘর: ${app.present_post_office || ''}-${app.present_post_code || ''}, থানা: ${app.present_upazila || ''}, জেলা: ${app.present_district || ''}`.replace(/^,\s*/, ''),
      'স্থায়ী ঠিকানা': `${app.permanent_village_road || ''}, ডাকঘর: ${app.permanent_post_office || ''}-${app.permanent_post_code || ''}, থানা: ${app.permanent_upazila || ''}, জেলা: ${app.permanent_district || ''}`.replace(/^,\s*/, ''),
      
      // Educations
      'এসএসসি / সমমান': ssc ? `${ssc.exam} (${ssc.groupSubject || 'N/A'}), বোর্ড: ${ssc.boardUniversity}, সন: ${ssc.passingYear}, GPA: ${ssc.resultGpa}` : 'N/A',
      'এইচএসসি / সমমান': hsc ? `${hsc.exam} (${hsc.groupSubject || 'N/A'}), বোর্ড: ${hsc.boardUniversity}, সন: ${hsc.passingYear}, GPA: ${hsc.resultGpa}` : 'N/A',
      'স্নাতক / ডিগ্রি': grad ? `${grad.exam} (${grad.groupSubject || 'N/A'}), প্রতিষ্ঠান: ${grad.boardUniversity}, সন: ${grad.passingYear}, CGPA: ${grad.resultGpa}` : 'N/A',
      'স্নাতকোত্তর': masters ? `${masters.exam} (${masters.groupSubject || 'N/A'}), প্রতিষ্ঠান: ${masters.boardUniversity}, সন: ${masters.passingYear}, CGPA: ${masters.resultGpa}` : 'N/A',
      
      // Experience & Skills
      'কাজের অভিজ্ঞতা': expSummary,
      'কম্পিউটার দক্ষতা': app.computer_skills || 'N/A',
      'ভাষা দক্ষতা': app.language_skills || 'N/A',
      'অন্যান্য দক্ষতা': app.other_skills || 'N/A',

      // References
      'রেফারেন্স ১': ref1,
      'রেফারেন্স ২': ref2,

      // Files
      'সিভি লিংক': app.resume_url || app.resumeUrl || 'N/A',
      'ছবি লিংক': app.photo_url || 'N/A',
      'স্বাক্ষর লিংক': app.signature_url || 'N/A',

      // Application Status & Notes
      'বর্তমান স্ট্যাটাস': statusBn,
      'অ্যাডমিন মন্তব্য / নোট': app.admin_notes || '',
      'আবেদনের তারিখ ও সময়': dateStr
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Set column widths for better readability
  const colWidths = [
    { wch: 8 },  // ক্রমিক
    { wch: 22 }, // ট্র্যাকিং আইডি
    { wch: 22 }, // পদের নাম
    { wch: 22 }, // পদের নাম En
    { wch: 22 }, // নাম
    { wch: 24 }, // নাম En
    { wch: 20 }, // পিতা
    { wch: 20 }, // মাতা
    { wch: 15 }, // স্বামী/স্ত্রী
    { wch: 18 }, // NID
    { wch: 18 }, // জন্ম নিবন্ধন
    { wch: 14 }, // DOB
    { wch: 20 }, // বয়স
    { wch: 14 }, // জেলা
    { wch: 12 }, // জাতীয়তা
    { wch: 12 }, // ধর্ম
    { wch: 10 }, // লিঙ্গ
    { wch: 14 }, // বৈবাহিক অবস্থা
    { wch: 16 }, // কোটা
    { wch: 15 }, // মোবাইল
    { wch: 15 }, // জরুরি
    { wch: 24 }, // ইমেইল
    { wch: 35 }, // বর্তমান ঠিকানা
    { wch: 35 }, // স্থায়ী ঠিকানা
    { wch: 30 }, // এসএসসি
    { wch: 30 }, // এইচএসসি
    { wch: 30 }, // স্নাতক
    { wch: 30 }, // স্নাতকোত্তর
    { wch: 35 }, // অভিজ্ঞতা
    { wch: 25 }, // কম্পিউটার
    { wch: 20 }, // ভাষা
    { wch: 20 }, // অন্যান্য
    { wch: 28 }, // রেফ ১
    { wch: 28 }, // রেফ ২
    { wch: 25 }, // সিভি
    { wch: 25 }, // ছবি
    { wch: 25 }, // স্বাক্ষর
    { wch: 20 }, // স্ট্যাটাস
    { wch: 25 }, // নোট
    { wch: 22 }, // তারিখ
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'আবেদনকারী তালিকা');

  const filename = customFilename 
    ? `${customFilename.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
    : `BSK_Job_Applications_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

export function exportJobApplicationsToCSV(
  applications: JobApplication[],
  customFilename?: string
) {
  if (!applications || applications.length === 0) {
    alert('কোনো আবেদনপত্র ডাটা পাওয়া যায়নি!');
    return;
  }

  const headers = [
    'ক্রমিক',
    'ট্র্যাকিং আইডি',
    'পদের নাম (বাংলা)',
    'পদের নাম (English)',
    'প্রার্থীর নাম (বাংলা)',
    'প্রার্থীর নাম (English)',
    'পিতার নাম',
    'মাতার নাম',
    'জাতীয় পরিচয়পত্র (NID)',
    'জন্ম তারিখ',
    'বয়স',
    'নিজ জেলা',
    'লিঙ্গ',
    'মোবাইল নম্বর',
    'ইমেইল',
    'বর্তমান ঠিকানা',
    'স্থায়ী ঠিকানা',
    'শিক্ষাগত যোগ্যতা (সারসংক্ষেপ)',
    'অভিজ্ঞতা',
    'কম্পিউটার দক্ষতা',
    'রেফারেন্স ১',
    'রেফারেন্স ২',
    'স্ট্যাটাস',
    'আবেদনের তারিখ'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows: string[] = [];
  // UTF-8 BOM
  const BOM = '\uFEFF';
  csvRows.push(headers.map(escapeCSV).join(','));

  applications.forEach((app, idx) => {
    const eduSummary = app.educations && app.educations.length > 0
      ? app.educations.map(e => `${e.exam} (${e.boardUniversity}, ${e.passingYear}, GPA: ${e.resultGpa})`).join('; ')
      : 'N/A';

    const expSummary = app.experiences && app.experiences.length > 0
      ? app.experiences.map(e => `${e.company} (${e.designation})`).join('; ')
      : 'N/A';

    const ref1 = app.references?.[0] ? `${app.references[0].name} (${app.references[0].phone})` : 'N/A';
    const ref2 = app.references?.[1] ? `${app.references[1].name} (${app.references[1].phone})` : 'N/A';

    const dateStr = app.createdAt?.seconds
      ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('bn-BD')
      : (app.createdAt ? new Date(app.createdAt).toLocaleDateString('bn-BD') : 'N/A');

    const row = [
      idx + 1,
      app.trackingId || app.id,
      app.position_bn || app.jobTitleBn || '',
      app.position_en || app.jobTitleEn || '',
      app.name_bn || app.name || '',
      app.name_en || '',
      app.father_name_bn || '',
      app.mother_name_bn || '',
      app.nid_number || '',
      app.dob || '',
      `${app.age_years || '০'} বছর`,
      app.birth_district || '',
      app.gender === 'female' ? 'মহিলা' : 'পুরুষ',
      app.phone || '',
      app.email || '',
      `${app.present_village_road || ''}, ${app.present_post_office || ''}, ${app.present_district || ''}`,
      `${app.permanent_village_road || ''}, ${app.permanent_post_office || ''}, ${app.permanent_district || ''}`,
      eduSummary,
      expSummary,
      app.computer_skills || '',
      ref1,
      ref2,
      app.status || 'new',
      dateStr
    ];

    csvRows.push(row.map(escapeCSV).join(','));
  });

  const csvContent = BOM + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = customFilename 
    ? `${customFilename.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    : `BSK_Job_Applications_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
