"use client";
import { useState } from "react";

export function CiteButton({ title, url, source }: { title: string; url: string; source: string }) {
  const [show, setShow] = useState(false);
  const year = new Date().getFullYear();
  const apa = `${source}. (${year}). ${title}. Retrieved from ${url}`;
  return (
    <div className="inline-block">
      <button onClick={() => setShow(!show)} className="text-xs text-slate-400 hover:text-slate-600 underline">
        Cite this page
      </button>
      {show && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border">
          <p className="font-medium mb-1">APA Citation:</p>
          <p className="select-all">{apa}</p>
        </div>
      )}
    </div>
  );
}
