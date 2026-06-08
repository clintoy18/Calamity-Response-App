import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, AlertTriangle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
      <h1 className="text-4xl font-bold text-blue-900 mb-2">
        Aidvocate
      </h1>
      <p className="text-gray-600 mb-6 text-lg">
        General Santos Calamity Response & Community Alert System
      </p>

      <div className="flex gap-4">
        <Link
          to="/emergency"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg shadow hover:bg-blue-700 transition"
        >
          <AlertTriangle className="inline mr-2" size={18} /> Enter App
        </Link>

        <Link
          to="/admin"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl text-lg hover:bg-blue-50 transition"
        >
          <ShieldCheck className="inline mr-2" size={18} /> Admin Login
        </Link>
      </div>

      <footer className="mt-10 text-sm text-gray-400">
        <MapPin className="inline mr-1" size={14} /> General Santos, Philippines
      </footer>
    </div>
  );
}
