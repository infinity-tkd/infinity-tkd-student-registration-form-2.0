import { useState, useEffect, useLayoutEffect, useRef } from "react";
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
  MapPinLine,
  GraduationCap,
  FirstAid,
  Heartbeat,
  Stethoscope,
  ClipboardText,
  PenNib,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Check,
  Storefront,
  Clock,
  Users,
  PhoneCall,
  WarningCircle,
  ChatCircleDots,
  FacebookLogo,
  TelegramLogo,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  CircleNotch,
  CaretDown,
  ShieldCheck,
} from "@phosphor-icons/react";
import SearchableSelect from "./components/SearchableSelect";
import FormField from "./components/FormField";
import Modal from "./components/Modal";
import { interfaceCopy } from "./data/interface";
import {
  cambodiaLocations,
  countryList,
  nationalityList,
} from "./data/locations";
import { phnomPenhSchoolNames, phnomPenhSchools } from "./data/schools";
import {
  relationshipList,
  relationshipTranslations,
} from "./data/relationships";
import { i18n } from "./data/translations";
import { focusAndScroll } from "./utils/scroll";
import { fieldLimits, normalizeField, looksLikeFormula } from "./utils/input";
import { submitRegistration } from "./utils/api";
import { useRegistrationDraft } from "./hooks/useRegistrationDraft";
import { reliabilityCopy } from "./data/reliability";
import { hasDraftData } from "./utils/drafts";
import { ageOnDate as getAge } from "./utils/dates";

const readPreference = (key, values, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return values.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
};
const savePreference = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences are optional in private browsing. */
  }
};
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL || "";

const dayGroups = [
  "Saturday - Sunday",
  "Tuesday - Wednesday",
  "Thursday - Friday",
];

const beltList = ["White", "Yellow", "Green", "Blue", "Red", "Black"];

const weekendTimeSlots = [
  "7:00 - 9:00 AM",
  "9:30 - 11:30 AM",
  "1:00 - 3:00 PM",
  "3:30 - 5:30 PM",
  "6:00 - 8:00 PM",
];

const weekdayTimeSlots = [
  "7:00 - 8:30 AM (Kid Class)",
  "9:00 - 11:00 AM (General)",
  "1:00 - 3:00 PM (General)",
  "3:30 - 5:00 PM (Kid Class)",
  "6:00 - 8:00 PM (General)",
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
  "Tboung Khmum Province": "特本克蒙省",
};

const countryTranslations = {
  en: {
    Cambodia: "Cambodia",
    China: "China",
    "South Korea": "South Korea",
    "North Korea": "North Korea",
    Vietnam: "Vietnam",
    Thailand: "Thailand",
    "United States": "United States",
    France: "France",
    "United Kingdom": "United Kingdom",
    Japan: "Japan",
    Australia: "Australia",
    Canada: "Canada",
    Germany: "Germany",
    Singapore: "Singapore",
    Malaysia: "Malaysia",
    Philippines: "Philippines",
    Russia: "Russia",
    India: "India",
  },
  km: {
    Cambodia: "កម្ពុជា",
    China: "ចិន",
    "South Korea": "កូរ៉េខាងត្បូង",
    "North Korea": "កូរ៉េខាងជើង",
    Vietnam: "វៀតណាម",
    Thailand: "ថៃ",
    "United States": "សហរដ្ឋអាមេរិក",
    France: "បារាំង",
    "United Kingdom": "ចក្រភពអង់គ្លេស",
    Japan: "ជប៉ុន",
    Australia: "អូស្ត្រាលី",
    Canada: "កាណាដា",
    Germany: "អាល្លឺម៉ង់",
    Singapore: "សិង្ហបុរី",
    Malaysia: "ម៉ាឡេស៊ី",
    Philippines: "ហ្វីលីពិន",
    Russia: "រុស្ស៊ី",
    India: "ឥណ្ឌា",
  },
  zh: {
    Cambodia: "柬埔寨",
    China: "中国",
    "South Korea": "韩国",
    "North Korea": "朝鲜",
    Vietnam: "越南",
    Thailand: "泰国",
    "United States": "美国",
    France: "法国",
    "United Kingdom": "英国",
    Japan: "日本",
    Australia: "澳大利亚",
    Canada: "加拿大",
    Germany: "德国",
    Singapore: "新加坡",
    Malaysia: "马来西亚",
    Philippines: "菲律宾",
    Russia: "俄罗斯",
    India: "印度",
  },
};

const nationalityTranslations = {
  en: {
    Cambodian: "Cambodian",
    Chinese: "Chinese",
    Korean: "Korean",
    "South Korean": "South Korean",
    "North Korean": "North Korean",
    Vietnamese: "Vietnamese",
    Thai: "Thai",
    American: "American",
    French: "French",
    British: "British",
    Japanese: "Japanese",
    Australian: "Australian",
    Canadian: "Canadian",
    German: "German",
    Singaporean: "Singaporean",
    Malaysian: "Malaysian",
    Filipino: "Filipino",
    Russian: "Russian",
    Indian: "Indian",
  },
  km: {
    Cambodian: "ខ្មែរ",
    Chinese: "ចិន",
    Korean: "កូរ៉េ",
    "South Korean": "កូរ៉េខាងត្បូង",
    "North Korean": "កូរ៉េខាងជើង",
    Vietnamese: "វៀតណាម",
    Thai: "ថៃ",
    American: "អាមេរិកាំង",
    French: "បារាំង",
    British: "អង់គ្លេស",
    Japanese: "ជប៉ុន",
    Australian: "អូស្ត្រាលី",
    Canadian: "កាណាដា",
    German: "អាល្លឺម៉ង់",
    Singaporean: "សិង្ហបុរី",
    Malaysian: "ម៉ាឡេស៊ី",
    Filipino: "ហ្វីលីពីន",
    Russian: "រុស្ស៊ី",
    Indian: "ឥណ្ឌា",
  },
  zh: {
    Cambodian: "柬埔寨籍",
    Chinese: "中国籍",
    Korean: "韩国籍",
    "South Korean": "韩国籍",
    "North Korean": "朝鲜籍",
    Vietnamese: "越南籍",
    Thai: "泰国籍",
    American: "美国籍",
    French: "法国籍",
    British: "英国籍",
    Japanese: "日本籍",
    Australian: "澳大利亚籍",
    Canadian: "加拿大籍",
    German: "德国籍",
    Singaporean: "新加坡籍",
    Malaysian: "马来西亚籍",
    Filipino: "菲律宾籍",
    Russian: "俄罗斯籍",
    Indian: "印度籍",
  },
};

const linksData = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/infinity.tkd.kh/",
    icon: FacebookLogo,
  },
  {
    name: "Telegram",
    url: "https://t.me/infinity_tkd_official",
    icon: TelegramLogo,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/infinity.tkd/",
    icon: InstagramLogo,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@infinity.tkd",
    icon: TiktokLogo,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@infinity_tkd",
    icon: YoutubeLogo,
  },
];

const initialFormState = {
  englishName: "",
  khmerName: "",
  gender: "",
  dob: "",
  phone: "",
  email: "",
  height: "",
  weight: "",
  nationality: "",
  address: "",
  country: "Cambodia",
  city: "",
  district: "",
  commune: "",
  school: "",
  emergencyContact: "",
  emergencyPhone: "",
  relationship: "",
  medicalNotes: "",
  allergies: "",
  migrationNotes: "",
  branch: "",
  schedule: "",
  belt: "",
  medicalConditions: "",
  medications: "",
  pastInjuries: "",
  otherSports: "",
  liabilityWaiver: false,
  privacyPolicy: false,
  mediaPrivacy: false,
  parentConsent: false,
  howHear: "",
  signature: "",
};

