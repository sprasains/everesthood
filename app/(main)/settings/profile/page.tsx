"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BadgeList, Badge } from "@/components/ui/BadgeList";
import { useUser } from "@/hooks/useUser";
import { CircularProgress } from "@mui/material";

export default function ProfileSettings() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profilePicture: null,
    coverPicture: null,
  });
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/v1/users/${user.id}/badges`)
        .then((r) => r.json())
        .then((d) => setBadges(d.badges || []));
    }
  }, [user?.id]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const files = e.target.files;
    const file = files && files[0] ? files[0] : null;
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("bio", formData.bio);
    if (formData.profilePicture) {
      formDataToSend.append("profilePicture", formData.profilePicture);
    }
    if (formData.coverPicture) {
      formDataToSend.append("coverPicture", formData.coverPicture);
    }

    try {
      await axios.post("/api/v1/user/profile", formDataToSend);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading || !user) {
    return <CircularProgress />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <BadgeList badges={badges} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium">
            Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="coverPicture" className="block text-sm font-medium">
            Cover Picture
          </label>
          <input
            type="file"
            id="coverPicture"
            name="coverPicture"
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
