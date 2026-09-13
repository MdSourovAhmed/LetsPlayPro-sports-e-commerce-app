
import React, { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { ShopContext } from "../contexts/ShopContext";

const Profile = () => {
  const { user, setUser } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      setPreview(user.profileImage || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreview(null);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let imageBase64 = preview || null;
      if (profileImage) {
        imageBase64 = await fileToBase64(profileImage);
      }

      const res = await api.put("/user/profile", {
        ...formData,
        profileImage: imageBase64,
      });

      if (res.data.user) {
        toast.success("Profile updated successfully!");
        setUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-start gap-8 w-[90%] sm:w-[80%] mx-auto mt-10 pb-10">
      {/* Left Section */}
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-4 w-full sm:max-w-[500px] text-gray-700"
      >
        <p className="text-2xl font-semibold mb-2">Profile Information</p>
        <hr className="border-gray-300" />
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-500">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            disabled={!isEditing}
            onChange={handleChange}
            className={`border border-gray-300 rounded px-3 py-2 ${
              !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />

          <label className="text-sm text-gray-500">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />

          <label className="text-sm text-gray-500">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            disabled={!isEditing}
            onChange={handleChange}
            className={`border border-gray-300 rounded px-3 py-2 ${
              !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />

          <label className="text-sm text-gray-500">Address</label>
          <textarea
            name="address"
            value={formData.address}
            disabled={!isEditing}
            onChange={handleChange}
            rows={3}
            className={`border border-gray-300 rounded px-3 py-2 ${
              !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          ></textarea>
        </div>

        {isEditing ? (
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="border border-gray-400 py-2 px-6 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 mt-4"
          >
            Edit Profile
          </button>
        )}
      </form>

      {/* Right Section: Profile Picture */}
      <div className="flex flex-col items-center gap-4 w-full sm:w-[250px] mt-8 sm:mt-0">
        <p className="text-lg font-medium">Profile Picture</p>
        <div className="relative w-40 h-40 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-3">
            <label className="bg-gray-800 text-white text-sm px-4 py-2 rounded cursor-pointer">
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {preview && (
              <button
                onClick={handleRemoveImage}
                type="button"
                className="border border-gray-400 text-sm px-4 py-2 rounded hover:bg-gray-100"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
