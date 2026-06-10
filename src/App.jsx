import React, { useState, useEffect } from 'react';
import {
  User,
  Translate,
  Belt,
  CalendarBlank,
  Phone,
  EnvelopeSimple,
  Ruler,
  Barbell,
  Globe,
  Buildings,
  MapTrifold,
  MapPinLine,
  GraduationCap,
  FirstAid,
  Heartbeat,
  Stethoscope,
  ClipboardText,
  Megaphone,
  PenNib,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  FileText,
  Check,
  CaretDown,
  Storefront,
  Clock,
  Users,
  PhoneCall,
  WarningCircle
} from '@phosphor-icons/react';

import SearchableSelect from './components/SearchableSelect';
import { cambodiaLocations, countryList, nationalityList } from './data/locations';
import { phnomPenhSchoolNames, phnomPenhSchools } from './data/schools';
import { relationshipList, relationshipTranslations } from './data/relationships';
import { i18n } from './data/translations';

const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL || "YOUR_GOOGLE_APP_SCRIPT_URL_HERE";

const dayGroups = [
  "Saturday - Sunday",
  "Tuesday - Wednesday",
  "Thursday - Friday"
];

const beltList = [
  "White",
  "Yellow",
  "Green",
  "Blue",
  "Red",
  "Black"
];

const weekendTimeSlots = [
  "7:00 - 9:00 AM",
  "9:30 - 11:30 AM",
  "1:00 - 3:00 PM",
  "3:30 - 5:30 PM",
  "6:00 - 8:00 PM"
];

const weekdayTimeSlots = [
  "7:00 - 8:30 AM (Kid Class)",
  "9:00 - 11:00 AM (General)",
  "1:00 - 3:00 PM (General)",
  "3:30 - 5:00 PM (Kid Class)",
  "6:00 - 8:00 PM (General)"
];

const cambodiaProvincesZh = {
  "Banteay Meanchey Province": "班迭棉吉省",
  "Battambang Province": "马德望省",
  "Kampong Cham Province": "磅湛省",
  "Kampong Chhnang Province": "磅清扬省",
  "Kampong Speu Province": "磅士卑省",
  "Kampong Thom Province": "磅同省",
  "Kampot Province": "贡布省",
  "Kandal Province": "干丹省",
  "Koh Kong Province": "国公省",
  "Kratie Province": "桔井省",
  "Mondul Kiri Province": "蒙多基里省",
  "Phnom Penh Capital": "金边市",
  "Preah Vihear Province": "柏威夏省",
  "Prey Veng Province": "波罗勉省",
  "Pursat Province": "菩萨省",
  "Ratanak Kiri Province": "拉达那基里省",
  "Siemreap Province": "暹粒省",
  "Preah Sihanouk Province": "西哈努克省",
  "Stung Treng Province": "上丁省",
  "Svay Rieng Province": "柴桢省",
  "Takeo Province": "茶胶省",
  "Oddar Meanchey Province": "奥多棉吉省",
  "Kep Province": "白马省",
  "Pailin Province": "拜林省",
  "Tboung Khmum Province": "特本克蒙省"
};

const countryTranslations = {
  en: {
    "Cambodia": "Cambodia",
    "China": "China",
    "South Korea": "South Korea",
    "North Korea": "North Korea",
    "Vietnam": "Vietnam",
    "Thailand": "Thailand",
    "United States": "United States",
    "France": "France",
    "United Kingdom": "United Kingdom",
    "Japan": "Japan",
    "Australia": "Australia",
    "Canada": "Canada",
    "Germany": "Germany",
    "Singapore": "Singapore",
    "Malaysia": "Malaysia",
    "Philippines": "Philippines",
    "Russia": "Russia",
    "India": "India"
  },
  km: {
    "Cambodia": "កម្ពុជា",
    "China": "ចិន",
    "South Korea": "កូរ៉េខាងត្បូង",
    "North Korea": "កូរ៉េខាងជើង",
    "Vietnam": "វៀតណាម",
    "Thailand": "ថៃ",
    "United States": "សហរដ្ឋអាមេរិក",
    "France": "បារាំង",
    "United Kingdom": "ចក្រភពអង់គ្លេស",
    "Japan": "ជប៉ុន",
    "Australia": "អូស្ត្រាលី",
    "Canada": "កាណាដា",
    "Germany": "អាល្លឺម៉ង់",
    "Singapore": "សិង្ហបុរី",
    "Malaysia": "ម៉ាឡេស៊ី",
    "Philippines": "ហ្វីលីពិន",
    "Russia": "រុស្ស៊ី",
    "India": "ឥណ្ឌា"
  },
  zh: {
    "Cambodia": "柬埔寨",
    "China": "中国",
    "South Korea": "韩国",
    "North Korea": "朝鲜",
    "Vietnam": "越南",
    "Thailand": "泰国",
    "United States": "美国",
    "France": "法国",
    "United Kingdom": "英国",
    "Japan": "日本",
    "Australia": "澳大利亚",
    "Canada": "加拿大",
    "Germany": "德国",
    "Singapore": "新加坡",
    "Malaysia": "马来西亚",
    "Philippines": "菲律宾",
    "Russia": "俄罗斯",
    "India": "印度"
  }
};

const nationalityTranslations = {
  en: {
    "Cambodian": "Cambodian",
    "Chinese": "Chinese",
    "Korean": "Korean",
    "South Korean": "South Korean",
    "North Korean": "North Korean",
    "Vietnamese": "Vietnamese",
    "Thai": "Thai",
    "American": "American",
    "French": "French",
    "British": "British",
    "Japanese": "Japanese",
    "Australian": "Australian",
    "Canadian": "Canadian",
    "German": "German",
    "Singaporean": "Singaporean",
    "Malaysian": "Malaysian",
    "Filipino": "Filipino",
    "Russian": "Russian",
    "Indian": "Indian"
  },
  km: {
    "Cambodian": "ខ្មែរ",
    "Chinese": "ចិន",
    "Korean": "កូរ៉េ",
    "South Korean": "កូរ៉េខាងត្បូង",
    "North Korean": "កូរ៉េខាងជើង",
    "Vietnamese": "វៀតណាម",
    "Thai": "ថៃ",
    "American": "អាមេរិកាំង",
    "French": "បារាំង",
    "British": "អង់គ្លេស",
    "Japanese": "ជប៉ុន",
    "Australian": "អូស្ត្រាលី",
    "Canadian": "កាណាដា",
    "German": "អាល្លឺម៉ង់",
    "Singaporean": "សិង្ហបុរី",
    "Malaysian": "ម៉ាឡេស៊ី",
    "Filipino": "ហ្វីលីពីន",
    "Russian": "រុស្ស៊ី",
    "Indian": "ឥណ្ឌា"
  },
  zh: {
    "Cambodian": "柬埔寨籍",
    "Chinese": "中国籍",
    "Korean": "韩国籍",
    "South Korean": "韩国籍",
    "North Korean": "朝鲜籍",
    "Vietnamese": "越南籍",
    "Thai": "泰国籍",
    "American": "美国籍",
    "French": "法国籍",
    "British": "英国籍",
    "Japanese": "日本籍",
    "Australian": "澳大利亚籍",
    "Canadian": "加拿大籍",
    "German": "德国籍",
    "Singaporean": "新加坡籍",
    "Malaysian": "马来西亚籍",
    "Filipino": "菲律宾籍",
    "Russian": "俄罗斯籍",
    "Indian": "印度籍"
  }
};