export default function App() {
  const [lang, setLang] = useState(() =>
    readPreference("infinity-language", ["en", "km", "zh"], "en"),
  );
  const [theme, setTheme] = useState(() =>
    readPreference("theme", ["light", "dark"], "light"),
  );
  const stepHeadingRef = useRef(null);
  const previousStep = useRef(1);
  const errorScrollFrame = useRef(null);
  const pendingErrorScroll = useRef(false);
  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState("forward");
  const [formData, setFormData] = useState(initialFormState);
  const [stepTouched, setStepTouched] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
    branch: "",
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [scheduleGroup, setScheduleGroup] = useState("");
  const [classTime, setClassTime] = useState("");
  const [submissionUncertain, setSubmissionUncertain] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  const submissionLock = useRef(false);
  const draft = useRegistrationDraft({
    defaults: initialFormState,
    data: formData,
    step,
    lang,
    scheduleGroup,
    classTime,
    submissionUncertain,
  });
  const reliability = reliabilityCopy[lang];
  const flushDraft = draft.flush;

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => {
      flushDraft();
      setIsOnline(false);
    };
    const ready = () => setOfflineReady(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    window.addEventListener("infinity:offline-ready", ready);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      window.removeEventListener("infinity:offline-ready", ready);
    };
  }, [flushDraft]);

  const resetRegistration = () => {
    draft.discard();
    setFormData(initialFormState);
    setScheduleGroup("");
    setClassTime("");
    setStep(1);
    setStepTouched(false);
    setTouchedFields({});
    setSubmissionUncertain(false);
    setConfirmStartOver(false);
  };
  const resumeRegistration = () => {
    const saved = draft.recovery;
    if (!saved) return;
    const group = dayGroups.includes(saved.scheduleGroup)
      ? saved.scheduleGroup
      : "";
    const slots =
      group === "Saturday - Sunday" ? weekendTimeSlots : weekdayTimeSlots;
    const time = slots.includes(saved.classTime) ? saved.classTime : "";
    const data = {
      ...saved.data,
      schedule:
        saved.data.branch === "Olympic"
          ? "Saturday - Sunday 9:00 - 11:00 AM"
          : saved.data.branch === "KoukKhleang" && group && time
            ? group + ": " + time
            : "",
    };
    setFormData(data);
    setScheduleGroup(group);
    setClassTime(time);
    setStep(saved.step);
    setLang(saved.lang);
    setSubmissionUncertain(saved.submissionUncertain);
    setStepTouched(false);
    setTouchedFields({});
    draft.resume();
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    savePreference("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
    document.title = i18n[lang].form_title + " | Infinity Taekwondo";
    savePreference("infinity-language", lang);
    if (lang === "zh")
      import("@fontsource-variable/noto-sans-sc/wght.css").catch(() => {});
  }, [lang]);

  useLayoutEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      if (!pendingErrorScroll.current) {
        focusAndScroll(stepHeadingRef.current, { block: "start" });
      }
    }
  }, [step]);

  useEffect(() => () => cancelAnimationFrame(errorScrollFrame.current), []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Language helper
  const t = (key) => {
    return i18n[lang]?.[key] || i18n["en"]?.[key] || key;
  };

  const getMaxDobDate = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 6,
      today.getMonth(),
      today.getDate(),
    );
    return [
      maxDate.getFullYear(),
      String(maxDate.getMonth() + 1).padStart(2, "0"),
      String(maxDate.getDate()).padStart(2, "0"),
    ].join("-");
  };

  const getMinDobDate = () => {
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 101,
      today.getMonth(),
      today.getDate() + 1,
    );
    return [
      minDate.getFullYear(),
      String(minDate.getMonth() + 1).padStart(2, "0"),
      String(minDate.getDate()).padStart(2, "0"),
    ].join("-");
  };

  const age = getAge(formData.dob);
  const isUnder17 = formData.dob ? age < 17 : false;

  // Keep the existing schedule values and payload format; update them with the UI selections.
  const updateSchedule = (group, time) => {
    setScheduleGroup(group);
    setClassTime(time);
    setFormData((prev) => ({
      ...prev,
      schedule: group && time ? group + ": " + time : "",
    }));
  };

  // Handle simple input updates with strict character filters and sanitization
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (!Object.hasOwn(initialFormState, name)) return;
    let val = type === "checkbox" ? checked : value;

    if (typeof val === "string") {
      // Normalize input; React text rendering and CSP provide output protections.
      val = normalizeField(
        name,
        name === "phone" || name === "emergencyPhone"
          ? val.replace(/\D/g, "")
          : val,
      );

      // Strict character filters on typing
      if (name === "phone" || name === "emergencyPhone") {
        val = val.replace(/\D/g, "");
      } else if (name === "height" || name === "weight") {
        val = val.replace(/[^0-9.]/g, "");
        const parts = val.split(".");
        if (parts.length > 2) {
          val = parts[0] + "." + parts.slice(1).join("");
        }
      } else if (name === "englishName" || name === "signature") {
        val = val.replace(/[^a-zA-Z\s'-]/g, "");
      } else if (name === "khmerName") {
        val = val.replace(/[^\u1780-\u17FF\s]/g, "");
      } else if (name === "emergencyContact" || name === "relationship") {
        val = val.replace(/[^a-zA-Z\u1780-\u17FF\u4E00-\u9FFF\s'-]/g, "");
      }
    }

    if (name === "branch") {
      setScheduleGroup("");
      setClassTime("");
    }
    setFormData((prev) => ({
      ...prev,
      [name]: val,
      ...(name === "branch"
        ? {
            schedule:
              val === "Olympic" ? "Saturday - Sunday 9:00 - 11:00 AM" : "",
          }
        : {}),
      ...(name === "dob" ? { parentConsent: false } : {}),
    }));
  };

  // Mark field as touched on blur
  const handleBlurField = (name, event) => {
    // Let navigation validate after the click, so a new inline error cannot move
    // the submit button between pointer-down and pointer-up.
    if (event?.relatedTarget?.type === "submit") return;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Friendly alerts on blur for specific key fields
    if (name === "dob") {
      const val = formData.dob;
      if (val) {
        const ageNum = getAge(val);
        if (!Number.isFinite(ageNum) || ageNum < 6 || ageNum > 100) {
          setToast({
            show: true,
            message: t("err_dob_range"),
            type: "warning",
          });
        }
      }
    } else if (name === "signature") {
      const val = formData.signature;
      if (val) {
        if (!/^[a-zA-Z\s'-]+$/.test(val)) {
          setToast({
            show: true,
            message: t("err_sig_format"),
            type: "warning",
          });
        } else if (
          val.trim().replace(/\s+/g, " ").toLowerCase() !==
          formData.englishName.trim().replace(/\s+/g, " ").toLowerCase()
        ) {
          setToast({
            show: true,
            message: t("err_sig_match"),
            type: "warning",
          });
        }
      }
    }
  };

  // Clean value updater for custom select components
  const handleSelectChange = (name, value) => {
    if (!Object.hasOwn(initialFormState, name)) return;
    value = normalizeField(name, value);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Cascading address resets
      if (name === "country" && value !== "Cambodia") {
        updated.city = "";
        updated.district = "";
        updated.commune = "";
      } else if (name === "city") {
        updated.district = "";
        updated.commune = "";
      } else if (name === "district") {
        updated.commune = "";
      }
      return updated;
    });

    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  // Field validation rules
  const validateField = (name) => {
    const val =
      typeof formData[name] === "string"
        ? formData[name].trim()
        : formData[name];
    if (
      looksLikeFormula(val) ||
      (typeof val === "string" && val.length > (fieldLimits[name] || 240))
    )
      return false;
    if (name === "gender") return ["Male", "Female"].includes(val);
    if (name === "branch") return ["Olympic", "KoukKhleang"].includes(val);
    if (name === "belt") return beltList.includes(val);
    // Email Check
    if (name === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    // Phone Check
    if (name === "phone" || name === "emergencyPhone") {
      return /^[0-9]{8,15}$/.test(val);
    }

    // Height Check
    if (name === "height") {
      if (!val) return false;
      const num = Number(val);
      return (
        /^\d+(?:\.\d+)?$/.test(val) &&
        Number.isFinite(num) &&
        num >= 80 &&
        num <= 230
      );
    }

    // Weight Check
    if (name === "weight") {
      if (!val) return false;
      const num = Number(val);
      return (
        /^\d+(?:\.\d+)?$/.test(val) &&
        Number.isFinite(num) &&
        num >= 20 &&
        num <= 200
      );
    }

    // Date of Birth Check
    if (name === "dob") {
      if (!val) return false;
      const ageNum = getAge(val);
      return ageNum >= 6 && ageNum <= 100;
    }

    // Name Checks
    if (name === "englishName") {
      return !!(val && /^[a-zA-Z\s'-]+$/.test(val));
    }
    if (name === "khmerName") {
      return !val || /^[\u1780-\u17FF\s]+$/.test(val);
    }

    // Signature Checks
    if (name === "signature") {
      return !!(
        val &&
        /^[a-zA-Z\s'-]+$/.test(val) &&
        val.trim().replace(/\s+/g, " ").toLowerCase() ===
          formData.englishName.trim().replace(/\s+/g, " ").toLowerCase()
      );
    }

    if (name === "parentConsent") {
      return !isUnder17 || val === true;
    }
    if (
      name === "liabilityWaiver" ||
      name === "privacyPolicy" ||
      name === "mediaPrivacy"
    ) {
      return val === true;
    }
    if (name === "relationship") {
      return !!val;
    }

    // List of required fields
    const requiredFields = [
      "englishName",
      "gender",
      "dob",
      "phone",
      "email",
      "nationality",
      "address",
      "country",
      "emergencyContact",
      "emergencyPhone",
      "relationship",
      "branch",
      "schedule",
      "belt",
      "medicalConditions",
      "medications",
      "pastInjuries",
      "otherSports",
      "howHear",
      "signature",
    ];

    // Additional required fields for Cambodia address cascade
    if (formData.country === "Cambodia") {
      requiredFields.push("city", "district", "commune");
    }

    if (requiredFields.includes(name)) {
      return val !== undefined && val !== null && val !== "";
    }
    return true;
  };

  // Get field error message dynamically
  const getFieldError = (name) => {
    if (!touchedFields[name] && !stepTouched) return null;

    const val =
      typeof formData[name] === "string"
        ? formData[name].trim()
        : formData[name];
    if (looksLikeFormula(val)) return reliability.formula;
    if (typeof val === "string" && val.length > (fieldLimits[name] || 240))
      return reliability.tooLong;

    if ((name === "height" || name === "weight") && !val) {
      return t("err_required");
    }

    // Check required
    const requiredFields = [
      "englishName",
      "gender",
      "dob",
      "phone",
      "email",
      "nationality",
      "address",
      "country",
      "emergencyContact",
      "emergencyPhone",
      "relationship",
      "branch",
      "schedule",
      "belt",
      "medicalConditions",
      "medications",
      "pastInjuries",
      "otherSports",
      "howHear",
      "signature",
    ];
    if (formData.country === "Cambodia") {
      requiredFields.push("city", "district", "commune");
    }

    if (
      requiredFields.includes(name) &&
      (val === undefined || val === null || val === "")
    ) {
      return t("err_required");
    }

    // Check specific formats
    if (name === "email" && val) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t("err_email");
    }
    if ((name === "phone" || name === "emergencyPhone") && val) {
      if (!/^[0-9]{8,15}$/.test(val)) return t("err_phone");
    }
    if (name === "height" && val) {
      if (!validateField("height")) return t("err_height_range");
    }
    if (name === "weight" && val) {
      if (!validateField("weight")) return t("err_weight_range");
    }
    if (name === "dob" && val) {
      if (!validateField("dob")) return t("err_dob_range");
    }
    if (name === "englishName" && val) {
      if (!/^[a-zA-Z\s'-]+$/.test(val)) return t("err_name_format");
    }
    if (name === "khmerName" && val) {
      if (!/^[\u1780-\u17FF\s]+$/.test(val)) return t("err_khmer_name_format");
    }
    if (name === "signature" && val) {
      if (!/^[a-zA-Z\s'-]+$/.test(val)) return t("err_sig_format");
      if (
        val.trim().replace(/\s+/g, " ").toLowerCase() !==
        formData.englishName.trim().replace(/\s+/g, " ").toLowerCase()
      ) {
        return t("err_sig_match");
      }
    }
    if (
      name === "liabilityWaiver" ||
      name === "privacyPolicy" ||
      name === "mediaPrivacy"
    ) {
      if (!val) return t("err_required");
    }
    if (name === "parentConsent" && isUnder17) {
      if (!val) return t("err_required");
    }

    if (!validateField(name)) return t("err_required");
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

  const renderBeltOption = (option) => (
    <span className="belt-option">
      <span className={"belt-dot belt-" + option.toLowerCase()} />
      {t("belt_" + option.toLowerCase())}
    </span>
  );

  const getDayGroupLabel = (opt) => {
    if (opt === "Saturday - Sunday") return t("sched_sat_sun");
    if (opt === "Tuesday - Wednesday") return t("sched_tue_wed");
    if (opt === "Thursday - Friday") return t("sched_thu_fri");
    return opt;
  };

  const getTimeSlotLabel = (slot) => {
    if (!slot) return "";
    let label = slot;
    if (lang === "km") {
      label = label.replace("AM", "ព្រឹក").replace("PM", "ល្ងាច");
      label = label
        .replace("(Kid Class)", "(ថ្នាក់កុមារ)")
        .replace("(General)", "(ទូទៅ)");
    } else if (lang === "zh") {
      label = label.replace("AM", "上午").replace("PM", "下午");
      label = label
        .replace("(Kid Class)", "(儿童班)")
        .replace("(General)", "(普通班)");
    }
    return label;
  };

  const getCountryLabel = (opt) => {
    return countryTranslations[lang]?.[opt] || opt;
  };

  const getCityLabel = (opt) => {
    if (lang === "km") {
      return cambodiaLocations[opt]?.local || opt;
    }
    if (lang === "zh") {
      return cambodiaProvincesZh[opt] || opt;
    }
    return opt;
  };

  const getDistrictLabel = (opt) => {
    if (lang === "km") {
      return cambodiaLocations[formData.city]?.districts?.[opt]?.local || opt;
    }
    return opt;
  };

  const getCommuneLabel = (opt) => {
    if (lang === "km") {
      const comm = cambodiaLocations[formData.city]?.districts?.[
        formData.district
      ]?.communes?.find((c) => c.english === opt);
      return comm?.local || opt;
    }
    return opt;
  };

  const getSchoolLabel = (opt) => {
    const schoolObj = phnomPenhSchools.find((s) => s.english === opt);
    if (schoolObj) {
      if (lang === "km") return schoolObj.khmer;
      if (lang === "zh") return schoolObj.chinese;
      return schoolObj.english;
    }
    return opt;
  };

  // Get location option arrays dynamically
  const provinceOptions = Object.keys(cambodiaLocations).sort();
  const districtOptions =
    formData.city && cambodiaLocations[formData.city]?.districts
      ? Object.keys(cambodiaLocations[formData.city].districts).sort()
      : [];
  const communeOptions =
    formData.city &&
    formData.district &&
    cambodiaLocations[formData.city]?.districts?.[formData.district]?.communes
      ? cambodiaLocations[formData.city].districts[formData.district].communes
          .map((c) => c.english)
          .sort()
      : [];

  // Check if entire step is valid
  const isStepValid = (stepNum) => {
    const fieldsByStep = {
      1: [
        "englishName",
        "khmerName",
        "school",
        "height",
        "weight",
        "gender",
        "dob",
        "phone",
        "email",
        "nationality",
        "address",
        "country",
        "city",
        "district",
        "commune",
      ],
      2: [
        "emergencyContact",
        "emergencyPhone",
        "relationship",
        "medicalNotes",
        "allergies",
        "migrationNotes",
      ],
      3: ["branch", "schedule", "belt"],
      4: ["medicalConditions", "medications", "pastInjuries", "otherSports"],
      5: [
        "liabilityWaiver",
        "privacyPolicy",
        "mediaPrivacy",
        "parentConsent",
        "howHear",
        "signature",
      ],
    };
    return fieldsByStep[stepNum].every((f) => validateField(f));
  };

  // Navigations
  const focusFirstError = (stepNum) => {
    const fieldsByStep = {
      1: [
        "englishName",
        "khmerName",
        "school",
        "height",
        "weight",
        "gender",
        "dob",
        "phone",
        "email",
        "nationality",
        "address",
        "country",
        "city",
        "district",
        "commune",
      ],
      2: [
        "emergencyContact",
        "emergencyPhone",
        "relationship",
        "medicalNotes",
        "allergies",
        "migrationNotes",
      ],
      3: ["branch", "schedule", "belt"],
      4: ["medicalConditions", "medications", "pastInjuries", "otherSports"],
      5: [
        "liabilityWaiver",
        "privacyPolicy",
        "mediaPrivacy",
        "parentConsent",
        "howHear",
        "signature",
      ],
    };

    const firstInvalid = fieldsByStep[stepNum].find((f) => !validateField(f));
    if (firstInvalid) {
      cancelAnimationFrame(errorScrollFrame.current);
      pendingErrorScroll.current = true;
      errorScrollFrame.current = requestAnimationFrame(() => {
        const target =
          firstInvalid === "schedule"
            ? !scheduleGroup
              ? "scheduleGroup"
              : "classTime"
            : firstInvalid;
        const el =
          document.getElementById(target) ||
          document.getElementsByName(target)[0];
        if (el) {
          const details = el.closest("details");
          if (details) details.open = true;
          focusAndScroll(el);
        }
        pendingErrorScroll.current = false;
      });
    }
  };

  const handleNext = () => {
    if (isStepValid(step)) {
      setStepDirection("forward");
      setStep((prev) => prev + 1);
      setStepTouched(false);
    } else {
      setStepTouched(true);
      focusFirstError(step);
      setToast({
        show: true,
        message: t("err_incomplete"),
        type: "error",
      });
    }
  };

  const handleBack = () => {
    setStepDirection("backward");
    setStep((prev) => prev - 1);
    setStepTouched(false);
  };

  const handleStepClick = (targetStep) => {
    setStepDirection(targetStep < step ? "backward" : "forward");
    if (targetStep < step) {
      setStep(targetStep);
      setStepTouched(false);
    } else if (targetStep > step) {
      // Must validate all steps in between
      let check = step;
      while (check < targetStep) {
        if (!isStepValid(check)) {
          setStep(check);
          setStepTouched(true);
          focusFirstError(check);
          setToast({
            show: true,
            message: t("err_incomplete"),
            type: "error",
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
  const handleSubmit = async (e, retryConfirmed = false) => {
    e.preventDefault();

    if (submissionLock.current || isSubmitting) return;
    if (!isOnline || navigator.onLine === false) {
      draft.flush();
      setToast({
        show: true,
        message: reliability.offlineSubmit,
        type: "warning",
      });
      return;
    }
    const invalidStep = [1, 2, 3, 4, 5].find((number) => !isStepValid(number));
    if (invalidStep) {
      setStepDirection(invalidStep < step ? "backward" : "forward");
      setStep(invalidStep);
      setStepTouched(true);
      focusFirstError(invalidStep);
      setToast({
        show: true,
        message: t("err_incomplete"),
        type: "error",
      });
      return;
    }

    if (
      !formData.liabilityWaiver ||
      !formData.privacyPolicy ||
      !formData.mediaPrivacy
    ) {
      setToast({
        show: true,
        message: t("err_agree"),
        type: "error",
      });
      return;
    }

    if (isUnder17 && !formData.parentConsent) {
      setToast({
        show: true,
        message: t("err_parent_consent"),
        type: "error",
      });
      return;
    }

    if (submissionUncertain && !retryConfirmed) {
      setShowModal({
        show: true,
        type: "uncertain",
        title: reliability.errorTitle,
        message: reliability.uncertain,
      });
      return;
    }
    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      const sanitizedData = {};
      Object.keys(initialFormState).forEach((key) => {
        const val = formData[key];
        if (typeof val === "string") {
          sanitizedData[key] = val.trim();
        } else if (typeof val === "boolean") {
          sanitizedData[key] = val ? "Agreed" : "No";
        } else {
          sanitizedData[key] = val;
        }
      });

      if (!isUnder17) {
        sanitizedData["parentConsent"] = "N/A";
      }

      const result = await submitRegistration(GAS_WEB_APP_URL, sanitizedData, {
        onSending: () => {
          setSubmissionUncertain(true);
          draft.flush({ submissionUncertain: true });
        },
      });

      if (result.status === "success") {
        setShowModal({
          show: true,
          title: t("modal_success_title"),
          message: t("modal_success_msg"),
          type: "success",
          branch: formData.branch,
        });
        resetRegistration();
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      const uncertain = error.uncertain === true;
      // Diagnostic codes only: never log names, contact details or health data.
      console.warn("Registration request failed", {
        code: error.serverCode || error.code || "unknown",
        uncertain,
      });
      setSubmissionUncertain(uncertain);
      draft.flush({ submissionUncertain: uncertain });
      setShowModal({
        show: true,
        title: reliability.errorTitle,
        message: uncertain
          ? reliability.uncertain
          : error.code === "configuration"
            ? reliability.configuration
            : error.code === "offline"
              ? reliability.offlineSubmit
              : ["invalid_fields", "consent_required", "invalid_request"].includes(error.serverCode)
                ? reliability.reviewSubmission
                : ["rate_limited", "busy"].includes(error.serverCode)
                  ? reliability.busy
                  : error.serverCode
                    ? reliability.configuration
                    : reliability.rejected,
        type: uncertain ? "uncertain" : "error",
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  const copy = interfaceCopy[lang];
  const stepIcons = [User, FirstAid, Belt, Heartbeat, PenNib];
  const clean = (text) =>
    text
      .replace(/\s*\*$/, "")
      .replace(/\s*\((?:Optional|ស្រេចចិត្ត|ស្រចិត្ត|可选)\)$/, "");
  const describedBy = (id, hint) =>
    [hint && id + "-hint", getFieldError(id) && id + "-error"]
      .filter(Boolean)
      .join(" ") || undefined;
  const field = (
    id,
    label,
    {
      icon,
      hint,
      required = true,
      type = "text",
      placeholder = "",
      className = "",
      ...props
    } = {},
  ) => (
    <FormField
      key={id}
      id={id}
      label={clean(label)}
      hint={hint}
      error={getFieldError(id)}
      required={required}
      optional={copy.optional}
      icon={icon}
      className={className}
    >
      {type === "textarea" ? (
        <textarea
          id={id}
          name={id}
          className="form-input"
          value={formData[id]}
          onChange={handleChange}
          onBlur={(event) => handleBlurField(id, event)}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!getFieldError(id)}
          aria-describedby={describedBy(id, hint)}
          rows={3}
          maxLength={fieldLimits[id] || 240}
          {...props}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          className="form-input"
          value={formData[id]}
          onChange={handleChange}
          onBlur={(event) => handleBlurField(id, event)}
          placeholder={placeholder}
          required={required}
          maxLength={fieldLimits[id] || 240}
          aria-invalid={!!getFieldError(id)}
          aria-describedby={describedBy(id, hint)}
          {...props}
        />
      )}
    </FormField>
  );
  const select = (
    id,
    label,
    options,
    {
      icon,
      hint,
      required = true,
      getLabel = (option) => option,
      value = formData[id],
      onChange = (option) => handleSelectChange(id, option),
      error = getFieldError(id),
      ...props
    } = {},
  ) => (
    <FormField
      key={id}
      id={id}
      label={clean(label)}
      hint={hint}
      error={error}
      required={required}
      optional={copy.optional}
      icon={icon}
    >
      <SearchableSelect
        id={id}
        value={value}
        options={options}
        onChange={onChange}
        onBlur={(event) => handleBlurField(id, event)}
        lang={lang}
        required={required}
        maxLength={fieldLimits[id] || 240}
        getLabel={getLabel}
        error={error}
        describedBy={
          [hint && id + "-hint", error && id + "-error"]
            .filter(Boolean)
            .join(" ") || undefined
        }
        {...props}
      />
    </FormField>
  );
  const nativeSelect = (id, label, options, icon, hint) => (
    <FormField
      id={id}
      label={clean(label)}
      hint={hint}
      error={getFieldError(id)}
      required
      icon={icon}
    >
      <select
        id={id}
        name={id}
        className="form-input"
        value={formData[id]}
        onChange={handleChange}
        onBlur={(event) => handleBlurField(id, event)}
        required
        aria-invalid={!!getFieldError(id)}
        aria-describedby={describedBy(id, hint)}
      >
        <option value="" disabled>
          {copy.select}
        </option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </FormField>
  );
  const section = (title, children, hint) => (
    <section className="form-section">
      <div className="section-heading">
        <h3>{title}</h3>
        {hint && <p>{hint}</p>}
      </div>
      <div className="field-grid">{children}</div>
    </section>
  );
  const reviewRows = [
    [
      copy.personal,
      formData.englishName,
      [
        formData.khmerName,
        formData.dob,
        t(formData.gender === "Male" ? "opt_male" : "opt_female"),
        getNationalityLabel(formData.nationality),
        formData.height && `${formData.height} cm`,
        formData.weight && `${formData.weight} kg`,
      ]
        .filter(Boolean)
        .join(" · "),
      1,
    ],
    [copy.contact, formData.phone, formData.email, 1],
    [
      copy.address,
      formData.address,
      [
        getCommuneLabel(formData.commune),
        getDistrictLabel(formData.district),
        getCityLabel(formData.city),
        getCountryLabel(formData.country),
      ]
        .filter(Boolean)
        .join(", "),
      1,
    ],
    [
      copy.steps[1],
      formData.emergencyContact,
      [formData.emergencyPhone, getRelationshipLabel(formData.relationship)]
        .filter(Boolean)
        .join(" · "),
      2,
    ],
    [
      copy.steps[2],
      formData.branch === "Olympic"
        ? t("branch_olympic")
        : t("branch_koukkhleang"),
      (formData.branch === "Olympic"
        ? getDayGroupLabel("Saturday - Sunday") +
          " · " +
          getTimeSlotLabel("9:00 - 11:00 AM")
        : getDayGroupLabel(scheduleGroup) +
          " · " +
          getTimeSlotLabel(classTime)) +
        " · " +
        getBeltLabel(formData.belt),
      3,
    ],
    ...["medicalConditions", "medications", "pastInjuries", "otherSports"].map(
      (name, index) => [
        clean(
          t(["q_conditions", "q_medications", "q_injuries", "q_sports"][index]),
        ),
        formData[name],
        "",
        4,
      ],
    ),
    ...["medicalNotes", "allergies", "migrationNotes"]
      .filter((name) => formData[name])
      .map((name) => [
        clean(
          t(
            {
              medicalNotes: "ph_medical_notes",
              allergies: "ph_allergies",
              migrationNotes: "ph_migration_notes",
            }[name],
          ),
        ),
        formData[name],
        "",
        2,
      ]),
  ];

  return (
    <div className="app-shell" data-language={lang}>
      <a className="skip-link" href="#registration">
        {copy.skip}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="Infinity Taekwondo">
            <img src="./Logo/infinity-mark.svg" alt="" width="49" height="25" />
            <span>
              INFINITY<span className="brand-subtitle">TAEKWONDO</span>
            </span>
          </a>
          <div className="header-context">
            <span className="header-divider" />
            {copy.registration}
          </div>
          <div className="header-actions">
            <div className="language-control">
              <Globe size={17} aria-hidden="true" />
              <label className="sr-only" htmlFor="langSwitcher">
                {copy.language}
              </label>
              <select
                id="langSwitcher"
                value={lang}
                onChange={(event) => setLang(event.target.value)}
              >
                <option value="en" lang="en">
                  English
                </option>
                <option value="km" lang="km">
                  ខ្មែរ
                </option>
                <option value="zh" lang="zh-Hans">
                  中文
                </option>
              </select>
              <CaretDown size={12} aria-hidden="true" />
            </div>
            <span className="header-divider" />
            <button
              type="button"
              id="themeToggle"
              className="icon-button"
              aria-label={theme === "light" ? copy.dark : copy.light}
              onClick={() =>
                setTheme((previous) =>
                  previous === "light" ? "dark" : "light",
                )
              }
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="page-container">
        {!isOnline && (
          <div className="connection-banner" role="status">
            <WarningCircle size={20} />
            <p>{reliability.offline}</p>
          </div>
        )}
        <section className="welcome">
          <div>
            <p className="eyebrow">
              <span />
              {copy.eyebrow}
            </p>
            <h1>
              {copy.welcome}
              <br />
              <span>{copy.welcomeAccent}</span>
            </h1>
            <p className="welcome-description">{copy.introduction}</p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <span className="art-ring ring-one" />
            <span className="art-ring ring-two" />
            <span className="art-ring ring-three" />
            <img
              src="./Logo/infinity-mark.svg"
              alt=""
              width="180"
              height="90"
            />
            <span className="art-caption">INFINITY TAEKWONDO</span>
            <span className="art-cross cross-one">+</span>
            <span className="art-cross cross-two">+</span>
          </div>
        </section>

        <div className="registration-layout" id="registration">
          <aside className="journey-sidebar">
            <div className="journey-panel">
              <div className="journey-label">
                <span>{copy.registration}</span>
                <span className="step-counter">
                  {String(step).padStart(2, "0")} / 05
                </span>
              </div>
              <nav aria-label={copy.progress}>
                <ol className="step-list">
                  {copy.steps.map((title, index) => {
                    const number = index + 1;
                    const Icon = stepIcons[index];
                    const completed = number < step && isStepValid(number);
                    return (
                      <li
                        key={number}
                        className={
                          number === step
                            ? "current"
                            : completed
                              ? "completed"
                              : ""
                        }
                      >
                        <button
                          type="button"
                          disabled={isSubmitting}
                          aria-current={number === step ? "step" : undefined}
                          aria-label={
                            title +
                            (completed
                              ? ", " + copy.complete
                              : number === step
                                ? ", " + copy.current
                                : "")
                          }
                          onClick={() => handleStepClick(number)}
                        >
                          <span className="step-node">
                            {completed ? (
                              <Check size={18} weight="bold" />
                            ) : (
                              <Icon size={20} />
                            )}
                          </span>
                          <span className="step-copy">
                            <strong>{title}</strong>
                            <span>{copy.stepDescriptions[index]}</span>
                          </span>
                          {number === step && <span className="active-dot" />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <div className="journey-note">
                <span className="note-rule" />
                <p>{copy.welcomeNote}</p>
                <span className="values">{copy.values}</span>
              </div>
            </div>
            <div className="help-card">
              <ChatCircleDots size={23} />
              <div>
                <h3>{copy.help}</h3>
                <p>{copy.helpText}</p>
                <a
                  href="https://t.me/infinity_tkd_official"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.contactTeam}
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </aside>

          <div className="form-card">
            <div className="form-topline">
              <span>
                {copy.step} {String(step).padStart(2, "0")} {copy.of} 05
              </span>
              <span>
                <span className="required-mark">*</span> {copy.required}
              </span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={copy.progress}
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={step}
              aria-valuetext={copy.steps[step - 1]}
            >
              <span style={{ width: (step / 5) * 100 + "%" }} />
            </div>
            <form
              noValidate
              onSubmit={(event) => {
                if (step < 5) {
                  event.preventDefault();
                  handleNext();
                } else handleSubmit(event);
              }}
              aria-busy={isSubmitting}
            >
              <fieldset
                className="form-body"
                disabled={isSubmitting || !!draft.recovery}
              >
                <legend className="sr-only">{copy.steps[step - 1]}</legend>
                <div
                  className={`step-content step-${stepDirection}`}
                  key={step}
                >
                  <div className="step-heading">
                    <h2 ref={stepHeadingRef} tabIndex={-1}>
                      {copy.steps[step - 1]}
                      <span className="heading-dot">.</span>
                    </h2>
                    <p>{copy.descriptions[step - 1]}</p>
                  </div>
                  {stepTouched && (
                    <div className="validation-summary" role="alert">
                      <WarningCircle size={19} />
                      {copy.errorSummary}
                    </div>
                  )}

                  {step === 1 && (
                    <>
                      {section(
                        copy.personal,
                        <>
                          {field("englishName", t("ph_english_name"), {
                            icon: User,
                            hint: copy.englishHint,
                            autoComplete: "name",
                            placeholder: "e.g. Sok Dara",
                            lang: "en",
                            spellCheck: false,
                          })}
                          {field("khmerName", t("ph_khmer_name"), {
                            icon: Translate,
                            hint: copy.khmerHint,
                            required: false,
                            placeholder: "ឧ. សុខ ដារ៉ា",
                            lang: "km",
                          })}
                          {nativeSelect(
                            "gender",
                            t("opt_gender"),
                            [
                              ["Male", t("opt_male")],
                              ["Female", t("opt_female")],
                            ],
                            User,
                          )}
                          {field("dob", t("lbl_dob"), {
                            icon: CalendarBlank,
                            type: "date",
                            min: getMinDobDate(),
                            max: getMaxDobDate(),
                            hint: copy.dobHint,
                            autoComplete: "bday",
                          })}
                          {select(
                            "nationality",
                            t("opt_select_nation"),
                            nationalityList,
                            { icon: Globe, getLabel: getNationalityLabel },
                          )}
                          {formData.country === "Cambodia" &&
                          formData.city === "Phnom Penh Capital"
                            ? select(
                                "school",
                                t("ph_school"),
                                phnomPenhSchoolNames,
                                {
                                  icon: GraduationCap,
                                  required: false,
                                  getLabel: getSchoolLabel,
                                  allowCustomValue: true,
                                  hint: copy.schoolHint,
                                },
                              )
                            : field("school", t("ph_school"), {
                                icon: GraduationCap,
                                required: false,
                              })}
                        </>,
                      )}
                      {section(
                        copy.contact,
                        <>
                          {field("phone", t("ph_phone"), {
                            icon: Phone,
                            type: "tel",
                            inputMode: "tel",
                            autoComplete: "tel",
                            hint: copy.phoneHint,
                            placeholder: "012 345 678",
                          })}
                          {field("email", t("ph_email"), {
                            icon: EnvelopeSimple,
                            type: "email",
                            autoComplete: "email",
                            placeholder: "you@example.com",
                            autoCapitalize: "none",
                            spellCheck: false,
                          })}
                        </>,
                      )}
                      {section(
                        copy.address,
                        <>
                          {field("address", t("ph_address1"), {
                            icon: MapPinLine,
                            hint: copy.addressHint,
                            autoComplete: "street-address",
                            className: "full-width",
                          })}
                          {select("country", copy.country, countryList, {
                            icon: Globe,
                            getLabel: getCountryLabel,
                          })}
                          {formData.country === "Cambodia" && (
                            <>
                              {select(
                                "city",
                                t("opt_select_prov"),
                                provinceOptions,
                                { icon: MapPinLine, getLabel: getCityLabel },
                              )}
                              {select(
                                "district",
                                t("opt_select_dist"),
                                districtOptions,
                                {
                                  icon: MapPinLine,
                                  getLabel: getDistrictLabel,
                                  disabled: !formData.city,
                                },
                              )}
                              {select(
                                "commune",
                                t("opt_select_commune"),
                                communeOptions,
                                {
                                  icon: MapPinLine,
                                  getLabel: getCommuneLabel,
                                  disabled: !formData.district,
                                },
                              )}
                            </>
                          )}
                        </>,
                      )}
                      <section className="form-section measurements-section">
                        <div className="section-heading">
                          <h3>{copy.measurements}</h3>
                          <p>{copy.measurementsHint}</p>
                        </div>
                        <div className="field-grid">
                          {field("height", t("lbl_height"), {
                            icon: Ruler,
                            type: "number",
                            min: 80,
                            max: 230,
                            step: "any",
                            inputMode: "decimal",
                          })}
                          {field("weight", t("lbl_weight"), {
                            icon: Barbell,
                            type: "number",
                            min: 20,
                            max: 200,
                            step: "any",
                            inputMode: "decimal",
                          })}
                        </div>
                      </section>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      {isUnder17 && (
                        <div className="info-banner warning">
                          <FirstAid size={22} />
                          <p>{t("warn_under17_emergency")}</p>
                        </div>
                      )}
                      <div className="field-grid">
                        {field("emergencyContact", t("ph_em_name"), {
                          icon: User,
                          autoComplete: "section-emergency name",
                        })}
                        {field("emergencyPhone", t("ph_em_phone"), {
                          icon: PhoneCall,
                          type: "tel",
                          inputMode: "tel",
                          autoComplete: "section-emergency tel",
                          hint: copy.phoneHint,
                        })}
                        {select(
                          "relationship",
                          t("ph_relationship"),
                          relationshipList,
                          {
                            icon: Users,
                            getLabel: getRelationshipLabel,
                            allowCustomValue: true,
                          },
                        )}
                      </div>
                      <details className="optional-section">
                        <summary>
                          <span>{copy.notes}</span>
                          <span className="optional-label">
                            {copy.optional}
                            <CaretDown size={14} />
                          </span>
                        </summary>
                        <p className="section-description">{copy.notesHint}</p>
                        <div className="field-grid single-column">
                          {field("medicalNotes", t("ph_medical_notes"), {
                            icon: Stethoscope,
                            required: false,
                            type: "textarea",
                          })}
                          {field("allergies", t("ph_allergies"), {
                            icon: WarningCircle,
                            required: false,
                            type: "textarea",
                          })}
                          {field("migrationNotes", t("ph_migration_notes"), {
                            icon: ClipboardText,
                            required: false,
                            type: "textarea",
                          })}
                        </div>
                      </details>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="branch-heading">
                        <h3>
                          {clean(t("opt_branch"))}
                          <span className="required-mark"> *</span>
                        </h3>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setIsLocationModalOpen(true)}
                        >
                          <MapPinLine size={15} />
                          {copy.locations}
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                      <div
                        className="branch-grid"
                        role="radiogroup"
                        aria-label={clean(t("opt_branch"))}
                        aria-required="true"
                        aria-describedby={
                          getFieldError("branch") ? "branch-error" : undefined
                        }
                      >
                        {["Olympic", "KoukKhleang"].map((branch, index) => (
                          <label
                            className={
                              "branch-card " +
                              (formData.branch === branch ? "selected" : "")
                            }
                            key={branch}
                          >
                            <input
                              id={index === 0 ? "branch" : "branch-kouk"}
                              type="radio"
                              name="branch"
                              value={branch}
                              checked={formData.branch === branch}
                              onChange={handleChange}
                            />
                            <Storefront size={26} />
                            <strong>
                              {t(
                                index === 0
                                  ? "branch_olympic"
                                  : "branch_koukkhleang",
                              )}
                            </strong>
                            <span>{copy.city}</span>
                            <span className="branch-check">
                              <Check size={12} weight="bold" />
                            </span>
                          </label>
                        ))}
                      </div>
                      {getFieldError("branch") && (
                        <p
                          id="branch-error"
                          className="field-error"
                          role="alert"
                        >
                          <WarningCircle size={15} />
                          {getFieldError("branch")}
                        </p>
                      )}
                      <div className="form-section">
                        <div className="field-grid">
                          {!formData.branch && (
                            <div className="info-banner full-width">
                              <Clock size={21} />
                              <p>{copy.classHint}</p>
                            </div>
                          )}
                          {formData.branch === "Olympic" && (
                            <div className="schedule-preview full-width">
                              <CalendarBlank size={24} />
                              <div>
                                <span>{clean(t("opt_schedule"))}</span>
                                <strong>
                                  {getDayGroupLabel("Saturday - Sunday")}
                                </strong>
                                <p>{getTimeSlotLabel("9:00 - 11:00 AM")}</p>
                              </div>
                              <CheckCircle size={23} />
                            </div>
                          )}
                          {formData.branch === "KoukKhleang" && (
                            <>
                              {select(
                                "scheduleGroup",
                                t("lbl_schedule_group"),
                                dayGroups,
                                {
                                  icon: CalendarBlank,
                                  value: scheduleGroup,
                                  onChange: (group) =>
                                    updateSchedule(group, ""),
                                  getLabel: getDayGroupLabel,
                                  error:
                                    stepTouched && !scheduleGroup
                                      ? t("err_required")
                                      : null,
                                },
                              )}
                              {select(
                                "classTime",
                                t("lbl_class_time"),
                                scheduleGroup === "Saturday - Sunday"
                                  ? weekendTimeSlots
                                  : weekdayTimeSlots,
                                {
                                  icon: Clock,
                                  value: classTime,
                                  onChange: (time) =>
                                    updateSchedule(scheduleGroup, time),
                                  disabled: !scheduleGroup,
                                  getLabel: getTimeSlotLabel,
                                  error:
                                    stepTouched && !classTime
                                      ? t("err_required")
                                      : null,
                                  hint: !scheduleGroup
                                    ? copy.daysFirst
                                    : undefined,
                                },
                              )}
                            </>
                          )}
                          {select("belt", t("opt_belt"), beltList, {
                            icon: Belt,
                            getLabel: getBeltLabel,
                            renderOption: renderBeltOption,
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <div className="info-banner">
                        <ShieldCheck size={22} />
                        <p>{copy.healthHint}</p>
                      </div>
                      <div className="health-fields">
                        {[
                          "medicalConditions",
                          "medications",
                          "pastInjuries",
                          "otherSports",
                        ].map((name, index) =>
                          field(
                            name,
                            t(
                              [
                                "q_conditions",
                                "q_medications",
                                "q_injuries",
                                "q_sports",
                              ][index],
                            ),
                            {
                              icon: index === 3 ? Barbell : Stethoscope,
                              type: "textarea",
                              placeholder: t("ph_yes_no_details"),
                            },
                          ),
                        )}
                      </div>
                    </>
                  )}

                  {step === 5 && (
                    <>
                      <section className="review-section">
                        <h3>{copy.review}</h3>
                        <div className="review-list">
                          {reviewRows.map(
                            ([label, value, detail, number], index) => (
                              <div className="review-row" key={index}>
                                <div>
                                  <span>{label}</span>
                                  <strong>{value || copy.notProvided}</strong>
                                  {detail && <p>{detail}</p>}
                                </div>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() => handleStepClick(number)}
                                  aria-label={copy.edit + ": " + label}
                                >
                                  {copy.edit}
                                  <ArrowUpRight size={13} />
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      </section>
                      <div className="policy-list">
                        {[
                          "liabilityWaiver",
                          "privacyPolicy",
                          "mediaPrivacy",
                          ...(isUnder17 ? ["parentConsent"] : []),
                        ].map((name, index) => {
                          const prefix = [
                            "liability",
                            "privacy",
                            "media",
                            "parent",
                          ][index];
                          return (
                            <div
                              className={
                                "policy-card " +
                                (formData[name] ? "accepted" : "")
                              }
                              key={name}
                            >
                              <details>
                                <summary>
                                  <span className="policy-number">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  <span>{copy.policies[index]}</span>
                                  <CaretDown size={16} />
                                </summary>
                                <div className="policy-text">
                                  {[1, 2, 3, 4, 5].map((number) => (
                                    <p key={number}>
                                      {t(prefix + "_p" + number)}
                                    </p>
                                  ))}
                                </div>
                              </details>
                              <label className="agreement-label" htmlFor={name}>
                                <input
                                  id={name}
                                  name={name}
                                  type="checkbox"
                                  checked={formData[name]}
                                  onChange={handleChange}
                                  required
                                  aria-invalid={!!getFieldError(name)}
                                  aria-describedby={
                                    getFieldError(name)
                                      ? name + "-error"
                                      : undefined
                                  }
                                />
                                <span>{t("agree_" + prefix)}</span>
                              </label>
                              {getFieldError(name) && (
                                <p
                                  className="field-error"
                                  id={name + "-error"}
                                  role="alert"
                                >
                                  {getFieldError(name)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="field-grid final-fields">
                        {nativeSelect(
                          "howHear",
                          copy.source,
                          [
                            "Facebook",
                            "TikTok",
                            "Google",
                            "Friend/Family",
                            "Banner/Flyer",
                            "Other",
                          ].map((value, index) => [
                            value,
                            t(
                              [
                                "hear_facebook",
                                "hear_tiktok",
                                "hear_google",
                                "hear_friend_family",
                                "hear_banner_flyer",
                                "hear_other",
                              ][index],
                            ),
                          ]),
                          ChatCircleDots,
                        )}
                        {field("signature", copy.signature, {
                          icon: PenNib,
                          hint: copy.signatureHint,
                          placeholder: formData.englishName,
                          lang: "en",
                          spellCheck: false,
                        })}
                      </div>
                    </>
                  )}
                </div>
              </fieldset>

              <div className="form-footer">
                <div className="form-navigation">
                  {step > 1 ? (
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft size={17} />
                      {t("btn_back")}
                    </button>
                  ) : (
                    <span className="footer-note">
                      <ShieldCheck size={18} />
                      {copy.stayHere}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={isSubmitting || (step === 5 && !isOnline)}
                  >
                    {isSubmitting ? (
                      <>
                        <CircleNotch className="spinner" size={19} />
                        {copy.processing}
                      </>
                    ) : (
                      <>
                        {step === 5 ? t("btn_submit") : copy.next}
                        {step === 5 ? (
                          <Check size={18} />
                        ) : (
                          <ArrowRight size={18} />
                        )}
                      </>
                    )}
                  </button>
                </div>
                <div className="next-step-hint">
                  {step < 5 ? (
                    <>
                      {copy.nextUp}: {copy.steps[step]}
                    </>
                  ) : (
                    copy.submitHint
                  )}
                </div>
                <div className="draft-controls">
                  <span
                    className={
                      draft.status === "unavailable" ? "draft-warning" : ""
                    }
                    role="status"
                  >
                    {draft.status === "unavailable"
                      ? reliability.storageUnavailable
                      : hasDraftData(formData, initialFormState)
                        ? draft.status === "saved"
                          ? reliability.saved
                          : reliability.saving
                        : copy.stayHere}
                    {offlineReady && (
                      <small> · {reliability.offlineReady}</small>
                    )}
                  </span>
                  {hasDraftData(formData, initialFormState) && (
                    <button
                      type="button"
                      className="text-button"
                      disabled={isSubmitting}
                      onClick={() => setConfirmStartOver(true)}
                    >
                      {reliability.startOver}
                    </button>
                  )}
                </div>
                <details className="draft-privacy">
                  <summary>{reliability.privacyLabel}</summary>
                  <p>{reliability.privacy}</p>
                </details>
              </div>
            </form>
          </div>
        </div>

        <section className="community-section">
          <div>
            <h2>{copy.community}</h2>
            <p>{copy.communityText}</p>
          </div>
          <div className="community-links">
            {linksData.map(({ name, url, icon: Icon }) => (
              <a
                href={url}
                key={name}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
              >
                <Icon size={21} />
                <span className="sr-only">{name}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              aria-label={copy.locations}
              title={copy.locations}
            >
              <MapPinLine size={21} />
            </button>
          </div>
        </section>
        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} Infinity Taekwondo. {copy.rights}
          </span>
          <span>{copy.values}</span>
        </footer>
      </main>

      {toast.show && (
        <div className="toast" role="status" aria-live="polite">
          <WarningCircle size={20} />
          <p>{toast.message}</p>
          <button
            type="button"
            aria-label={copy.close}
            onClick={() =>
              setToast((previous) => ({ ...previous, show: false }))
            }
          >
            <XCircle size={19} />
          </button>
        </div>
      )}
      {showModal.show && (
        <Modal
          title={
            showModal.type === "success"
              ? t("modal_success_title")
              : reliability.errorTitle
          }
          closeLabel={copy.close}
          onClose={() =>
            setShowModal((previous) => ({ ...previous, show: false }))
          }
        >
          <div className={"result-symbol " + showModal.type}>
            {showModal.type === "success" ? (
              <CheckCircle size={42} />
            ) : (
              <WarningCircle size={42} />
            )}
          </div>
          <p className="modal-description">
            {showModal.type === "success"
              ? t("modal_success_msg")
              : showModal.message || t("modal_error_msg")}
          </p>
          {showModal.type === "success" ? (
            <div className="modal-section">
              <h3>{copy.joinGroups}</h3>
              <p>{copy.joinText}</p>
              <a
                className="group-link"
                href="https://t.me/+ms0hN3F0k6ZhOTI1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TelegramLogo size={24} />
                <span>
                  <strong>{copy.family}</strong>
                  <small>{copy.familyHint}</small>
                </span>
                <ArrowUpRight size={18} />
              </a>
              {showModal.branch && (
                <a
                  className="group-link"
                  href={
                    showModal.branch === "Olympic"
                      ? "https://t.me/+-C7affpBcGI0NzA1"
                      : "https://t.me/+1Fqron6xNZJjZTM9"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Storefront size={24} />
                  <span>
                    <strong>
                      {t(
                        showModal.branch === "Olympic"
                          ? "branch_olympic"
                          : "branch_koukkhleang",
                      )}
                    </strong>
                    <small>{copy.branchGroup}</small>
                  </span>
                  <ArrowUpRight size={18} />
                </a>
              )}
            </div>
          ) : (
            <div className="modal-section">
              <h3>{copy.support}</h3>
              <p>{copy.supportText}</p>
              <a
                className="support-link"
                href="https://t.me/infinity_tkd_official"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TelegramLogo size={19} />
                @infinity_tkd_official
                <ArrowUpRight size={15} />
              </a>
              <a
                className="support-link"
                href="mailto:infinity.tkd.kh@gmail.com"
              >
                <EnvelopeSimple size={19} />
                infinity.tkd.kh@gmail.com
              </a>
            </div>
          )}
          {showModal.type === "uncertain" && (
            <button
              type="button"
              className="button button-secondary full-width retry-confirmed"
              onClick={() => {
                setShowModal((previous) => ({ ...previous, show: false }));
                handleSubmit({ preventDefault() {} }, true);
              }}
            >
              {reliability.retryConfirmed}
            </button>
          )}
          <button
            type="button"
            className="button button-primary full-width"
            onClick={() =>
              setShowModal((previous) => ({ ...previous, show: false }))
            }
          >
            {copy.close}
          </button>
        </Modal>
      )}
      {draft.recovery && (
        <Modal
          title={reliability.recoveryTitle}
          closeLabel={copy.close}
          dismissible={false}
          onClose={() => {}}
        >
          <p className="modal-description">{reliability.recoveryText}</p>
          <p className="draft-recovery-time">
            {new Intl.DateTimeFormat(
              lang === "km" ? "km-KH" : lang === "zh" ? "zh-CN" : "en-GB",
              { dateStyle: "medium", timeStyle: "short" },
            ).format(draft.recovery.savedAt)}
          </p>
          <p className="draft-recovery-privacy">{reliability.privacy}</p>
          {draft.recovery.submissionUncertain && (
            <p className="info-banner warning">{reliability.uncertain}</p>
          )}
          <div className="recovery-actions">
            <button
              type="button"
              className="button button-primary"
              data-action="continue-draft"
              onClick={resumeRegistration}
            >
              {reliability.continueDraft}
            </button>
            <button
              type="button"
              className="button button-secondary"
              data-action="discard-draft"
              onClick={resetRegistration}
            >
              {reliability.startOver}
            </button>
          </div>
        </Modal>
      )}
      {confirmStartOver && (
        <Modal
          title={reliability.clearTitle}
          closeLabel={copy.close}
          onClose={() => setConfirmStartOver(false)}
        >
          <p className="modal-description">{reliability.clearText}</p>
          <div className="recovery-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setConfirmStartOver(false)}
            >
              {reliability.cancel}
            </button>
            <button
              type="button"
              className="button button-primary"
              data-action="confirm-start-over"
              onClick={resetRegistration}
            >
              {reliability.startOver}
            </button>
          </div>
        </Modal>
      )}
      {isLocationModalOpen && (
        <Modal
          title={copy.locations}
          closeLabel={copy.close}
          onClose={() => setIsLocationModalOpen(false)}
        >
          <div className="location-list">
            {[
              [
                "branch_olympic",
                "https://maps.app.goo.gl/BCBrVjjHB74efUHX8",
                "https://maps.google.com/maps?q=Infinity+Taekwondo+-+Olympic,+Phnom+Penh&t=&z=15&ie=UTF8&iwloc=&output=embed",
              ],
              [
                "branch_koukkhleang",
                "https://maps.app.goo.gl/GtsYFDzYvTjhEHM78",
                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.6499634968013!2d104.8588103753192!3d11.576931888624712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31094fcd5e542f2b%3A0x9db17eae71f91955!2sInfinity%20Taekwondo!5e0!3m2!1sen!2suk!4v1778916698997!5m2!1sen!2suk",
              ],
            ].map(([title, url, embed]) => (
              <article className="location-card" key={title}>
                <div>
                  <h3>{t(title)}</h3>
                  <p>{copy.city}</p>
                  <a
                    className="text-button"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.openMap}
                    <ArrowUpRight size={15} />
                  </a>
                </div>
                <iframe
                  src={embed}
                  title={t(title)}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              </article>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
