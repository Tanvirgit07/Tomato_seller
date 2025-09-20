/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // 👈 new import
import { toast } from "sonner";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 state for toggle
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        email: formData?.email,
        password: formData?.password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res?.error);
      }

      toast.success("Login Successfully !");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Image */}
      <div className="w-full lg:w-1/2 h-64 lg:h-auto relative">
        <Image
          src="/images/signupImage.jpg"
          alt="Sign Up Illustration"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-8 left-8 z-10">
          <div className="flex items-center space-x-2">
            <div className="h-[70px] w-[70px] flex items-center justify-center">
              <Image
                src="/images/source.gif"
                width={200}
                height={200}
                className="object-cover"
                alt="logo image"
              />
            </div>
            <span className="text-2xl font-bold text-white">
              T<span className="text-red-400">O</span>MAT
              <span className="text-red-400">O</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-start p-6 bg-gray-50">
        <div className="w-full max-w-2xl">
          <CardHeader className="text-start">
            <CardTitle className="lg:text-[40px] md:text-[30px] text-[24px] font-semibold leading-[120%] text-[#000000]">
              Welcome 👋
            </CardTitle>
            <p className="text-[#B0B0B0] text-base leading-[120%] font-normal mb-8">
              Please enter your details
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-[51px] border border-[#272727] mt-2"
                />
              </div>

              {/* Password with eye toggle */}
              <div>
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-[51px] border border-[#272727] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between mt-2 pb-7">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    className="w-5 h-5 rounded-sm border-gray-300 text-red-600 focus:ring-red-500"
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        rememberMe: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-700">
                    Remember Me
                  </Label>
                </div>

                <Link href="/forgot-password">
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  Forgot Password?
                </button>
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-base h-[51px] bg-[#EF1A26] hover:bg-[#ee5e65] text-white py-2 rounded-md transition"
              >
                {isLoading ? "Sign In..." : "Sign in "}
              </Button>

              {/* Sign up link */}
              <p className="text-xs text-gray-500 mt-1 text-center">
                Don’t have an account?{" "}
                <Link href="/signup" className="text-red-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
