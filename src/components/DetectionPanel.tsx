"use client";

import React from "react";
import { staltaDetect, DetectionParams } from "@/lib/detection";

export function DetectionPanel({
  times,
  activity,
  onEvents,
}: {
  times: number[];
  activity: number[];
  onEvents: (events: ReturnType<typeof staltaDetect>["events"]) => void;
}) {
  const [params, setParams] = React.useState<DetectionParams>({ staWindow: 20, ltaWindow: 200, triggerRatio: 3.0 });
  const [maxRatio, setMaxRatio] = React.useState(0);

  React.useEffect(() => {
    if (activity.length === 0) return;
    const { ratios, events } = staltaDetect(activity, times, params);
    setMaxRatio(Math.max(0, ...ratios));
    onEvents(events);
  }, [activity, times, params, onEvents]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm text-gray-600">STA window</label>
        <input
          type="number"
          className="mt-1 w-full rounded border px-3 py-2"
          value={params.staWindow}
          min={1}
          onChange={(e) => setParams((p) => ({ ...p, staWindow: Number(e.target.value) }))}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">LTA window</label>
        <input
          type="number"
          className="mt-1 w-full rounded border px-3 py-2"
          value={params.ltaWindow}
          min={2}
          onChange={(e) => setParams((p) => ({ ...p, ltaWindow: Number(e.target.value) }))}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Trigger ratio</label>
        <input
          type="number"
          step="0.1"
          className="mt-1 w-full rounded border px-3 py-2"
          value={params.triggerRatio}
          onChange={(e) => setParams((p) => ({ ...p, triggerRatio: Number(e.target.value) }))}
        />
      </div>
      <div className="col-span-3 text-sm text-gray-700">Max STA/LTA ratio: <span className="font-semibold">{maxRatio.toFixed(2)}</span></div>
    </div>
  );
}
