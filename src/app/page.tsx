"use client";

import React from "react";
import { FileUploader } from "@/components/FileUploader";
import { MultiLineChart } from "@/components/Charts";
import { DetectionPanel } from "@/components/DetectionPanel";
import { parseJonesCsv, computeMetrics } from "@/lib/jones";

export default function Home() {
  const [rawText, setRawText] = React.useState<string>("");
  const [times, setTimes] = React.useState<number[]>([]);
  const [detMag, setDetMag] = React.useState<number[]>([]);
  const [detPhase, setDetPhase] = React.useState<number[]>([]);
  const [frob, setFrob] = React.useState<number[]>([]);
  const [cond, setCond] = React.useState<number[]>([]);
  const [activity, setActivity] = React.useState<number[]>([]);
  const [events, setEvents] = React.useState<{ startTime: number; endTime: number | null; maxRatio: number }[]>([]);

  React.useEffect(() => {
    if (!rawText) return;
    const samples = parseJonesCsv(rawText);
    if (samples.length === 0) return;
    const m = computeMetrics(samples);
    setTimes(m.map((s) => s.t));
    setDetMag(m.map((s) => Math.log(s.detMag)));
    // unwrap phase for visualization
    let last = 0;
    const ph: number[] = [];
    for (const s of m) {
      let p = s.detPhase;
      if (ph.length) {
        let dp = p - last;
        while (dp > Math.PI) dp -= 2 * Math.PI;
        while (dp < -Math.PI) dp += 2 * Math.PI;
        p = last + dp;
      }
      ph.push(p);
      last = p;
    }
    setDetPhase(ph);
    setFrob(m.map((s) => s.frobNorm));
    setCond(m.map((s) => s.cond));
    setActivity(m.map((s) => s.activity));
  }, [rawText]);

  const seriesFrom = (y: number[]) => times.map((t, i) => ({ t, y: y[i] }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Fiber Earthquake Monitor (Jones Matrix)</h1>
        <p className="mt-1 text-sm text-zinc-600">Upload time-series of 2?2 complex Jones matrices to analyze polarization perturbations and detect seismic events.</p>

        <div className="mt-6">
          <FileUploader onText={setRawText} />
        </div>

        {times.length > 0 && (
          <div className="mt-8 space-y-10">
            <div>
              <h2 className="mb-2 font-medium">Metrics</h2>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-sm text-zinc-600">log |det(J)|</h3>
                  <MultiLineChart series={[seriesFrom(detMag)]} labels={["log|det|"]} />
                </div>
                <div className="rounded border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-sm text-zinc-600">det(J) phase (unwrapped, rad)</h3>
                  <MultiLineChart series={[seriesFrom(detPhase)]} labels={["phase"]} />
                </div>
                <div className="rounded border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-sm text-zinc-600">Frobenius norm</h3>
                  <MultiLineChart series={[seriesFrom(frob)]} labels={["?J?F"]} />
                </div>
                <div className="rounded border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-sm text-zinc-600">Condition number</h3>
                  <MultiLineChart series={[seriesFrom(cond)]} labels={["?(J)"]} />
                </div>
                <div className="rounded border bg-white p-4 shadow-sm lg:col-span-2">
                  <h3 className="mb-2 text-sm text-zinc-600">Activity proxy (? metrics)</h3>
                  <MultiLineChart series={[seriesFrom(activity)]} labels={["activity"]} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-2 font-medium">Earthquake Detection (STA/LTA)</h2>
              <div className="rounded border bg-white p-4 shadow-sm">
                <DetectionPanel
                  times={times}
                  activity={activity}
                  onEvents={(ev) => setEvents(ev.map((e) => ({ startTime: e.startTime, endTime: e.endTime, maxRatio: e.maxRatio })))}
                />
                <div className="mt-4 text-sm text-zinc-700">
                  {events.length === 0 ? (
                    <div>No events detected.</div>
                  ) : (
                    <ul className="list-disc pl-5">
                      {events.map((e, i) => (
                        <li key={i}>Event {i + 1}: start {e.startTime.toFixed(3)}{e.endTime ? `, end ${e.endTime.toFixed(3)}` : ", ongoing"} (max ratio {e.maxRatio.toFixed(2)})</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {times.length === 0 && (
          <div className="mt-8 rounded border bg-white p-6 text-sm text-zinc-700 shadow-sm">
            <p className="font-medium">Sample CSV format</p>
            <pre className="mt-2 overflow-auto rounded bg-zinc-50 p-3 text-xs">{`t,a_re,a_im,b_re,b_im,c_re,c_im,d_re,d_im\n0,1,0,0,0,0,0,1,0\n0.01,0.999,0.01,0.005,-0.002,-0.003,0.004,0.998,0.02`}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
