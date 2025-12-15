"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { questionnaires, normalizeToFive } from "../../../lib/questionnaires";
import { computeGlobalScore } from "../../../lib/score";
import { organizations } from "../../../lib/mockData";

export default function QcmPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [incomplete, setIncomplete] = useState(false);

  function selectAnswer(qid: string, value: number) {
    setAnswers((s) => ({ ...s, [qid]: value }));
    setIncomplete(false);
  }

  function submit() {
    // validate all questions answered
    const sectorKey = (organizations.find(o => o.id === id)?.sector) || 'health';
    const domainMap = questionnaires[sectorKey === 'bank' ? 'finance' : sectorKey]?.domains || {};
    const allQuestions = Object.values(domainMap).flatMap(d => d.questions);
    if (Object.keys(answers).length < allQuestions.length) {
      setIncomplete(true);
      return;
    }

    // compute domain scores normalized to 0..5
    const domainScores: Record<string, number> = {};
    for (const [dcode, dset] of Object.entries(domainMap)) {
      const qs = dset.questions;
      const vals: number[] = [];
      for (const q of qs) {
        const raw = answers[q.id];
        const v = typeof raw === 'number' ? raw : 0;
        vals.push(normalizeToFive(v, q.scaleMax));
      }
      const avg = vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length) : 0;
      domainScores[dcode] = Math.round(avg * 100) / 100;
    }

    // compute global score (0..5)
    const sectorForScore = (organizations.find(o => o.id === id)?.sector) || undefined;
    const global = computeGlobalScore(domainScores as any, sectorForScore) || 0;

    // push a mock audit and update org domain scores (in-memory)
    const org = organizations.find(o => o.id === id);
    if (org) {
      const date = new Date().toISOString().slice(0,10);
      const percent = Math.round((global / 5) * 100);
      org.audits = [{ id: `qcm-${Date.now()}`, date, score: percent, title: 'QCM Rapide' }, ...(org.audits || [])];
      org.domainScores = { ...org.domainScores, ...domainScores } as any;
      org.lastAudit = date;
    }

    setSubmitted(true);
    setTimeout(() => router.push(`/organizations/${id}`), 1200);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white card-soft p-8 rounded-xl text-center">
          <h2 className="text-xl font-semibold mb-4">Analyse envoyée</h2>
          <p className="text-gray-600">Merci — vos réponses ont été enregistrées. Retour au dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="app-container px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Démarrer une analyse</h1>
          <div>
            <button onClick={() => router.push(`/organizations/${id}`)} className="px-3 py-2 rounded bg-gray-100">Annuler</button>
          </div>
        </div>

        <main>
          <div className="max-w-3xl mx-auto bg-white card-soft p-8 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Questionnaire rapide</h2>

            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-6">
              {
                // build domain-based questions for this org sector
                (() => {
                  const sectorKey = (organizations.find(o => o.id === id)?.sector) || 'health';
                  const key = sectorKey === 'bank' ? 'finance' : sectorKey;
                  const domainMap = questionnaires[key]?.domains || {};
                  const order = ['EDM','APO','BAI','DSS','MEA'];
                  let total = 0;
                  const blocks = order.map((dcode) => {
                    const ds = domainMap[dcode];
                    if (!ds) return null;
                    total += ds.questions.length;
                    return (
                      <section key={dcode} className="space-y-3">
                        <h3 className="text-sm font-semibold">{dcode} — {ds.name}</h3>
                        <div className="grid gap-3">
                          {ds.questions.map((q) => (
                            <fieldset key={q.id} className="border rounded p-4">
                              <legend className="font-medium">{q.id} — {q.text}</legend>
                              <div className="mt-3 flex flex-col gap-2">
                                {q.options.map((opt) => (
                                  <label key={opt.label} className={`p-2 rounded cursor-pointer ${answers[q.id] === opt.value ? 'bg-[#F0F5FF] border border-[#D2DAFF]' : 'hover:bg-gray-50'}`}>
                                    <input
                                      type="radio"
                                      name={q.id}
                                      value={String(opt.value)}
                                      checked={answers[q.id] === opt.value}
                                      onChange={() => selectAnswer(q.id, opt.value)}
                                      className="mr-3"
                                    />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                          ))}
                        </div>
                      </section>
                    );
                  });
                  // @ts-ignore show count via total computed above
                  return blocks;
                })()
              }

              {incomplete && <div className="text-sm text-red-600">Veuillez répondre à toutes les questions avant de soumettre.</div>}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{Object.keys(answers).length} répondu(s)</div>
                <button type="submit" className="px-4 py-2 bg-[#3B6BFF] text-white rounded-lg">Soumettre</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
