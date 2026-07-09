import React, { useState } from "react";
import { Send, ShieldAlert } from "lucide-react";
import { useCreateVolcanoAdvisory } from "../../hooks/queries/useAdmin";
import type { VolcanoAdvisoryPayload } from "../../types";

const splitLines = (value: string): string[] =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export const VolcanoAdvisoryForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [alertLevel, setAlertLevel] = useState("");
  const [sourceName, setSourceName] = useState("PHIVOLCS / LGU advisory");
  const [sourceUrl, setSourceUrl] = useState("");
  const [affectedAreas, setAffectedAreas] = useState("");
  const [summary, setSummary] = useState("");
  const [instructions, setInstructions] = useState(
    "Stay indoors while ash is falling.\nUse a mask or cloth over nose and mouth if outside.\nAvoid unnecessary driving."
  );
  const [message, setMessage] = useState("");
  const createAdvisory = useCreateVolcanoAdvisory();

  const resetForm = () => {
    setTitle("");
    setAlertLevel("");
    setSourceUrl("");
    setAffectedAreas("");
    setSummary("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const payload: VolcanoAdvisoryPayload = {
      volcanoName: "Kanlaon Volcano",
      title,
      alertLevel,
      sourceName,
      sourceUrl,
      affectedAreas: splitLines(affectedAreas),
      summary,
      instructions: splitLines(instructions),
    };

    try {
      await createAdvisory.mutateAsync(payload);
      setMessage("Advisory published. It is now visible on the public map.");
      resetForm();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to publish advisory.";
      setMessage(text);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-950">Publish Volcano Advisory</h3>
          <p className="text-sm text-gray-600">
            Use only official PHIVOLCS, LGU, or response-team guidance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-800">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Kanlaon ashfall advisory"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-800">
          Alert level or status
          <input
            value={alertLevel}
            onChange={(event) => setAlertLevel(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Alert Level 2, Ashfall Advisory, etc."
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-800">
          Source name
          <input
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-800">
          Source URL
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="https://..."
          />
        </label>
      </div>

      <label className="mt-4 block space-y-1 text-sm font-medium text-gray-800">
        Summary
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Briefly state what people in affected areas need to know."
        />
      </label>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-800">
          Affected areas
          <textarea
            value={affectedAreas}
            onChange={(event) => setAffectedAreas(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Cebu City, Toledo, Talisay"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-800">
          Public instructions
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">{message}</p>
        <button
          type="submit"
          disabled={createAdvisory.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Send className="h-4 w-4" />
          {createAdvisory.isPending ? "Publishing..." : "Publish Advisory"}
        </button>
      </div>
    </form>
  );
};
