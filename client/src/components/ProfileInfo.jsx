import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast"; // Add this import for toast notifications

export const ProfileInfo = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/user/${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({}); // Track errors for each field

  useEffect(() => {
    if (data) {
      setUsername(data.username || "");
      setEmail(data.email || "");
      setGender(data.gender || "Male");
      setPhone(data.phone || "");
      setAddress(data.address || "");
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axios.put(`/api/user/${user?.id}`, updatedData);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message); // Toast success message
      queryClient.invalidateQueries(["user", user?.id]); // refetch updated data
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage); // Toast error message
    },
  });

  const handleUpdate = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!address.trim()) newErrors.address = "Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the highlighted fields");
      return;
    }

    if (
      username === data.username &&
      gender === data.gender?.toLowerCase() &&
      phone === data.phone &&
      address === data.address
    ) {
      toast.error("No changes in the data detected");
      return;
    }

    setErrors({});
    mutation.mutate({ username, email, gender, phone, address });
  };

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error)
    return <p className="text-red-500 text-center">Error: {error.message}</p>;

  return (
    <div className="w-full flex justify-center py-10 text-base-content transition-colors duration-300">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-xl bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 space-y-5 border border-gray-300 dark:border-gray-700"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          Profile Info
        </h2>

        <InputField
          label="Username"
          value={username}
          onChange={setUsername}
          error={errors.username}
        />
        <InputField
          label="Email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          disabled={true}
        />
        <GenderField
          gender={gender}
          onChange={setGender}
          error={errors.gender}
        />
        <InputField
          label="Phone"
          value={phone}
          onChange={setPhone}
          error={errors.phone}
        />
        <InputField
          label="Address"
          value={address}
          onChange={setAddress}
          error={errors.address}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-400 transition-all"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Saving..." : "Edit"}
          </button>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, value, onChange, error, disabled = false }) => {
  const id = label.toLowerCase();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-sm">
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-md border ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 dark:border-gray-600 focus:ring-red-300"
        } bg-white dark:bg-gray-800 text-black dark:text-white outline-none focus:ring-2`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const GenderField = ({ gender, onChange, error }) => (
  <div className="flex flex-col gap-2">
    <span className="font-medium text-sm">Gender</span>
    <div className="flex gap-6">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="gender"
          value="male"
          checked={gender === "male"}
          onChange={(e) => onChange(e.target.value)}
          className="accent-red-500"
        />
        <span>Male</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="gender"
          value="female"
          checked={gender === "female"}
          onChange={(e) => onChange(e.target.value)}
          className="accent-red-500"
        />
        <span>Female</span>
      </label>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
