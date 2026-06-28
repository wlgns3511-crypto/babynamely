"use client";

import { useState, useEffect } from "react";

interface Props {
  firstName?: string;
  gender?: string;
}

export function MiddleNameCalculator({ firstName = "Emma", gender = "girl" }: Props) {
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [initials, setInitials] = useState("");
  const [acronymWarning, setAcronymWarning] = useState("");
  const [flowFeedback, setFlowFeedback] = useState("");
  const [collisionWarning, setCollisionWarning] = useState("");
  const [score, setScore] = useState(100);

  // Simple English syllable counter heuristic
  function countSyllables(word: string): number {
    word = word.toLowerCase().trim();
    if (!word) return 0;
    if (word.length <= 3) return 1;
    // Remove quiet endings
    word = word.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  // Common acronyms that could be unfortunate
  const UNFORTUNATE_ACRONYMS = new Set([
    "ASS", "BAD", "BUM", "DIE", "DUD", "FAT", "FAG", "GAY", "HEL", "ILL", 
    "MAD", "PEE", "PIG", "POO", "PUS", "SAD", "SOB", "TIT", "WTF", "WTG",
    "SOS", "SEX", "FEA", "SUX", "CON", "CRAP"
  ]);

  useEffect(() => {
    const fInitial = firstName.trim().charAt(0).toUpperCase();
    const mInitial = middleName.trim().charAt(0).toUpperCase();
    const lInitial = lastName.trim().charAt(0).toUpperCase();

    let calculatedInitials = fInitial;
    if (mInitial) calculatedInitials += mInitial;
    if (lInitial) calculatedInitials += lInitial;
    setInitials(calculatedInitials);

    let newScore = 100;

    // 1. Acronym Warning Check
    if (calculatedInitials.length === 3 && UNFORTUNATE_ACRONYMS.has(calculatedInitials)) {
      setAcronymWarning(`Warning: Initials spell "${calculatedInitials}", which is an unfortunate acronym.`);
      newScore -= 30;
    } else {
      setAcronymWarning("");
    }

    // 2. Vowel/Consonant Collision Check
    if (middleName.trim()) {
      const fName = firstName.trim().toLowerCase();
      const mName = middleName.trim().toLowerCase();
      const lastCharF = fName.charAt(fName.length - 1);
      const firstCharM = mName.charAt(0);

      if (lastCharF === firstCharM) {
        setCollisionWarning(`Phonetic warning: "${firstName}" ends with '${lastCharF}' and "${middleName}" starts with '${firstCharM}'. Saying them together might sound repetitive.`);
        newScore -= 10;
      } else {
        setCollisionWarning("");
      }
    } else {
      setCollisionWarning("");
    }

    // 3. Flow & Syllables Check
    if (middleName.trim() && lastName.trim()) {
      const fSyl = countSyllables(firstName);
      const mSyl = countSyllables(middleName);
      const lSyl = countSyllables(lastName);

      let rhythmDesc = "";
      if (fSyl === 2 && mSyl === 1 && lSyl === 1) {
        rhythmDesc = "2-1-1 rhythm. Crisp, classic, and punchy.";
        newScore += 5;
      } else if (fSyl === 2 && mSyl === 3 && lSyl === 1) {
        rhythmDesc = "2-3-1 rhythm. Highly elegant and balanced flow.";
        newScore += 10;
      } else if (fSyl === mSyl && mSyl === lSyl) {
        rhythmDesc = `${fSyl}-${mSyl}-${lSyl} rhythm. Having the same syllable count for all names can sometimes feel a bit monotonic.`;
        newScore -= 5;
      } else {
        rhythmDesc = `${fSyl}-${mSyl}-${lSyl} rhythm. A good standard name flow.`;
      }
      setFlowFeedback(rhythmDesc);
    } else {
      setFlowFeedback("");
    }

    // Clamp score
    setScore(Math.max(10, Math.min(100, newScore)));

  }, [middleName, lastName, firstName]);

  return (
    <section className="my-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl">
      <h2 className="text-xl font-bold text-purple-900 mb-2">Middle Name Compatibility Calculator</h2>
      <p className="text-sm text-purple-700 mb-5">
        Check how well a middle name pairs with <strong>{firstName}</strong> based on initials, syllable count, and sound transitions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-purple-800 mb-1">First Name (Fixed)</label>
          <input
            type="text"
            value={firstName}
            disabled
            className="w-full px-3 py-2 border border-purple-200 bg-purple-100/50 text-purple-900 rounded-lg text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-purple-800 mb-1">Gender</label>
          <span className={`inline-block mt-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            gender === "boy" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
          }`}>
            {gender === "boy" ? "Boy" : "Girl"}
          </span>
        </div>
        <div>
          <label htmlFor="middle-name-input" className="block text-xs font-semibold text-purple-800 mb-1">Proposed Middle Name</label>
          <input
            id="middle-name-input"
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="e.g. Grace"
            className="w-full px-3 py-2 border border-purple-200 bg-white text-slate-800 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
          />
        </div>
        <div>
          <label htmlFor="last-name-input" className="block text-xs font-semibold text-purple-800 mb-1">Last Name</label>
          <input
            id="last-name-input"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Smith"
            className="w-full px-3 py-2 border border-purple-200 bg-white text-slate-800 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
          />
        </div>
      </div>

      {(middleName.trim() || lastName.trim()) && (
        <div className="p-4 bg-white border border-purple-100 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-xs text-slate-400 block font-semibold uppercase">Full Name Combination</span>
              <span className="text-base font-bold text-slate-800">
                {firstName} {middleName || "_____"} {lastName || "_____"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold uppercase">Compatibility</span>
              <span className={`text-lg font-extrabold ${
                score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-500" : "text-rose-500"
              }`}>
                {score}/100
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            {initials && (
              <p className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Initials:</span> 
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-700 text-xs">
                  {initials}
                </span>
              </p>
            )}

            {acronymWarning ? (
              <p className="text-rose-600 text-xs font-medium bg-rose-50 border border-rose-100 p-2 rounded-lg">
                ⚠️ {acronymWarning}
              </p>
            ) : initials.length === 3 ? (
              <p className="text-emerald-600 text-xs font-medium bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                ✅ Initials are safe and free from common unfortunate acronyms.
              </p>
            ) : null}

            {collisionWarning && (
              <p className="text-amber-600 text-xs font-medium bg-amber-50 border border-amber-100 p-2 rounded-lg">
                ⚠️ {collisionWarning}
              </p>
            )}

            {flowFeedback && (
              <p className="text-indigo-900 text-xs bg-indigo-50 border border-indigo-100 p-2 rounded-lg">
                ℹ️ <strong>Rhythmic Flow:</strong> {flowFeedback}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
