"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import PreviewReportG from "@/components/PreviewReportG";
import { toast } from "sonner";
import { SessionStore } from "@/auth/session";

const ViewGross = ({ session }: { session: SessionStore }) => {
  const router = useRouter();
  // const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [grossStartDate, setGrossStartDate] = useState<Date | null>(null);
  const [grossEndDate, setGrossEndDate] = useState<Date | null>(null);

  // This function calculates the start date based on the end date (6 days before)
  const calculateStartDate = (end: Date) => {
    const date = new Date(end);
    date.setDate(date.getDate() - 6); // Subtract 6 days from the end date to get the start date (previous Sunday)
    return date;
  };

  const [tripData, setTripData] = useState([]);
  const [totalsId, setTotalsId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [totalsCalculated, setTotalsCalculated] = useState(false);

  useEffect(() => {
    if (grossEndDate) {
      const newStartDate = calculateStartDate(grossEndDate); // Calculate start date based on the end date
      setGrossStartDate(newStartDate); // Set the start date to 6 days before the end date (previous Sunday)
    }
  }, [grossEndDate]);

  // Fetch trips with salaries within selected date range
  useEffect(() => {
    if (grossStartDate && grossEndDate) {
      const query = new URLSearchParams({
        start_date: grossStartDate.toLocaleDateString("en-CA"), // Format date as 'YYYY-MM-DD'
        end_date: grossEndDate.toLocaleDateString("en-CA"), // Format date as 'YYYY-MM-DD'
      });

      fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/trips-by-date-range/?${query}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched Trip Data:", data);
          setTripData(data);
        })
        .catch((err) => console.error("Failed to fetch trips:", err));
    }
  }, [grossStartDate, grossEndDate]);

  // Trigger gross totals calculation
  const handleCalculateTotals = async () => {
  if (!grossStartDate || !grossEndDate) return;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/calculate_totals/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: grossStartDate.toLocaleDateString("en-CA"), // Format date as 'YYYY-MM-DD'
          end_date: grossEndDate.toLocaleDateString("en-CA"), // Format date as 'YYYY-MM-DD'
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("Calculated totals:", result);
      setTotalsId(result.id);
      setTotalsCalculated(true);
      toast.success("Gross totals calculated and saved.");
    } else {
      // Allow duplicate records (no error handling for UNIQUE constraint)
      toast.success("Totals recalculated successfully.");
    }
  } catch (err: any) {
    console.error("Error calculating totals:", err);
    toast.error("Something went wrong during calculation.");
  }
};


  const clearAll = () => {
    setGrossStartDate(null);
    setGrossEndDate(null);
    setTripData([]);
    setTotalsId(null);
    setTotalsCalculated(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-4 sm:px-6 lg:px-10 py-8">
      <div className="wrapper w-full max-w-2xl p-6 sm:p-8 rounded-2xl shadow-lg bg-black/20">
        {/* Back Button */}
        <div className="self-start mb-2">
          <button
            onClick={() => router.push("/dashboard/admin/managepayroll")}
            className="transition hover:opacity-80"
          >
            <Image
              src="/Back.png"
              alt="Back to Manage Payroll"
              width={30}
              height={30}
            />
          </button>
        </div>

        {/* Title */}
        <h1 className="text-center text-3xl font-semibold text-black/50 mb-6 tracking-[0.1em]">
          GROSS PAYROLL
        </h1>

        <div className="flex gap-4 mb-6 items-end">
          {/* Start Date Picker */}
          <div className="w-1/2">
            <label className="block text-sm text-black mb-1 font-bold">
              Start Date
            </label>
            <DatePicker
              selected={grossStartDate}
              onChange={(date) => {
                if (date) {
                  const today = new Date();
                  const calculatedEnd = new Date(date);
                  calculatedEnd.setDate(calculatedEnd.getDate() + 6); // 7-day range

                  setGrossStartDate(date);

                  if (calculatedEnd > today) {
                    toast.info("End date adjusted to today since it exceeds the current date.");
                    setGrossEndDate(today);
                  } else {
                    setGrossEndDate(calculatedEnd);
                  }
                }
              }}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select start date"
              className="w-full px-4 py-2 rounded-md shadow-md text-black cursor-pointer bg-white"
              filterDate={(date) => {
                const today = new Date();
                const isSaturday = date.getDay() === 6;
                const isPastOrToday = date <= today;
                return isSaturday && isPastOrToday;
              }}
            />
          </div>

          {/* End Date Picker (Disabled, Auto-calculated) */}
          <div className="w-1/2">
            <label className="block text-sm text-black mb-1 font-bold">
              End Date (Auto)
            </label>
            <DatePicker
              selected={grossEndDate}
              onChange={() => {}}
              dateFormat="MMMM d, yyyy"
              className="w-full px-4 py-2 rounded-md shadow-md text-black bg-gray-100 cursor-not-allowed"
              disabled
              placeholderText="End date (Auto)"
            />
          </div>

          {/* Clear Button */}
          <div className="pb-1">
            <button
              onClick={clearAll}
              className={`py-2 px-4 rounded-lg shadow text-white ${
                !grossStartDate && !grossEndDate
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#668743] hover:bg-[#345216]"
              }`}
            >
              Clear
            </button>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleCalculateTotals}
            disabled={!grossStartDate || !grossEndDate || totalsCalculated} // Disable if totals calculated
            className={`py-2 px-4 rounded-lg shadow text-white ${!grossStartDate || !grossEndDate || totalsCalculated ? "bg-gray-400 cursor-not-allowed" : "bg-[#668743] hover:bg-[#345216]"}`}
          >
            Calculate Totals
          </button>

          <button
            onClick={() => setShowPreview(true)}
            disabled={!grossStartDate || !grossEndDate}
            className={`py-2 px-4 rounded-lg shadow text-white ${!grossStartDate || !grossEndDate ? "bg-gray-400 cursor-not-allowed" : "bg-[#668743] hover:bg-[#345216]"}`}
          >
            Preview Gross Payroll
          </button>
        </div>

        {showPreview && (
          <PreviewReportG
            session={session}
            start={
              grossStartDate ? grossStartDate.toLocaleDateString("en-CA") : ""
            }
            end={grossEndDate ? grossEndDate.toLocaleDateString("en-CA") : ""}
            // employee={currentUser.username}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ViewGross;
