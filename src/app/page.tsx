
"use client";
import { useState, useEffect } from "react";
import { FiInfo, FiX } from "react-icons/fi";
 

export default function Home() {
  const teamMembers = [
    "Lucius Malizani",
    "Hopkins Ceaser",
    "Joseph Dzanja",
    "Lameck Mbewe",
    "Astonie Mukiwa",
  ];
  const [facilitatorIndex, setFacilitatorIndex] = useState(0);
  const [showFacilitatorName, setShowFacilitatorName] = useState(false);
  const [nextMeetingDate, setNextMeetingDate] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  // Timetable data (shortened for brevity, expand as needed)
  const timetable = [
    {
      week: "Week 1 (June 10–15)",
      title: "Introduction + Domain 1: Information Security and Ethical Hacking Overview",
      details: [
        "Concepts: InfoSec fundamentals, hacking phases, attack vectors, threat categories",
        "Tools: Terminology, hacker types",
        "Task: Set up lab environment (Kali Linux, vulnerable VMs)",
      ],
    },
    {
      week: "Week 2 (June 16–22)",
      title: "Domain 2: Footprinting and Reconnaissance",
      details: [
        "Techniques: Active/passive footprinting, Whois, Google hacking",
        "Tools: Maltego, Recon-ng",
        "Lab: Perform footprinting",
      ],
    },
    {
      week: "Week 3 (June 23–29)",
      title: "Domain 3: Scanning Networks",
      details: [
        "Techniques: Ping sweep, port scanning",
        "Tools: Nmap, Zenmap",
        "Lab: Scan a test",
      ],
    },
    {
      week: "Week 4 (June 30–July 6)",
      title: "Domain 4: Enumeration",
      details: [
        "Techniques: NetBIOS, SNMP, SMTP",
        "Tools: enum4linux",
        "Lab: Enumerate a target",
      ],
    },
    {
      week: "Week 5 (July 7–13)",
      title: "Domain 5: Vulnerability Analysis",
      details: [
        "Techniques: Vulnerability assessment",
        "Tools: Nessus, OpenVAS",
        "Lab: Scan vulnerabilities",
      ],
    },
    {
      week: "Week 6 (July 14–20)",
      title: "Domain 6: System Hacking",
      details: [
        "Topics: Password cracking, escalation",
        "Tools: John the Ripper",
        "Lab: Crack shell",
      ],
    },
    {
      week: "Week 7 (July 21–27)",
      title: "Domain 7: Malware Threats",
      details: [
        "Types: Trojans, worms",
        "Tools: Maltego, PEiD",
        "Lab: Analyze malware",
      ],
    },
    {
      week: "Week 8 (July 28–August 3)",
      title: "Domain 8: Sniffing",
      details: [
        "Techniques: Packet sniffing, MITM",
        "Tools: Wireshark",
        "Lab: Sniff traffic",
      ],
    },
    {
      week: "Week 9 (August 4–10)",
      title: "Domain 9: Social Engineering",
      details: [
        "Techniques: Phishing, tailgating",
        "Tools: SET",
        "Activity: Simulate phishing",
      ],
    },
    {
      week: "Week 10 (August 11–17)",
      title: "Domain 10: Denial-of-Service",
      details: [
        "Attacks: Volumetric, protocol",
        "Tools: LOIC, Hping",
        "Lab: DoS simulation",
      ],
    },
    {
      week: "Week 11 (August 18–24)",
      title: "Domains 11–12: Session Hijacking, IDS Evasion",
      details: [
        "Topics: Session interception, evasion",
        "Tools: Burp Suite",
        "Lab: Simulate hijacking",
      ],
    },
    {
      week: "Week 12 (August 25–31)",
      title: "Domains 13–14: Web and Wireless Hacking",
      details: [
        "Attacks: SQLi, XSS, WPA",
        "Tools: SQLMap, Aircrack",
        "Lab: Exploit web app",
      ],
    },
    {
      week: "Week 13 (September 1–6)",
      title: "Domains 15–20: Mobile, Cloud, Crypto",
      details: [
        "Topics: Encryption, mobile",
        "Tools: OpenSSL",
        "Lab: Secure mobile",
      ],
    },
    {
      week: "Final Review (September 7–10)",
      title: "Final",
      details: [
        "Tasks: Take 2 practice exams",
        "Review: Weak areas",
        "Lab: Revisit labs",
      ],
    },
  ];

  // Get next Tuesday or Thursday with time (20:00 CAT), but if today is a meeting day and before 8:15pm, show today
  const getNextMeetingDateTime = () => {
    const now = new Date();
    const catNow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Harare" }));
    const day = catNow.getDay();
    const hours = catNow.getHours();
    const minutes = catNow.getMinutes();
    // If today is Tues (2) or Thurs (4) and before 8:15pm, show today at 8pm
    if ((day === 2 || day === 4) && (hours < 20 || (hours === 20 && minutes < 15))) {
      const today8pm = new Date(catNow);
      today8pm.setHours(20, 0, 0, 0);
      return today8pm.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Harare"
      });
    }
    // Otherwise, find the next meeting (same as before)
    let daysUntilNextMeeting = 0;
    if (day <= 1) daysUntilNextMeeting = 2 - day;
    else if (day === 2) daysUntilNextMeeting = 2;
    else if (day === 3) daysUntilNextMeeting = 1;
    else if (day === 4) daysUntilNextMeeting = 5;
    else daysUntilNextMeeting = 2 + (7 - day);
    const nextDate = new Date(catNow);
    nextDate.setDate(catNow.getDate() + daysUntilNextMeeting);
    nextDate.setHours(20, 0, 0, 0);
    return nextDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Harare"
    });
  };

  // Fetch current facilitator from API
  useEffect(() => {
    async function fetchFacilitator() {
      const res = await fetch("/api/facilitator");
      const data = await res.json();
      setFacilitatorIndex(data.index);
    }
    fetchFacilitator();
    setNextMeetingDate(getNextMeetingDateTime());
    // Show facilitator name at the right time (production logic)
    const checkTime = () => {
      const now = new Date();
      const catTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Harare" }));
      const day = catTime.getDay();
      const hours = catTime.getHours();
      setShowFacilitatorName((day === 2 || day === 4) && hours >= 20 && hours < 21);
      // If after 8:15 PM CAT, update next meeting date to the following meeting
      if ((day === 2 || day === 4) && (hours > 20 || (hours === 20 && catTime.getMinutes() >= 15))) {
        setNextMeetingDate(getNextMeetingDateTime());
      }
    };
    checkTime();
    const interval = setInterval(() => {
      fetchFacilitator();
      checkTime();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Toggle accordion week (not used in new design, but kept for reference)
  // const toggleWeek = (index: number) => {
  //   setOpenWeek(index === openWeek ? null : index);
  // };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white font-mono relative">
      {/* Info Button */}
      <button
        className="fixed top-4 right-4 z-[100] text-cyan-300 text-2xl hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 active:scale-95"
        aria-label="Info"
        style={{ touchAction: 'manipulation' }}
        onClick={() => setShowInfo(true)}
        tabIndex={0}
      >
        <FiInfo />
      </button>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-0 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md relative mx-auto my-8 sm:my-0 overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-cyan-400 text-xl"
              onClick={() => setShowInfo(false)}
              aria-label="Close"
            >
              <FiX />
            </button>
            <h2 className="text-xl font-bold mb-2 text-cyan-300">About This App</h2>
            <p className="text-base leading-relaxed mb-2">
              This app manages the Ethical Hacking Study Group schedule, automatically assigning facilitators for each session and displaying the current, previous, and next topics. Facilitator selection is persistent and fair, and the UI is designed for clarity and focus.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-300 mb-2">
              <li>Facilitator is chosen in a round-robin, persistent way.</li>
              <li>Current, previous, and next topics are always visible.</li>
              <li>Schedule and facilitator logic is automated for the group.</li>
            </ul>
            <p className="text-xs text-gray-500">Built for Ethical Hacking v13 Certification Study Group</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl p-2 sm:p-4">
        {/* Hero Section - Improved */}
        <section className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-900/80 to-gray-800 rounded-2xl shadow-2xl p-8 mb-2 border border-cyan-700/40 relative overflow-hidden max-w-4xl">
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" className="opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="50%" cy="50%" r="80%" fill="url(#glow)" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-cyan-300 drop-shadow mb-2 z-10 text-center">
            Ethical Hacking Study Group
          </h1>
          <p className="text-base sm:text-lg text-cyan-100 mb-4 z-10 text-center max-w-xl">
            Welcome! This app helps our group stay organized, track facilitators, and keep everyone on schedule for CEH v13. <span className="hidden sm:inline">Prepare, present, and level up your skills together.</span>
          </p>
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-cyan-400 text-xs font-semibold uppercase tracking-widest">Current Presenter</span>
            {showFacilitatorName ? (
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-wide drop-shadow-lg animate-pulse">
                {teamMembers[facilitatorIndex]}
              </span>
            ) : (
              <span className="text-xl text-gray-300 italic">Facilitator will be revealed at 8:00 PM CAT</span>
            )}
            {/* Next Meeting Info (moved into hero section) */}
            <span className="mt-4 text-base sm:text-lg leading-relaxed text-cyan-200 bg-gray-900/60 rounded px-4 py-2 shadow border border-cyan-700/20">
              <strong>Next Meeting:</strong> {nextMeetingDate}
            </span>
          </div>
        </section>

        {/* Topics Section (custom order for demo) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Previous Topic: Week 2 */}
          <div className="flex flex-col items-start bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 min-h-[200px] w-full border border-cyan-700/30 transition-transform hover:scale-[1.03] hover:shadow-xl overflow-visible max-w-lg mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Previous</span>
            <span className="font-semibold text-base sm:text-lg text-cyan-200 mb-1 truncate w-full" title={timetable[1].week}>{timetable[1].week}</span>
            <span className="text-sm sm:text-base text-white font-medium mb-2 truncate w-full" title={timetable[1].title}>{timetable[1].title}</span>
            <ul className="list-disc pl-5 text-sm text-cyan-100 space-y-1 mt-2">
              {timetable[1].details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          {/* Current Topic: Week 3 */}
          <div className="flex flex-col items-start bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 min-h-[200px] w-full border border-cyan-700/30 transition-transform hover:scale-[1.03] hover:shadow-xl overflow-visible max-w-lg mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Current</span>
            <span className="font-semibold text-base sm:text-lg text-cyan-200 mb-1 truncate w-full" title={timetable[2].week}>{timetable[2].week}</span>
            <span className="text-sm sm:text-base text-white font-medium mb-2 truncate w-full" title={timetable[2].title}>{timetable[2].title}</span>
            <ul className="list-disc pl-5 text-sm text-cyan-100 space-y-1 mt-2">
              {timetable[2].details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          {/* Next Topic: Week 3 part 2 (custom, not in timetable) */}
          <div className="flex flex-col items-start bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 min-h-[200px] w-full border border-cyan-700/30 transition-transform hover:scale-[1.03] hover:shadow-xl overflow-visible max-w-lg mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Next</span>
            <span className="font-semibold text-base sm:text-lg text-cyan-200 mb-1 truncate w-full" title="Week 3 (Part 2)">Week 3 (Part 2)</span>
            <span className="text-sm sm:text-base text-white font-medium mb-2 truncate w-full" title="Domain 3: Scanning Networks (Continued)">Domain 3: Scanning Networks (Continued)</span>
            <ul className="list-disc pl-5 text-sm text-cyan-100 space-y-1 mt-2">
              <li>Advanced Nmap scripting</li>
              <li>Banner grabbing, OS fingerprinting</li>
              <li>Lab: Deep scan and analysis</li>
            </ul>
          </div>
        </div>

        {/* Reveal All Topics Button */}
        <div className="flex justify-center mt-4 w-full">
          <button
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onClick={() => setShowAllTopics((prev) => !prev)}
            aria-expanded={showAllTopics ? "true" : "false"}
            aria-controls="all-topics-accordion"
          >
            {showAllTopics ? 'Hide Full Schedule' : 'Show Full Schedule'}
          </button>
        </div>

        {/* All Topics Accordion */}
        {showAllTopics && (
          <div id="all-topics-accordion" className="w-full mt-4 space-y-2">
            {timetable.map((week, idx) => (
              <div key={week.week} className="bg-gray-800 rounded-lg shadow border border-cyan-700/20">
                <button
           
                  className="w-full flex justify-between items-center px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  onClick={() => setOpenWeek(openWeek === idx ? null : idx)}
                  aria-expanded={openWeek === idx ? true : false}
                  aria-controls={`week-details-${idx}`}
                >
                  <span className="font-semibold text-cyan-300 text-sm sm:text-base truncate" title={week.week}>{week.week}</span>
                  <span className="ml-2 text-cyan-100 text-xs sm:text-sm font-medium truncate" title={week.title}>{week.title}</span>
                  <span className="ml-auto text-cyan-400 text-lg">{openWeek === idx ? '−' : '+'}</span>
                </button>
                {openWeek === idx && (
                  <div id={`week-details-${idx}`} className="px-6 pb-4 pt-1 animate-fade-in">
                    <ul className="list-disc pl-5 text-sm text-cyan-100 space-y-1">
                      {week.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Next Meeting Info (removed, now in hero section) */}
      </div>
    </div>
  );
}
 