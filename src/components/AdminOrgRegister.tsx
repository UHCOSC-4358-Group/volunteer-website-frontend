import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/user-context";
import * as zod from "zod";

// Zod schema based on backend validation
const locationSchema = zod.object({
  address: zod.string().min(1).max(255),
  city: zod.string().min(1).max(100),
  state: zod.string().min(2).max(50),
  zip_code: zod.string().min(5).max(20),
  country: zod.string().min(2).max(100),
});

const orgSchema = zod.object({
  name: zod.string().min(1).max(100),
  description: zod.string().min(10).max(800),
  location: locationSchema,
});

export default function AdminOrgRegister() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [zip, setZip] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const { user, loading } = useAuth();

  // Clean up the object URL when image changes or component unmounts
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setImageUrl(null);
      };
    } else {
      setImageUrl(null);
    }
  }, [image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  interface FormData {
    name: string;
    description: string;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
      zip_code: string;
    };
  }

  const validateForm = () => {
    setFieldErrors({});
    const result = orgSchema.safeParse({
      name,
      description,
      location: {
        address,
        city,
        state,
        country,
        zip_code: zip,
      },
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const zodErrors = result.error.issues;

      zodErrors.forEach((error) => {
        if (error.path[0] === "location") {
          fieldErrors[error.path[1] as string] = error.message;
        }
        fieldErrors[error.path[0] as string] = error.message;
      });

      console.log(zodErrors);

      setFieldErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const createFormData = () => {
    const formData = new FormData();

    const organization_obj: FormData = {
      name,
      description,
      location: {
        address,
        city,
        state,
        country,
        zip_code: zip,
      },
    };

    formData.append("org_data", JSON.stringify(organization_obj));
    if (image) formData.append("image", image);

    return formData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    const formData = createFormData();
    try {
      const response = await fetch("/api/org/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const content = await response.json();

      if (!response.ok) {
        throw Error(content.error.message);
      }
      navigate("/OrgDashboard");
    } catch (err) {
      setError(err as string);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        Loading...
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        You do not have access for this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl border-mint">
        <h1 className="text-2xl font-bold mb-4 text-center text-navy">
          Register Organization
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                fieldErrors.name ? "border-red-500" : ""
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {fieldErrors.name && (
              <div className="text-red-600 text-xs">{fieldErrors.name}</div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                fieldErrors.description ? "border-red-500" : ""
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            {fieldErrors.description && (
              <div className="text-red-600 text-xs">
                {fieldErrors.description}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                fieldErrors.address ? "border-red-500" : ""
              }`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            {fieldErrors.address && (
              <div className="text-red-600 text-xs">{fieldErrors.address}</div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block mb-1 font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                  fieldErrors.city ? "border-red-500" : ""
                }`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              {fieldErrors.city && (
                <div className="text-red-600 text-xs">{fieldErrors.city}</div>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                  fieldErrors.state ? "border-red-500" : ""
                }`}
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              {fieldErrors.state && (
                <div className="text-red-600 text-xs">{fieldErrors.state}</div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block mb-1 font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                className={`bg-gray-300 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                  fieldErrors.country ? "border-red-500" : ""
                }`}
                disabled
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
              {fieldErrors.country && (
                <div className="text-red-600 text-xs">
                  {fieldErrors.country}
                </div>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium text-gray-700">
                Zip Code
              </label>
              <input
                type="text"
                className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                  fieldErrors.zip_code ? "border-red-500" : ""
                }`}
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
              {fieldErrors.zip_code && (
                <div className="text-red-600 text-xs">
                  {fieldErrors.zip_code}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block mb-1 font-medium text-gray-700">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={handleImageChange}
            />
            {imageUrl && (
              <div className="mt-2 flex items-center gap-4 self-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-80 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  className="text-red-600 underline text-sm"
                  onClick={handleRemoveImage}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded-xl font-bold transition bg-[#38A3A5] text-white hover:opacity-90"
            disabled={formLoading}
          >
            {formLoading ? "Registering..." : "Register Organization"}
          </button>
        </form>
      </div>
    </div>
  );
}
