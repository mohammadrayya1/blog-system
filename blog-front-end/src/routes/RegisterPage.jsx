import { useRef, useState } from "react";
import { AxiosUser } from "../components/Api/Axios.jsx";

export default function RegisterPage() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((err) => ({ ...err, [name]: "" }));
        setSuccess("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setForm((f) => ({ ...f, image: file }));
        setErrors((err) => ({ ...err, image: "" }));
        setSuccess("");
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess("");


        if (!form.email || !form.password) {
            const newErrors = {};
            if (!form.email) newErrors.email = "Email is required";
            if (!form.password) newErrors.password = "Password is required";
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== "") {
                    formData.append(key, value);
                }
            });

            const res = await AxiosUser.post("/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });


            if (res?.data?.token) {
                localStorage.setItem("token", res.data.token);
            }

            setSuccess("✅ Account created successfully");
            setForm({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                image: null,
            });
            setImagePreview(null);
            if (fileRef.current) fileRef.current.value = "";
        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors && typeof apiErrors === "object") {
                setErrors(apiErrors);
            } else {
                setErrors({ general: "Error while registering" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Create Your Account
                </h1>

                {/* خطأ عام من السيرفر */}
                {errors.general && (
                    <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={form.firstName}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-xl ${
                                    errors.firstName ? "border-red-500" : ""
                                }`}
                            />
                            {errors.firstName && (
                                <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div className="w-1/2">
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={form.lastName}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-xl ${
                                    errors.lastName ? "border-red-500" : ""
                                }`}
                            />
                            {errors.lastName && (
                                <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className={`p-3 border rounded-xl w-full ${
                                errors.email ? "border-red-500" : ""
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min 8 chars)"
                            value={form.password}
                            onChange={handleChange}
                            className={`p-3 border rounded-xl w-full ${
                                errors.password ? "border-red-500" : ""
                            }`}
                        />
                        {errors.password && (
                            <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={handleChange}
                            className={`p-3 border rounded-xl w-full ${
                                errors.phone ? "border-red-500" : ""
                            }`}
                        />
                        {errors.phone && (
                            <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>

                    <div>
            <textarea
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className={`p-3 border rounded-xl w-full ${
                    errors.address ? "border-red-500" : ""
                }`}
            />
                        {errors.address && (
                            <p className="text-red-600 text-xs mt-1">{errors.address}</p>
                        )}
                    </div>

                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={`p-3 border rounded-xl w-full ${
                                errors.image ? "border-red-500" : ""
                            }`}
                        />
                        {errors.image && (
                            <p className="text-red-600 text-xs mt-1">{errors.image}</p>
                        )}

                        {imagePreview && (
                            <div className="mt-3">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-xl border"
                                />
                            </div>
                        )}
                    </div>

                    {success && (
                        <p className="text-green-600 text-sm mt-2">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl ${
                            loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
