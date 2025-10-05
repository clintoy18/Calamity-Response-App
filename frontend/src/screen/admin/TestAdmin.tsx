import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL; // make sure this is set in your env
const token = localStorage.getItem("token"); // adjust depending on your auth storage
const AWS_BASE_URL = import.meta.env.VITE_AWS_BASE_URL;

interface User {
  _id: string;
  fullName: string;
  verificationDocument?: string;
}

// Utility to extract the S3 key from the full URL
function extractS3Key(url: string): string {
  try {
    console.log(API_BASE);
    console.log(AWS_BASE_URL);
    const baseUrl = AWS_BASE_URL;
    return url.startsWith(baseUrl) ? url.replace(baseUrl, "") : url;
  } catch {
    return url; // fallback in case it's already just a key
  }
}

function TestAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  console.log("Mounted TestAdmin");

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.responders);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // When a user is selected, fetch presigned URL
  const handleOpenModal = async (user: User) => {
    setSelectedUser(user);
    setImgUrl(null);
    setShowModal(true);

    if (user.verificationDocument) {
      try {
        const key = extractS3Key(user.verificationDocument); // 🔑 use key only
        const res = await axios.get(
          `${API_BASE}/files/presign?key=${encodeURIComponent(key)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setImgUrl(res.data.url);
      } catch (err) {
        console.error("Error fetching presigned URL:", err);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Users</h1>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Full Name</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.fullName}</td>
              <td className="border px-4 py-2">
                {user.verificationDocument ? (
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleOpenModal(user)}
                  >
                    View Document
                  </button>
                ) : (
                  <span>No Document</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {selectedUser.fullName} - Verification Document
            </h2>
            {imgUrl ? (
              <img
                src={imgUrl}
                alt="Verification Document"
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TestAdmin;