const linksData = [
  { name: 'Facebook', url: 'https://www.facebook.com/infinity.tkd.kh/', icon: 'fab fa-facebook-f', subtext: 'Follow our updates & events' },
  { name: 'Telegram', url: 'https://t.me/infinity_tkd_official', icon: 'fab fa-telegram-plane', subtext: 'Join our community channel' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@infinity.tkd', icon: 'fab fa-tiktok', subtext: 'Watch our demo team' },
  { name: 'YouTube', url: 'https://www.youtube.com/@infinity_tkd', icon: 'fab fa-youtube', subtext: 'Training tutorials & highlights' },
  { name: 'Instagram', url: 'https://www.instagram.com/infinity.tkd/', icon: 'fab fa-instagram', subtext: 'Behind the scenes photos' },
  { name: 'Dojang Locations', url: '#', icon: 'fas fa-map-marker-alt', subtext: 'Olympic & SenSok Branches', action: 'openModal()' }
];

const initialFormState = {
  englishName: '',
  khmerName: '',
  gender: '',
  dob: '',
  phone: '',
  email: '',
  height: '',
  weight: '',
  nationality: '',
  address: '',
  country: 'Cambodia',
  city: '',
  district: '',
  commune: '',
  school: '',
  emergencyContact: '',
  emergencyPhone: '',
  relationship: '',
  medicalNotes: '',
  allergies: '',
  migrationNotes: '',
  branch: '',
  schedule: '',
  belt: '',
  medicalConditions: '',
  medications: '',
  pastInjuries: '',
  otherSports: '',
  liabilityWaiver: false,
  privacyPolicy: false,
  mediaPrivacy: false,
  parentConsent: false,
  howHear: '',
  signature: ''
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [stepTouched, setStepTouched] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState({ show: false, title: '', message: '', type: 'success', branch: '' });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [scheduleGroup, setScheduleGroup] = useState('');
  const [classTime, setClassTime] = useState('');

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Language helper
  const t = (key) => {
    return i18n[lang]?.[key] || i18n['en']?.[key] || key;
  };

  // Age calculation
  const getAge = (dobString) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const getMaxDobDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const getMinDobDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };

  const age = getAge(formData.dob);
  const isUnder17 = formData.dob ? age < 17 : false;

  // Reset parent consent if they turn out to be older than 17
  useEffect(() => {
    if (!isUnder17 && formData.parentConsent) {
      setFormData(prev => ({ ...prev, parentConsent: false }));
    }
  }, [isUnder17]);

  // Synchronize dynamic class schedule selection into formData.schedule
  useEffect(() => {
    if (formData.branch === 'Olympic') {
      setFormData(prev => {
        if (prev.schedule !== 'Saturday - Sunday 9:00 - 11:00 AM') {
          return { ...prev, schedule: 'Saturday - Sunday 9:00 - 11:00 AM' };
        }
        return prev;
      });
    } else if (formData.branch === 'KoukKhleang') {
      if (scheduleGroup && classTime) {
        const fullSched = `${scheduleGroup}: ${classTime}`;
        setFormData(prev => {
          if (prev.schedule !== fullSched) {
            return { ...prev, schedule: fullSched };
          }
          return prev;
        });
      } else {
        setFormData(prev => {
          if (prev.schedule !== '') {
            return { ...prev, schedule: '' };
          }
          return prev;
        });
      }
    } else {
      setFormData(prev => {
        if (prev.schedule !== '') {
          return { ...prev, schedule: '' };
        }
        return prev;
      });
    }
  }, [formData.branch, scheduleGroup, classTime]);

  // Restore schedule states from formData.schedule when branch is Kouk Khleang
  useEffect(() => {
    if (formData.branch === 'KoukKhleang' && formData.schedule) {
      const parts = formData.schedule.split(': ');
      if (parts.length === 2) {
        setScheduleGroup(parts[0]);
        setClassTime(parts[1]);
      }
    }
  }, [formData.branch]);

  // Handle simple input updates with strict character filters and sanitization
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    
    if (typeof val === 'string') {
      // Strip all HTML tags to prevent XSS / script injections
      val = val.replace(/<[^>]*>?/gm, '');

      // Strict character filters on typing
      if (name === 'phone' || name === 'emergencyPhone') {
        val = val.replace(/\D/g, '');
      } else if (name === 'height' || name === 'weight') {
        val = val.replace(/[^0-9.]/g, '');
        const parts = val.split('.');
        if (parts.length > 2) {
          val = parts[0] + '.' + parts.slice(1).join('');
        }
      } else if (name === 'englishName' || name === 'signature') {
        val = val.replace(/[^a-zA-Z\s'-]/g, '');
      } else if (name === 'khmerName') {
        val = val.replace(/[^\u1780-\u17FF\s]/g, '');
      } else if (name === 'emergencyContact' || name === 'relationship') {
        val = val.replace(/[^a-zA-Z\u1780-\u17FF\u4E00-\u9FFF\s'-]/g, '');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    // Mark field as touched when changing
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  // Mark field as touched on blur
  const handleBlurField = (name) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    // Friendly alerts on blur for specific key fields
    if (name === 'dob') {
      const val = formData.dob;
      if (val) {
        const ageNum = getAge(val);
        if (ageNum < 6 || ageNum > 100) {
          setToast({
            show: true,
            message: t('err_dob_range'),
            type: 'warning'
          });
        }
      }
    } else if (name === 'signature') {
      const val = formData.signature;
      if (val) {
        if (!/^[a-zA-Z\s'-]+$/.test(val)) {
          setToast({
            show: true,
            message: t('err_sig_format'),
            type: 'warning'
          });
        } else if (val.trim().replace(/\s+/g, ' ').toLowerCase() !== formData.englishName.trim().replace(/\s+/g, ' ').toLowerCase()) {
          setToast({
            show: true,
            message: t('err_sig_match'),
            type: 'warning'
          });
        }
      }
    }
  };

  // Clean value updater for custom select components
  const handleSelectChange = (name, value) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Cascading address resets
      if (name === 'country' && value !== 'Cambodia') {
        updated.city = '';
        updated.district = '';
        updated.commune = '';
      } else if (name === 'city') {
        updated.district = '';
        updated.commune = '';
      } else if (name === 'district') {
        updated.commune = '';
      }
      return updated;
    });

    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  // Field validation rules
  const validateField = (name) => {
    const val = formData[name];
    
    // Email Check
    if (name === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }
    
    // Phone Check
    if (name === 'phone' || name === 'emergencyPhone') {
      return /^[0-9]{8,15}$/.test(val);
    }
    
    // Height Check
    if (name === 'height') {
      if (!val) return true; // Optional
      const num = parseFloat(val);
      return !isNaN(num) && num >= 80 && num <= 230;
    }
    
    // Weight Check
    if (name === 'weight') {
      if (!val) return true; // Optional
      const num = parseFloat(val);
      return !isNaN(num) && num >= 20 && num <= 200;
    }
    
    // Date of Birth Check
    if (name === 'dob') {
      if (!val) return false;
      const ageNum = getAge(val);
      return ageNum >= 6 && ageNum <= 100;
    }

    // Name Checks
    if (name === 'englishName') {
      return !!(val && /^[a-zA-Z\s'-]+$/.test(val));
    }
    if (name === 'khmerName') {
      return !val || /^[\u1780-\u17FF\s]+$/.test(val);
    }

    // Signature Checks
    if (name === 'signature') {
      return !!(val && 
                /^[a-zA-Z\s'-]+$/.test(val) && 
                val.trim().replace(/\s+/g, ' ').toLowerCase() === formData.englishName.trim().replace(/\s+/g, ' ').toLowerCase());
    }

    if (name === 'parentConsent') {
      return !isUnder17 || val === true;
    }
    if (name === 'liabilityWaiver' || name === 'privacyPolicy' || name === 'mediaPrivacy') {
      return val === true;
    }
    if (name === 'relationship') {
      if (!val) return false;
      if (isUnder17) {
        const lower = val.trim().toLowerCase();
        return lower === 'parent' || lower === 'guardian' || 
               lower === 'ឪពុកម្តាយ' || lower === 'អាណាព្យាបាល' || 
               lower === '父母' || lower === '监护人';
      }
      return true;
    }

    // List of required fields
    const requiredFields = [
      'englishName', 'gender', 'dob', 'phone', 'email', 'nationality', 'address', 'country',
      'emergencyContact', 'emergencyPhone', 'relationship',
      'branch', 'schedule', 'belt',
      'medicalConditions', 'medications', 'pastInjuries', 'otherSports',
      'howHear', 'signature'
    ];

    // Additional required fields for Cambodia address cascade
    if (formData.country === 'Cambodia') {
      requiredFields.push('city', 'district', 'commune');
    }

    if (requiredFields.includes(name)) {
      return val !== undefined && val !== null && val !== '';
    }
    return true;
  };

  // Get field error message dynamically
  const getFieldError = (name) => {
    if (!touchedFields[name] && !stepTouched) return null;
    
    const val = formData[name];
    
    // Check required
    const requiredFields = [
      'englishName', 'gender', 'dob', 'phone', 'email', 'nationality', 'address', 'country',
      'emergencyContact', 'emergencyPhone', 'relationship',
      'branch', 'schedule', 'belt',
      'medicalConditions', 'medications', 'pastInjuries', 'otherSports',
      'howHear', 'signature'
    ];
    if (formData.country === 'Cambodia') {
      requiredFields.push('city', 'district', 'commune');
    }
    
    if (requiredFields.includes(name) && (val === undefined || val === null || val === '')) {
      return t('err_required');
    }
    
    // Check specific formats
    if (name === 'email' && val) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t('err_email');
    }
    if ((name === 'phone' || name === 'emergencyPhone') && val) {
      if (!/^[0-9]{8,15}$/.test(val)) return t('err_phone');
    }
    if (name === 'height' && val) {
      const num = parseFloat(val);
      if (isNaN(num) || num < 80 || num > 230) return t('err_height_range');
    }
    if (name === 'weight' && val) {
      const num = parseFloat(val);
      if (isNaN(num) || num < 20 || num > 200) return t('err_weight_range');
    }
    if (name === 'dob' && val) {
      const ageNum = getAge(val);
      if (ageNum < 6 || ageNum > 100) return t('err_dob_range');
    }
    if (name === 'englishName' && val) {
      if (!/^[a-zA-Z\s'-]+$/.test(val)) return t('err_name_format');
    }
    if (name === 'khmerName' && val) {
      if (!/^[\u1780-\u17FF\s]+$/.test(val)) return t('err_khmer_name_format');
    }
    if (name === 'signature' && val) {
      if (!/^[a-zA-Z\s'-]+$/.test(val)) return t('err_sig_format');
      if (val.trim().replace(/\s+/g, ' ').toLowerCase() !== formData.englishName.trim().replace(/\s+/g, ' ').toLowerCase()) {
        return t('err_sig_match');
      }
    }
    if (name === 'liabilityWaiver' || name === 'privacyPolicy' || name === 'mediaPrivacy') {
      if (!val) return t('err_required');
    }
    if (name === 'parentConsent' && isUnder17) {
      if (!val) return t('err_required');
    }
    if (name === 'relationship' && val) {
      if (isUnder17) {
        const lower = val.trim().toLowerCase();
        const isParentOrGuardian = lower === 'parent' || lower === 'guardian' || 
                                   lower === 'ឪពុកម្តាយ' || lower === 'អាណាព្យាបាល' || 
                                   lower === '父母' || lower === '监护人';
        if (!isParentOrGuardian) {
          return t('warn_under17_emergency');
        }
      }
    }
    
    return null;
  };

  // Label translation helpers for searchable selectors
  const getNationalityLabel = (opt) => {
    return nationalityTranslations[lang]?.[opt] || opt;
  };

  const getRelationshipLabel = (opt) => {
    return relationshipTranslations[lang]?.[opt] || opt;
  };

  const getBeltLabel = (opt) => {
    return t(`belt_${opt.toLowerCase()}`);
  };

  const getBeltColorClass = (belt) => {
    switch (belt) {
      case 'White': return 'bg-white border border-gray-300 dark:border-gray-600';
      case 'Yellow': return 'bg-yellow-400';
      case 'Green': return 'bg-green-500';
      case 'Blue': return 'bg-blue-500';
      case 'Red': return 'bg-red-500';
      case 'Black': return 'bg-black dark:border dark:border-gray-800';
      default: return 'bg-gray-200';
    }
  };

  const renderBeltOption = (opt) => {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${getBeltColorClass(opt)}`} />
        <span>{t(`belt_${opt.toLowerCase()}`)}</span>
      </div>
    );
  };

  const getDayGroupLabel = (opt) => {
    if (opt === "Saturday - Sunday") return t('sched_sat_sun');
    if (opt === "Tuesday - Wednesday") return t('sched_tue_wed');
    if (opt === "Thursday - Friday") return t('sched_thu_fri');
    return opt;
  };

  const getTimeSlotLabel = (slot) => {
    if (!slot) return "";
    let label = slot;
    if (lang === 'km') {
      label = label.replace("AM", "ព្រឹក").replace("PM", "ល្ងាច");
      label = label.replace("(Kid Class)", "(ថ្នាក់កុមារ)").replace("(General)", "(ទូទៅ)");
    } else if (lang === 'zh') {
      label = label.replace("AM", "上午").replace("PM", "下午");
      label = label.replace("(Kid Class)", "(儿童班)").replace("(General)", "(普通班)");
    }
    return label;
  };

  const getCountryLabel = (opt) => {
    return countryTranslations[lang]?.[opt] || opt;
  };

  const getCityLabel = (opt) => {
    if (lang === 'km') {
      return cambodiaLocations[opt]?.local || opt;
    }
    if (lang === 'zh') {
      return cambodiaProvincesZh[opt] || opt;
    }
    return opt;
  };

  const getDistrictLabel = (opt) => {
    if (lang === 'km') {
      return cambodiaLocations[formData.city]?.districts?.[opt]?.local || opt;
    }
    return opt;
  };

  const getCommuneLabel = (opt) => {
    if (lang === 'km') {
      const comm = cambodiaLocations[formData.city]?.districts?.[formData.district]?.communes?.find(c => c.english === opt);
      return comm?.local || opt;
    }
    return opt;
  };

  const getSchoolLabel = (opt) => {
    const schoolObj = phnomPenhSchools.find(s => s.english === opt);
    if (schoolObj) {
      if (lang === 'km') return schoolObj.khmer;
      if (lang === 'zh') return schoolObj.chinese;
      return schoolObj.english;
    }
    return opt;
  };

  // Get location option arrays dynamically
  const provinceOptions = Object.keys(cambodiaLocations).sort();
  const districtOptions = formData.city && cambodiaLocations[formData.city]?.districts
    ? Object.keys(cambodiaLocations[formData.city].districts).sort()
    : [];
  const communeOptions = formData.city && formData.district && cambodiaLocations[formData.city]?.districts?.[formData.district]?.communes
    ? cambodiaLocations[formData.city].districts[formData.district].communes.map(c => c.english).sort()
    : [];

  // Check if entire step is valid
  const isStepValid = (stepNum) => {
    const fieldsByStep = {
      1: ['englishName', 'gender', 'dob', 'phone', 'email', 'nationality', 'address', 'country', 'city', 'district', 'commune'],
      2: ['emergencyContact', 'emergencyPhone', 'relationship'],
      3: ['branch', 'schedule', 'belt'],
      4: ['medicalConditions', 'medications', 'pastInjuries', 'otherSports'],
      5: ['liabilityWaiver', 'privacyPolicy', 'mediaPrivacy', 'parentConsent', 'howHear', 'signature']
    };
    return fieldsByStep[stepNum].every(f => validateField(f));
  };

  // Navigations
  const focusFirstError = (stepNum) => {
    const fieldsByStep = {
      1: ['englishName', 'gender', 'dob', 'phone', 'email', 'nationality', 'address', 'country', 'city', 'district', 'commune'],
      2: ['emergencyContact', 'emergencyPhone', 'relationship'],
      3: ['branch', 'schedule', 'belt'],
      4: ['medicalConditions', 'medications', 'pastInjuries', 'otherSports'],
      5: ['liabilityWaiver', 'privacyPolicy', 'mediaPrivacy', 'parentConsent', 'howHear', 'signature']
    };
    
    const firstInvalid = fieldsByStep[stepNum].find(f => !validateField(f));
    if (firstInvalid) {
      setTimeout(() => {
        const el = document.getElementsByName(firstInvalid)[0] || 
                   document.getElementById(`${firstInvalid}_search`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 100);
    }
  };

  const handleNext = () => {
    if (isStepValid(step)) {
      setStep(prev => prev + 1);
      setStepTouched(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStepTouched(true);
      focusFirstError(step);
      setToast({
        show: true,
        message: t('err_incomplete'),
        type: 'error'
      });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setStepTouched(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < step) {
      setStep(targetStep);
      setStepTouched(false);
    } else if (targetStep > step) {
      // Must validate all steps in between
      let check = step;
      while (check < targetStep) {
        if (!isStepValid(check)) {
          setStepTouched(true);
          setToast({
            show: true,
            message: t('err_incomplete'),
            type: 'error'
          });
          return;
        }
        check++;
      }
      setStep(targetStep);
      setStepTouched(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStepValid(5)) {
      setStepTouched(true);
      focusFirstError(5);
      setToast({
        show: true,
        message: t('err_incomplete'),
        type: 'error'
      });
      return;
    }

    if (!formData.liabilityWaiver || !formData.privacyPolicy || !formData.mediaPrivacy) {
      setToast({
        show: true,
        message: t('err_agree'),
        type: 'error'
      });
      return;
    }

    if (isUnder17 && !formData.parentConsent) {
      setToast({
        show: true,
        message: t('err_parent_consent'),
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedData = {};
      Object.keys(formData).forEach(key => {
        const val = formData[key];
        if (typeof val === 'string') {
          sanitizedData[key] = val.trim();
        } else if (typeof val === 'boolean') {
          sanitizedData[key] = val ? "Agreed" : "No";
        } else {
          sanitizedData[key] = val;
        }
      });

      if (!isUnder17) {
        sanitizedData['parentConsent'] = "N/A";
      }

      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        body: new URLSearchParams(sanitizedData),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const result = await response.json();

      if (result.status === 'success') {
        setShowModal({
          show: true,
          title: t('modal_success_title'),
          message: t('modal_success_msg'),
          type: 'success',
          branch: formData.branch
        });
        setFormData(initialFormState);
        setStep(1);
        setStepTouched(false);
        setTouchedFields({});
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error(error);
      setShowModal({
        show: true,
        title: t('modal_error_title'),
        message: t('modal_error_msg'),
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAgreedToAll = formData.liabilityWaiver && 
                        formData.privacyPolicy && 
                        formData.mediaPrivacy && 
                        (!isUnder17 || formData.parentConsent);

  const isEntireFormValid = isStepValid(1) && 
                            isStepValid(2) && 
                            isStepValid(3) && 
                            isStepValid(4) && 
                            isStepValid(5);

  return (
    <div className={`bg-surface dark:bg-surfaceDark text-secondary dark:text-gray-100 min-h-screen transition-colors duration-300 ${lang === 'km' ? 'font-km' : 'font-sans'}`}>
      
      {/* Premium Auto-dismissing Toast alert */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] max-w-md w-full px-4 transition-all duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-custom shadow-premium border bg-white/95 dark:bg-cardDark/95 backdrop-blur-md animate-slide-down ${
            toast.type === 'success' 
              ? 'border-green-200 dark:border-green-900/30' 
              : toast.type === 'warning'
              ? 'border-yellow-200 dark:border-yellow-900/30'
              : 'border-red-200 dark:border-red-900/30'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="text-green-500 text-xl flex-shrink-0" weight="fill" />
            ) : toast.type === 'warning' ? (
              <WarningCircle className="text-yellow-500 text-xl flex-shrink-0" weight="fill" />
            ) : (
              <WarningCircle className="text-primary text-xl flex-shrink-0" weight="fill" />
            )}
            <p className="text-sm font-semibold text-secondary dark:text-white">{toast.message}</p>
          </div>
        </div>
      )}
      
      {/* Premium Glass Header */}
      <header className="glass-header fixed top-0 w-full z-50 py-3 px-6 flex justify-between items-center transition-colors duration-300">
        <div className="flex items-center gap-3">
          <img src="Logo/Frame 24.svg" className="h-10 w-auto object-contain" alt="Infinity Taekwondo Logo" />
          <h1 className="text-xl font-bold tracking-tight hidden sm:block uppercase">{t('header_title')}</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <select
            id="langSwitcher"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="secure-input !py-1 !px-2 !pr-8 !text-sm cursor-pointer border-gray-300 w-auto bg-transparent focus:!border-primary dark:text-white"
          >
            <option value="en" className="dark:bg-cardDark">EN</option>
            <option value="km" className="dark:bg-cardDark">KM</option>
            <option value="zh" className="dark:bg-cardDark">ZH</option>
          </select>
          <button
            id="themeToggle"
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-custom hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="text-xl text-secondary" />
            ) : (
              <Sun className="text-xl text-yellow-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="premium-card shadow-premium dark:shadow-premium-dark p-6 sm:p-10 transition-colors duration-300 relative">
          
          {/* Shimmer Effect on loading/saving states with custom clipping container */}
          <div className="absolute inset-0 rounded-custom overflow-hidden pointer-events-none z-0">
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] ${isSubmitting ? 'block' : 'hidden'}`}></div>
          </div>

          {/* Form Header & Progress Tracker */}
          <div className="mb-8 text-center flex flex-col items-center">
            <img src="Logo/Frame 24.svg" className="h-20 w-auto object-contain mb-4" alt="Infinity Logo Big" />
            <h2 className="text-3xl font-black uppercase text-secondary dark:text-white mb-2 tracking-tight">{t('form_title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('form_subtitle')}</p>
            
            {/* 5-Step Dynamic Progress Bar */}
            <div className="flex items-center justify-center w-full max-w-lg mx-auto mb-4 relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full z-0"></div>
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              ></div>
              
              <div className="flex justify-between w-full z-10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStepClick(s)}
                    className={`step-indicator w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                      s < step
                        ? 'bg-primary border-primary text-white shadow-md'
                        : s === step
                        ? 'bg-primary border-white dark:border-cardDark ring-2 ring-primary text-white shadow-md scale-110 font-extrabold'
                        : 'bg-gray-100 dark:bg-gray-800 border-white dark:border-cardDark text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {s < step ? <Check size={14} weight="bold" /> : s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Interactive Form */}
          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="step-container active">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <User className="text-primary" /> <span>{t('step1_title')}</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full English Name */}
                  <div className="secure-input-group">
                    <User className={`input-icon-left ${formData.englishName ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="englishName"
                      value={formData.englishName}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('englishName')}
                      placeholder={t('ph_english_name')}
                      required
                      className={`secure-input border ${
                        getFieldError('englishName')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.englishName && validateField('englishName') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('englishName') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('englishName')}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Full Khmer Name */}
                  <div className="secure-input-group">
                    <Translate className={`input-icon-left ${formData.khmerName ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="khmerName"
                      value={formData.khmerName}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('khmerName')}
                      placeholder={t('ph_khmer_name')}
                      className={`secure-input border ${
                        getFieldError('khmerName')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.khmerName && validateField('khmerName') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('khmerName') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('khmerName')}</span>
                      </span>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="secure-input-group">
                    <User className={`input-icon-left ${formData.gender ? 'text-primary' : 'text-gray-400'}`} />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('gender')}
                      required
                      className={`secure-input !pl-10 appearance-none border ${
                        getFieldError('gender')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <option value="" disabled>{t('opt_gender')}</option>
                      <option value="Male">{t('opt_male')}</option>
                      <option value="Female">{t('opt_female')}</option>
                    </select>
                    <CaretDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    {formData.gender && validateField('gender') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('gender') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('gender')}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Date of Birth */}
                  <div className="secure-input-group">
                    <label className="floating-label bg-white dark:bg-cardDark">{t('lbl_dob')}</label>
                    <CalendarBlank className={`input-icon-left ${formData.dob ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('dob')}
                      min={getMinDobDate()}
                      max={getMaxDobDate()}
                      required
                      className={`secure-input border ${
                        getFieldError('dob')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.dob && validateField('dob') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('dob') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('dob')}</span>
                      </span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="secure-input-group">
                    <Phone className={`input-icon-left ${formData.phone ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('phone')}
                      placeholder={t('ph_phone')}
                      required
                      className={`secure-input border ${
                        getFieldError('phone')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.phone && validateField('phone') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('phone') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('phone')}</span>
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="secure-input-group">
                    <EnvelopeSimple className={`input-icon-left ${formData.email ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('email')}
                      placeholder={t('ph_email')}
                      required
                      className={`secure-input border ${
                        getFieldError('email')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.email && validateField('email') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('email') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('email')}</span>
                      </span>
                    )}
                  </div>

                  {/* Height & Weight */}
                  <div className="secure-input-group flex gap-2">
                    <div className="relative w-1/2">
                      <label className="floating-label bg-white dark:bg-cardDark">{t('lbl_height')}</label>
                      <Ruler className={`input-icon-left ${formData.height ? 'text-primary' : 'text-gray-400'}`} />
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('height')}
                        min="30"
                        max="250"
                        className={`secure-input !pr-8 border ${
                          getFieldError('height')
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-bold">cm</span>
                      {getFieldError('height') && (
                        <span className="text-[10px] text-primary mt-1 flex items-center gap-1 leading-none font-semibold animate-fade-in">
                          <span>{getFieldError('height')}</span>
                        </span>
                      )}
                    </div>
                    <div className="relative w-1/2">
                      <label className="floating-label bg-white dark:bg-cardDark">{t('lbl_weight')}</label>
                      <Barbell className={`input-icon-left ${formData.weight ? 'text-primary' : 'text-gray-400'}`} />
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('weight')}
                        min="5"
                        max="250"
                        className={`secure-input !pr-8 border ${
                          getFieldError('weight')
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-bold">kg</span>
                      {getFieldError('weight') && (
                        <span className="text-[10px] text-primary mt-1 flex items-center gap-1 leading-none font-semibold animate-fade-in">
                          <span>{getFieldError('weight')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nationality - Searchable */}
                  <div className="secure-input-group">
                    <SearchableSelect
                      id="nationality"
                      value={formData.nationality}
                      options={nationalityList}
                      placeholder="Select Nationality *"
                      placeholderKey="opt_select_nation"
                      onChange={(val) => handleSelectChange('nationality', val)}
                      icon={Globe}
                      lang={lang}
                      i18n={i18n}
                      isValid={!getFieldError('nationality')}
                      showValidation={touchedFields['nationality'] || stepTouched}
                      getLabel={getNationalityLabel}
                    />
                    {getFieldError('nationality') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('nationality')}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Address Text Box */}
                  <div className="md:col-span-2 secure-input-group">
                    <MapPinLine className={`input-icon-left ${formData.address ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('address')}
                      placeholder={t('ph_address1')}
                      required
                      className={`secure-input border ${
                        getFieldError('address')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.address && validateField('address') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('address') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('address')}</span>
                      </span>
                    )}
                  </div>

                  {/* Country Select - Searchable */}
                  <div className="secure-input-group">
                    <SearchableSelect
                      id="country"
                      value={formData.country}
                      options={countryList}
                      placeholder="Search Country..."
                      onChange={(val) => handleSelectChange('country', val)}
                      icon={Globe}
                      lang={lang}
                      i18n={i18n}
                      isValid={!getFieldError('country')}
                      showValidation={touchedFields['country'] || stepTouched}
                      getLabel={getCountryLabel}
                    />
                    {getFieldError('country') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('country')}</span>
                      </span>
                    )}
                  </div>

                  {/* Cambodia Address Cascade - Only visible if Country is Cambodia */}
                  {formData.country === 'Cambodia' ? (
                    <>
                      {/* State/Province/City - Searchable */}
                      <div className="secure-input-group">
                        <SearchableSelect
                          id="city"
                          value={formData.city}
                          options={provinceOptions}
                          placeholder="Select Province/City *"
                          placeholderKey="opt_select_prov"
                          onChange={(val) => handleSelectChange('city', val)}
                          icon={Buildings}
                          lang={lang}
                          i18n={i18n}
                          isValid={!getFieldError('city')}
                          showValidation={touchedFields['city'] || stepTouched}
                          getLabel={getCityLabel}
                        />
                        {getFieldError('city') && (
                          <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                            <WarningCircle size={14} weight="bold" /> <span>{getFieldError('city')}</span>
                          </span>
                        )}
                      </div>

                      {/* District/Khan - Searchable */}
                      <div className="secure-input-group">
                        <SearchableSelect
                          id="district"
                          value={formData.district}
                          options={districtOptions}
                          placeholder="Select District/Khan *"
                          placeholderKey="opt_select_dist"
                          disabled={!formData.city}
                          onChange={(val) => handleSelectChange('district', val)}
                          icon={MapTrifold}
                          lang={lang}
                          i18n={i18n}
                          isValid={!getFieldError('district')}
                          showValidation={touchedFields['district'] || stepTouched}
                          getLabel={getDistrictLabel}
                        />
                        {getFieldError('district') && (
                          <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                            <WarningCircle size={14} weight="bold" /> <span>{getFieldError('district')}</span>
                          </span>
                        )}
                      </div>

                      {/* Commune/Sangkat - Searchable */}
                      <div className="secure-input-group">
                        <SearchableSelect
                          id="commune"
                          value={formData.commune}
                          options={communeOptions}
                          placeholder="Select Commune/Sangkat *"
                          placeholderKey="opt_select_commune"
                          disabled={!formData.district}
                          onChange={(val) => handleSelectChange('commune', val)}
                          icon={MapPinLine}
                          lang={lang}
                          i18n={i18n}
                          isValid={!getFieldError('commune')}
                          showValidation={touchedFields['commune'] || stepTouched}
                          getLabel={getCommuneLabel}
                        />
                        {getFieldError('commune') && (
                          <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                            <WarningCircle size={14} weight="bold" /> <span>{getFieldError('commune')}</span>
                          </span>
                        )}
                      </div>
                    </>
                  ) : null}
                  
                  {/* School/University */}
                  <div className="secure-input-group">
                    {formData.country === 'Cambodia' && formData.city === 'Phnom Penh Capital' ? (
                      <SearchableSelect
                        id="school"
                        value={formData.school}
                        options={phnomPenhSchoolNames}
                        placeholder="Search School/University..."
                        placeholderKey="ph_school"
                        onChange={(val) => handleSelectChange('school', val)}
                        icon={GraduationCap}
                        lang={lang}
                        i18n={i18n}
                        isValid={!getFieldError('school')}
                        showValidation={touchedFields['school'] || stepTouched}
                        getLabel={getSchoolLabel}
                        allowCustomValue={true}
                      />
                    ) : (
                      <>
                        <GraduationCap className={`input-icon-left ${formData.school ? 'text-primary' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleChange}
                          onBlur={() => handleBlurField('school')}
                          placeholder={t('ph_school')}
                          className={`secure-input border ${
                            getFieldError('school')
                              ? 'border-primary'
                              : 'border-gray-200 dark:border-gray-800'
                          }`}
                        />
                        {formData.school && (
                          <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                        )}
                      </>
                    )}
                    {getFieldError('school') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('school')}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Emergency Contact & Notes */}
            {step === 2 && (
              <div className="step-container active">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <FirstAid className="text-primary" /> <span>{t('step2_title')}</span>
                </h3>

                {isUnder17 && (
                  <div className="p-4 mb-6 rounded-custom bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <WarningCircle size={16} className="text-yellow-500 flex-shrink-0" weight="fill" />
                    <span>{t('warn_under17_emergency')}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Emergency Name */}
                  <div className="secure-input-group">
                    <WarningCircle className={`input-icon-left ${formData.emergencyContact ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('emergencyContact')}
                      placeholder={t('ph_em_name')}
                      required
                      className={`secure-input border ${
                        getFieldError('emergencyContact')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.emergencyContact && validateField('emergencyContact') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('emergencyContact') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('emergencyContact')}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Emergency Phone */}
                  <div className="secure-input-group">
                    <PhoneCall className={`input-icon-left ${formData.emergencyPhone ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('emergencyPhone')}
                      placeholder={t('ph_em_phone')}
                      required
                      className={`secure-input border ${
                        getFieldError('emergencyPhone')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.emergencyPhone && validateField('emergencyPhone') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('emergencyPhone') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('emergencyPhone')}</span>
                      </span>
                    )}
                  </div>

                  {/* Relationship */}
                  <div className="secure-input-group md:col-span-2">
                    <SearchableSelect
                      id="relationship"
                      value={formData.relationship}
                      options={relationshipList}
                      placeholder="Relationship to Student *"
                      placeholderKey="ph_relationship"
                      onChange={(val) => handleSelectChange('relationship', val)}
                      icon={Users}
                      lang={lang}
                      i18n={i18n}
                      isValid={!getFieldError('relationship')}
                      showValidation={touchedFields['relationship'] || stepTouched}
                      getLabel={getRelationshipLabel}
                      allowCustomValue={true}
                    />
                    {getFieldError('relationship') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('relationship')}</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <Heartbeat className="text-primary" /> <span>{t('ph_medical_notes')}</span>
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  {/* General Medical Notes */}
                  <div className="secure-input-group">
                    <Stethoscope className="input-icon-left !top-6 text-gray-400" />
                    <textarea
                      name="medicalNotes"
                      value={formData.medicalNotes}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('medicalNotes')}
                      className="secure-input min-h-[80px] !pl-10 py-3 border border-gray-200 dark:border-gray-800"
                      placeholder={t('ph_medical_notes')}
                    ></textarea>
                  </div>

                  {/* Allergies */}
                  <div className="secure-input-group">
                    <WarningCircle className="input-icon-left !top-6 text-gray-400" />
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('allergies')}
                      className="secure-input min-h-[80px] !pl-10 py-3 border border-gray-200 dark:border-gray-800"
                      placeholder={t('ph_allergies')}
                    ></textarea>
                  </div>

                  {/* Migration & Administration Notes */}
                  <div className="secure-input-group">
                    <ClipboardText className="input-icon-left !top-6 text-gray-400" />
                    <textarea
                      name="migrationNotes"
                      value={formData.migrationNotes}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('migrationNotes')}
                      className="secure-input min-h-[80px] !pl-10 py-3 border border-gray-200 dark:border-gray-800"
                      placeholder={t('ph_migration_notes')}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Class Details */}
            {step === 3 && (
              <div className="step-container active pb-24 md:pb-32">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <Check className="text-primary" /> <span>{t('step3_title')}</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Branch */}
                  <div className="secure-input-group">
                    <Storefront className={`input-icon-left ${formData.branch ? 'text-primary' : 'text-gray-400'}`} />
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('branch')}
                      required
                      className={`secure-input !pl-10 appearance-none border ${
                        getFieldError('branch')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <option value="" disabled>{t('opt_branch')}</option>
                      <option value="Olympic">{t('branch_olympic')}</option>
                      <option value="KoukKhleang">{t('branch_koukkhleang')}</option>
                    </select>
                    <CaretDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    {formData.branch && validateField('branch') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('branch') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('branch')}</span>
                      </span>
                    )}
                  </div>

                  {/* Schedule (Conditional on Branch) */}
                  {!formData.branch && (
                    <div className="secure-input-group md:col-span-2">
                      <Clock className="input-icon-left text-gray-400" />
                      <select
                        disabled
                        className="secure-input !pl-10 appearance-none border border-gray-200 dark:border-gray-800 opacity-60 bg-gray-50 dark:bg-cardDark cursor-not-allowed"
                      >
                        <option value="">{t('opt_schedule')}</option>
                      </select>
                      <CaretDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  )}

                  {formData.branch === 'Olympic' && (
                    <div className="secure-input-group md:col-span-2">
                      <label className="floating-label bg-white dark:bg-cardDark">{t('opt_schedule')}</label>
                      <Clock className="input-icon-left text-primary" />
                      <input
                        type="text"
                        disabled
                        value={lang === 'en' ? "Saturday - Sunday 9:00 - 11:00 AM" : lang === 'km' ? "ថ្ងៃសៅរ៍ - ថ្ងៃអាទិត្យ 9:00 - 11:00 ព្រឹក" : "星期六 - 星期日 9:00 - 11:00 上午"}
                        className="secure-input border border-gray-200 dark:border-gray-800 opacity-70 bg-gray-50 dark:bg-cardDark text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  )}

                  {formData.branch === 'KoukKhleang' && (
                    <>
                      {/* Day Group Select */}
                      <div className="secure-input-group">
                        <SearchableSelect
                          id="scheduleGroup"
                          value={scheduleGroup}
                          options={dayGroups}
                          placeholder="Select Day Group *"
                          placeholderKey="lbl_schedule_group"
                          onChange={(val) => {
                            setScheduleGroup(val);
                            setClassTime(''); // reset class time on group change
                          }}
                          icon={Clock}
                          lang={lang}
                          i18n={i18n}
                          isValid={!!scheduleGroup}
                          showValidation={stepTouched}
                          getLabel={getDayGroupLabel}
                        />
                        {stepTouched && !scheduleGroup && (
                          <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                            <WarningCircle size={14} weight="bold" /> <span>{t('err_required')}</span>
                          </span>
                        )}
                      </div>

                      {/* Time Slot Select */}
                      <div className="secure-input-group">
                        <SearchableSelect
                          id="classTime"
                          value={classTime}
                          options={scheduleGroup === "Saturday - Sunday" ? weekendTimeSlots : weekdayTimeSlots}
                          placeholder="Select Time Slot *"
                          placeholderKey="lbl_class_time"
                          disabled={!scheduleGroup}
                          onChange={(val) => setClassTime(val)}
                          icon={Clock}
                          lang={lang}
                          i18n={i18n}
                          isValid={!!classTime}
                          showValidation={stepTouched}
                          getLabel={getTimeSlotLabel}
                        />
                        {stepTouched && !classTime && (
                          <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                            <WarningCircle size={14} weight="bold" /> <span>{t('err_required')}</span>
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Belt */}
                  <div className="secure-input-group">
                    <SearchableSelect
                      id="belt"
                      value={formData.belt}
                      options={beltList}
                      placeholder="Select Current Belt *"
                      placeholderKey="opt_belt"
                      onChange={(val) => handleSelectChange('belt', val)}
                      icon={Belt}
                      lang={lang}
                      i18n={i18n}
                      isValid={!getFieldError('belt')}
                      showValidation={touchedFields['belt'] || stepTouched}
                      getLabel={getBeltLabel}
                      renderOption={renderBeltOption}
                    />
                    {getFieldError('belt') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('belt')}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Medical Questionnaire */}
            {step === 4 && (
              <div className="step-container active">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <WarningCircle className="text-primary" /> <span>{t('step4_title')}</span>
                </h3>
                
                <div className="space-y-6">
                  {/* Medical conditions */}
                  <div className="secure-input-group">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">{t('q_conditions')}</label>
                    <div className="relative">
                      <Stethoscope className={`input-icon-left ${formData.medicalConditions ? 'text-primary' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('medicalConditions')}
                        required
                        placeholder={t('ph_yes_no_details')}
                        className={`secure-input border ${
                          getFieldError('medicalConditions')
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      />
                      {formData.medicalConditions && validateField('medicalConditions') && (
                        <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                      )}
                    </div>
                    {getFieldError('medicalConditions') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('medicalConditions')}</span>
                      </span>
                    )}
                  </div>

                  {/* Medications */}
                  <div className="secure-input-group">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">{t('q_medications')}</label>
                    <div className="relative">
                      <Stethoscope className={`input-icon-left ${formData.medications ? 'text-primary' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="medications"
                        value={formData.medications}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('medications')}
                        required
                        placeholder={t('ph_yes_no_details')}
                        className={`secure-input border ${
                          getFieldError('medications')
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      />
                      {formData.medications && validateField('medications') && (
                        <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                      )}
                    </div>
                    {getFieldError('medications') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('medications')}</span>
                      </span>
                    )}
                  </div>

                  {/* Past injuries */}
                  <div className="secure-input-group">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">{t('q_injuries')}</label>
                    <div className="relative">
                      <Stethoscope className={`input-icon-left ${formData.pastInjuries ? 'text-primary' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="pastInjuries"
                        value={formData.pastInjuries}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('pastInjuries')}
                        required
                        placeholder={t('ph_yes_no_details')}
                        className={`secure-input border ${
                          getFieldError('pastInjuries')
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      />
                      {formData.pastInjuries && validateField('pastInjuries') && (
                        <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                      )}
                    </div>
                    {getFieldError('pastInjuries') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('pastInjuries')}</span>
                      </span>
                    )}
                  </div>

                  {/* Other physical activities */}
                  <div className="secure-input-group">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">{t('q_sports')}</label>
                    <div className="relative">
                      <Barbell className={`input-icon-left ${formData.otherSports ? 'text-primary' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="otherSports"
                        value={formData.otherSports}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('otherSports')}
                        required
                        placeholder={t('ph_yes_no_details')}
                        className={`secure-input border ${
                          getFieldError('otherSports')
                            ? 'border-primary'
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      />
                      {formData.otherSports && !!validateField('otherSports') && (
                        <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                      )}
                    </div>
                    {getFieldError('otherSports') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('otherSports')}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Legal Agreements & Signature */}
            {step === 5 && (
              <div className="step-container active">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <FileText className="text-primary" /> <span>{t('step5_title')}</span>
                </h3>
                
                {/* Checkbox Waivers */}
                <div className="space-y-4 mb-6">
                  {/* Category 1: Liability Waiver */}
                  <div className="bg-white/40 dark:bg-cardDark/40 backdrop-blur-md p-4 rounded-custom border border-gray-200/60 dark:border-gray-800/60 transition-all hover:border-primary/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">1. Liability Waiver</h4>
                    <div className="max-h-24 overflow-y-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-50/60 dark:bg-black/25 p-3 rounded border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
                      <p>• {t('liability_p1')}</p>
                      <p>• {t('liability_p2')}</p>
                      <p>• {t('liability_p3')}</p>
                      <p>• {t('liability_p4')}</p>
                      <p>• {t('liability_p5')}</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="liabilityWaiver"
                        checked={formData.liabilityWaiver}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('liabilityWaiver')}
                        required
                        className="mt-1 accent-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-200 font-medium">
                        {t('agree_liability')}
                      </span>
                    </label>
                    {getFieldError('liabilityWaiver') && (
                      <span className="text-xs text-primary mt-1.5 ml-8 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('liabilityWaiver')}</span>
                      </span>
                    )}
                  </div>

                  {/* Category 2: Data Privacy Policy */}
                  <div className="bg-white/40 dark:bg-cardDark/40 backdrop-blur-md p-4 rounded-custom border border-gray-200/60 dark:border-gray-800/60 transition-all hover:border-primary/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">2. Data Privacy Policy</h4>
                    <div className="max-h-24 overflow-y-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-50/60 dark:bg-black/25 p-3 rounded border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
                      <p>• {t('privacy_p1')}</p>
                      <p>• {t('privacy_p2')}</p>
                      <p>• {t('privacy_p3')}</p>
                      <p>• {t('privacy_p4')}</p>
                      <p>• {t('privacy_p5')}</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="privacyPolicy"
                        checked={formData.privacyPolicy}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('privacyPolicy')}
                        required
                        className="mt-1 accent-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-200 font-medium">
                        {t('agree_privacy')}
                      </span>
                    </label>
                    {getFieldError('privacyPolicy') && (
                      <span className="text-xs text-primary mt-1.5 ml-8 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('privacyPolicy')}</span>
                      </span>
                    )}
                  </div>

                  {/* Category 3: Media Release Policy */}
                  <div className="bg-white/40 dark:bg-cardDark/40 backdrop-blur-md p-4 rounded-custom border border-gray-200/60 dark:border-gray-800/60 transition-all hover:border-primary/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">3. Media Release Policy</h4>
                    <div className="max-h-24 overflow-y-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-50/60 dark:bg-black/25 p-3 rounded border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
                      <p>• {t('media_p1')}</p>
                      <p>• {t('media_p2')}</p>
                      <p>• {t('media_p3')}</p>
                      <p>• {t('media_p4')}</p>
                      <p>• {t('media_p5')}</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="mediaPrivacy"
                        checked={formData.mediaPrivacy}
                        onChange={handleChange}
                        onBlur={() => handleBlurField('mediaPrivacy')}
                        required
                        className="mt-1 accent-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-200 font-medium">
                        {t('agree_media')}
                      </span>
                    </label>
                    {getFieldError('mediaPrivacy') && (
                      <span className="text-xs text-primary mt-1.5 ml-8 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('mediaPrivacy')}</span>
                      </span>
                    )}
                  </div>

                  {/* Category 4: Parent / Guardian Consent (Mandatory if student is under 17) */}
                  {isUnder17 && (
                    <div className="bg-white/40 dark:bg-cardDark/40 backdrop-blur-md p-4 rounded-custom border border-primary/30 dark:border-primary/30 transition-all animate-fade-in">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">4. Parent / Guardian Consent</h4>
                      <div className="max-h-24 overflow-y-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-50/60 dark:bg-black/25 p-3 rounded border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
                        <p>• {t('parent_p1')}</p>
                        <p>• {t('parent_p2')}</p>
                        <p>• {t('parent_p3')}</p>
                        <p>• {t('parent_p4')}</p>
                        <p>• {t('parent_p5')}</p>
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="parentConsent"
                          checked={formData.parentConsent}
                          onChange={handleChange}
                          onBlur={() => handleBlurField('parentConsent')}
                          required={isUnder17}
                          className="mt-1 accent-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-200 font-medium">
                          {t('agree_parent')}
                        </span>
                      </label>
                      {getFieldError('parentConsent') && (
                        <span className="text-xs text-primary mt-1.5 ml-8 flex items-center gap-1 font-semibold animate-fade-in">
                          <WarningCircle size={14} weight="bold" /> <span>{getFieldError('parentConsent')}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Smart tip to guide users if agreements are incomplete */}
                {!isEntireFormValid && (
                  <div className="p-3 mb-6 rounded-custom bg-gray-50 dark:bg-cardDark/50 border border-gray-200 dark:border-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-semibold text-center animate-pulse">
                    {t('agree_tip')}
                  </div>
                )}

                {/* Hear source & Digital Signature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* How did you hear */}
                  <div className="secure-input-group">
                    <Megaphone className={`input-icon-left ${formData.howHear ? 'text-primary' : 'text-gray-400'}`} />
                    <select
                      name="howHear"
                      value={formData.howHear}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('howHear')}
                      required
                      className={`secure-input !pl-10 appearance-none border ${
                        getFieldError('howHear')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <option value="" disabled>{t('opt_hear')}</option>
                      <option value="Facebook">{t('hear_facebook')}</option>
                      <option value="TikTok">{t('hear_tiktok')}</option>
                      <option value="Google">{t('hear_google')}</option>
                      <option value="Friend/Family">{t('hear_friend_family')}</option>
                      <option value="Banner/Flyer">{t('hear_banner_flyer')}</option>
                      <option value="Other">{t('hear_other')}</option>
                    </select>
                    <CaretDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    {formData.howHear && validateField('howHear') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('howHear') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('howHear')}</span>
                      </span>
                    )}
                  </div>

                  {/* Signature */}
                  <div className="secure-input-group">
                    <PenNib className={`input-icon-left ${formData.signature ? 'text-primary' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="signature"
                      value={formData.signature}
                      onChange={handleChange}
                      onBlur={() => handleBlurField('signature')}
                      placeholder={t('ph_signature')}
                      required
                      className={`secure-input border ${
                        getFieldError('signature')
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    />
                    {formData.signature && validateField('signature') && (
                      <CheckCircle className="validation-icon text-green-500 show" size={18} weight="fill" />
                    )}
                    {getFieldError('signature') && (
                      <span className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
                        <WarningCircle size={14} weight="bold" /> <span>{getFieldError('signature')}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons Footer */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-infinity-outline"
                >
                  <ArrowLeft size={16} weight="bold" /> <span>{t('btn_back')}</span>
                </button>
              )}
              
              <div className="ml-auto flex gap-3">
                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-infinity-secondary"
                  >
                    <span>{t('btn_next')}</span> <ArrowRight size={16} weight="bold" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !isEntireFormValid}
                    className="btn-infinity-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? (lang === 'en' ? 'Processing...' : lang === 'km' ? 'កំពុងដំណើរការ...' : '正在处理...') : t('btn_submit')}</span>
                    {isSubmitting ? (
                      <div className="loader"></div>
                    ) : (
                      <CheckCircle size={18} weight="bold" />
                    )}
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Contact & Community Channels Section */}
        <div className="mt-12 text-center animate-fade-in">
          <h3 className="text-lg font-black uppercase tracking-widest text-secondary dark:text-white mb-2">
            Connect With Us
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Stay updated with school events, announcements, training clips, and community chats across our channels.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {linksData.map((link, idx) => {
              const isModalAction = link.action === 'openModal()';
              if (isModalAction) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-4 p-4 rounded-custom bg-white/70 dark:bg-cardDark/70 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all text-left group w-full cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-custom bg-surface dark:bg-surfaceDark flex items-center justify-center text-secondary dark:text-white group-hover:bg-primary group-hover:text-white transition-all">
                      <i className={`${link.icon} text-lg`}></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-secondary dark:text-white uppercase tracking-wider group-hover:text-primary transition-colors">
                        {link.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {link.subtext}
                      </p>
                    </div>
                  </button>
                );
              }

              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-custom bg-white/70 dark:bg-cardDark/70 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all text-left group w-full cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-custom bg-surface dark:bg-surfaceDark flex items-center justify-center text-secondary dark:text-white group-hover:bg-primary group-hover:text-white transition-all">
                    <i className={`${link.icon} text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-secondary dark:text-white uppercase tracking-wider group-hover:text-primary transition-colors">
                      {link.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {link.subtext}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
          
          <footer className="mt-12 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Infinity Taekwondo. All Rights Reserved.
          </footer>
        </div>
      </main>

      {/* Success & Failures Modern Feedback Modal */}
      {showModal.show && (
        <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 px-4">
          <div className={`bg-white dark:bg-cardDark p-8 rounded-custom shadow-2xl max-w-md w-full transform scale-100 transition-transform duration-300 border-t-4 ${
            showModal.type === 'success' ? 'border-green-500' : 'border-primary'
          }`}>
            {showModal.type === 'success' ? (
              <>
                {/* Success Header */}
                <div className="text-5xl text-green-500 mb-4 mx-auto flex justify-center">
                  <CheckCircle className="animate-[bounce_1.5s_infinite]" size={48} weight="fill" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-center mb-2 text-secondary dark:text-white">
                  {showModal.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm text-center">
                  {showModal.message}
                </p>

                {/* Telegram Invite Section */}
                <div className="bg-gray-50 dark:bg-surfaceDark/50 border border-gray-100 dark:border-gray-800/80 rounded-custom p-5 mb-6 text-left">
                  <h4 className="text-xs uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <i className="fa-brands fa-telegram text-base text-[#24A1DE]"></i>
                    <span>Join Telegram Groups</span>
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Please join our community channel and your branch group for real-time announcements, schedules, and training content:
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    {/* Family Group Link */}
                    <a
                      href="https://t.me/+ms0hN3F0k6ZhOTI1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-custom bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-800 hover:border-[#24A1DE] hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#24A1DE]/10 flex items-center justify-center text-[#24A1DE]">
                          <i className="fa-solid fa-users text-sm"></i>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-secondary dark:text-white">Infinity TKD Family</div>
                          <div className="text-[10px] text-gray-400">Main community channel</div>
                        </div>
                      </div>
                      <div className="text-[#24A1DE] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Join</span> <i className="fa-solid fa-chevron-right text-[10px]"></i>
                      </div>
                    </a>

                    {/* Branch Group Link (Conditional) */}
                    {showModal.branch && (
                      <a
                        href={showModal.branch === 'Olympic' ? 'https://t.me/+-C7affpBcGI0NzA1' : 'https://t.me/+1Fqron6xNZJjZTM9'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-custom bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-800 hover:border-[#24A1DE] hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <i className="fa-solid fa-building-flag text-sm"></i>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-secondary dark:text-white">
                              {showModal.branch === 'Olympic' ? 'Olympic Branch Group' : 'KoukKhleang Branch Group'}
                            </div>
                            <div className="text-[10px] text-gray-400">Class schedule & branch alerts</div>
                          </div>
                        </div>
                        <div className="text-[#24A1DE] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Join</span> <i className="fa-solid fa-chevron-right text-[10px]"></i>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Error Header */}
                <div className="text-5xl text-primary mb-4 mx-auto flex justify-center">
                  <XCircle className="animate-[pulse_1s_infinite]" size={48} weight="fill" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-center mb-2 text-secondary dark:text-white">
                  {showModal.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm text-center">
                  {showModal.message}
                </p>
                
                {/* Direct Support Contacts */}
                <div className="bg-red-50/50 dark:bg-primary/5 border border-red-100 dark:border-red-950/30 rounded-custom p-5 mb-6 text-left">
                  <h4 className="text-xs uppercase tracking-widest font-black text-primary mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-headset text-base"></i>
                    <span>Manually Contact Admin</span>
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    If this submission error persists, please manually contact our Head Coach or Admin team for assistance:
                  </p>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2 text-secondary dark:text-white">
                      <i className="fa-solid fa-phone text-gray-400 w-4"></i>
                      <span className="font-semibold">+885 12 220 124</span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary dark:text-white">
                      <i className="fa-brands fa-telegram text-gray-400 w-4"></i>
                      <span>Telegram: <a href="https://t.me/infinity_tkd_official" target="_blank" rel="noopener noreferrer" className="text-[#24A1DE] font-semibold hover:underline">@infinity_tkd_official</a></span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary dark:text-white">
                      <i className="fa-solid fa-envelope text-gray-400 w-4"></i>
                      <span className="font-medium text-gray-500 dark:text-gray-400">infinity.tkd.kh@gmail.com</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowModal(prev => ({ ...prev, show: false }))}
              className="btn-infinity-secondary w-full justify-center"
            >
              {t('modal_close')}
            </button>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-cardDark w-full max-w-lg rounded-custom shadow-2xl overflow-hidden transform scale-100 transition-all border-t-4 border-primary flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-cardDark text-secondary dark:text-white">
              <h3 className="text-base font-black text-secondary dark:text-white uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-map-marked-alt text-primary"></i> <span>Our Dojangs</span>
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-custom hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 bg-gray-50 dark:bg-surfaceDark/50">
              {/* Location 1: Olympic */}
              <div className="bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-800 rounded-custom overflow-hidden group shadow-sm hover:shadow-[4px_4px_0px_0px_#EF2F38] transition-all duration-300">
                <div className="p-4 bg-white dark:bg-cardDark border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-secondary dark:text-white text-xs uppercase tracking-wide">1. Olympic Stadium</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">Phnom Penh</p>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/BCBrVjjHB74efUHX8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] uppercase tracking-wider bg-secondary dark:bg-gray-800 text-white px-3 py-1.5 rounded-custom font-bold hover:bg-primary transition-colors"
                  >
                    Open Map <i className="fas fa-external-link-alt ml-1"></i>
                  </a>
                </div>
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 relative grayscale group-hover:grayscale-0 transition-all duration-500">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src="https://maps.google.com/maps?q=Infinity+Taekwondo+-+Olympic,+Phnom+Penh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    title="Olympic Dojang Map"
                  ></iframe>
                </div>
              </div>

              {/* Location 2: KoukKhleang */}
              <div className="bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-800 rounded-custom overflow-hidden group shadow-sm hover:shadow-[4px_4px_0px_0px_#EF2F38] transition-all duration-300">
                <div className="p-4 bg-white dark:bg-cardDark border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-secondary dark:text-white text-xs uppercase tracking-wide">2. KoukKhleang SenSok</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">Phnom Penh</p>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/GtsYFDzYvTjhEHM78"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] uppercase tracking-wider bg-secondary dark:bg-gray-800 text-white px-3 py-1.5 rounded-custom font-bold hover:bg-primary transition-colors"
                  >
                    Open Map <i className="fas fa-external-link-alt ml-1"></i>
                  </a>
                </div>
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 relative grayscale group-hover:grayscale-0 transition-all duration-500">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.6499634968013!2d104.8588103753192!3d11.576931888624712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31094fcd5e542f2b%3A0x9db17eae71f91955!2sInfinity%20Taekwondo!5e0!3m2!1sen!2suk!4v1778916698997!5m2!1sen!2suk"
                    title="Kouk Khleang Dojang Map"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
